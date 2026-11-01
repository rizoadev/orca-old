import type { Worktree } from '../../../../shared/worktree/types'
import { branchName } from '@/lib/git-utils'

export type EnvSnippetShareTarget = {
  id: string
  displayName: string
  branch: string
  path: string
}

/**
 * Worktrees in the same repo that a `.env` snippet can be shared to.
 *
 * Snippets are keyed `orca-sync:<branch>:<path>`, so a target is only meaningful
 * when it is a different checkout of the same repo on a different branch.
 */
export function resolveEnvSnippetShareTargets({
  worktrees,
  repoId,
  worktreePath,
  branch
}: {
  worktrees: readonly Worktree[]
  repoId: string
  worktreePath: string | null
  branch: string
}): EnvSnippetShareTarget[] {
  const seen = new Set<string>()
  const out: EnvSnippetShareTarget[] = []
  for (const worktree of worktrees) {
    if (worktree.repoId !== repoId) {
      continue
    }
    if (worktreePath !== null && worktree.path === worktreePath) {
      continue
    }
    const targetBranch = branchName(worktree.branch ?? '')
    if (!targetBranch || targetBranch === branch) {
      continue
    }
    // Why: two worktrees can share a branch name; the snippet key only holds the
    // branch, so one entry per branch keeps the menu from duplicating a target.
    if (seen.has(targetBranch)) {
      continue
    }
    seen.add(targetBranch)
    out.push({
      id: worktree.id,
      displayName: worktree.displayName || targetBranch,
      branch: targetBranch,
      path: worktree.path
    })
  }
  return out.sort((a, b) => a.displayName.localeCompare(b.displayName))
}
