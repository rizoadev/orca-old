import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Repo } from '../../../../shared/repo-types'
import { branchName } from '@/lib/git-utils'
import { detectRepoIssueProvider } from './repo-issue-provider'
import { syncFileToSnippet } from './env-snippet-sync-actions'
import { getSyncedSnippetPaths, subscribeSyncedSnippets } from './env-snippet-sync-store'
import type { TreeNode } from './file-explorer-types'

export function useFileExplorerEnvSnippetSync(
  worktreePath: string | null,
  activeRepo: Repo | null,
  branch: string | undefined
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
    async (node: TreeNode) => {
      if (!activeRepo || detectRepoIssueProvider(activeRepo) !== 'gitlab' || !worktreePath) {
        return
      }
      setSyncingPaths((prev) => new Set([...prev, node.relativePath]))
      const toastId = toast.loading(`Syncing ${node.name} to GitLab snippet...`)
      try {
        await syncFileToSnippet(
          { repo: activeRepo, worktreePath, connectionId: activeRepo.connectionId ?? null },
          node.path,
          node.relativePath,
          explorerBranch
        )
        toast.success(`Successfully synced ${node.name} to GitLab snippet!`, { id: toastId })
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

  return {
    syncedSnippetPaths,
    syncingPaths,
    handleSyncEnvToSnippet
  }
}
