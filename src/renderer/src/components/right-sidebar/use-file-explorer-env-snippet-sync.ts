import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Repo } from '../../../../shared/repo-types'
import type { Worktree } from '../../../../shared/worktree/types'
import { branchName } from '@/lib/git-utils'
import { detectRepoIssueProvider } from './repo-issue-provider'
import { syncFileToSnippet } from './env-snippet-sync-actions'
import { getSyncedSnippetPaths, subscribeSyncedSnippets } from './env-snippet-sync-store'
import type { TreeNode } from './file-explorer-types'

export type ShareTargetWorktree = {
  id: string
  displayName: string
  branch: string
  path: string
}

export function useFileExplorerEnvSnippetSync(
  worktreePath: string | null,
  activeRepo: Repo | null,
  branch: string | undefined,
  otherWorktrees: Worktree[] = []
) {
  const explorerBranch = branchName(branch ?? '')
  const [syncedSnippetPaths, setSyncedSnippetPaths] = useState<ReadonlySet<string>>(() =>
    worktreePath ? getSyncedSnippetPaths(worktreePath, explorerBranch) : new Set<string>()
  )
  const [syncingPaths, setSyncingPaths] = useState<ReadonlySet<string>>(new Set<string>())

  useEffect(() => {
    if (!worktreePath) {
      setSyncedSnippetPaths(new Set<string>())
      return
    }
    const update = (): void => {
      setSyncedSnippetPaths(getSyncedSnippetPaths(worktreePath, explorerBranch))
    }
    update()
    return subscribeSyncedSnippets(() => {
      if (worktreePath) {
        setSyncedSnippetPaths(getSyncedSnippetPaths(worktreePath, explorerBranch))
      }
    })
  }, [worktreePath, explorerBranch])

  const handleSyncEnvToSnippet = useCallback(
    async (node: TreeNode, targetBranch?: string, targetName?: string) => {
      if (!activeRepo || detectRepoIssueProvider(activeRepo) !== 'gitlab' || !worktreePath) {
        return
      }
      const destBranch = targetBranch ? branchName(targetBranch) : explorerBranch
      const targetLabel = targetName ? ` (${targetName})` : destBranch ? ` [${destBranch}]` : ''
      setSyncingPaths((prev) => new Set([...prev, node.relativePath]))
      const toastId = toast.loading(`Syncing ${node.name} to GitLab snippet${targetLabel}...`)
      try {
        await syncFileToSnippet(
          { repo: activeRepo, worktreePath, connectionId: activeRepo.connectionId ?? null },
          node.path,
          node.relativePath,
          destBranch
        )
        toast.success(`Successfully synced ${node.name} to GitLab snippet${targetLabel}!`, {
          id: toastId
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : String(err), { id: toastId })
      } finally {
        setSyncingPaths((prev) => {
          const next = new Set(prev)
          next.delete(node.relativePath)
          return next
        })
      }
    },
    [activeRepo, explorerBranch, worktreePath]
  )

  const shareTargets = otherWorktrees
    .filter((w) => w.path !== worktreePath)
    .map((w) => ({
      id: w.id,
      displayName: w.displayName || branchName(w.branch),
      branch: branchName(w.branch),
      path: w.path
    }))

  return {
    syncedSnippetPaths,
    syncingPaths,
    shareTargets,
    handleSyncEnvToSnippet
  }
}
