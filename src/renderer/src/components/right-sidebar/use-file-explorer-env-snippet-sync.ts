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
    (node: TreeNode) => {
      if (!activeRepo || detectRepoIssueProvider(activeRepo) !== 'gitlab' || !worktreePath) {
        return
      }
      void syncFileToSnippet(
        { repo: activeRepo, worktreePath, connectionId: activeRepo.connectionId ?? null },
        node.path,
        node.relativePath,
        explorerBranch
      ).catch((err) => {
        toast.error(err instanceof Error ? err.message : String(err))
      })
    },
    [activeRepo, explorerBranch, worktreePath]
  )

  return {
    syncedSnippetPaths,
    handleSyncEnvToSnippet
  }
}
