import { describe, expect, it } from 'vitest'
import type { Worktree } from '../../../../shared/worktree/types'
import { resolveEnvSnippetShareTargets } from './env-snippet-share-targets'

function worktree(overrides: Partial<Worktree> & { id: string }): Worktree {
  return {
    repoId: 'repo-1',
    path: `/w/${overrides.id}`,
    branch: `refs/heads/${overrides.id}`,
    displayName: overrides.id,
    isMainWorktree: false,
    ...overrides
  } as Worktree
}

describe('resolveEnvSnippetShareTargets', () => {
  it('lists another worktree on a different branch, minus its refs/heads prefix', () => {
    const targets = resolveEnvSnippetShareTargets({
      worktrees: [
        worktree({ id: 'main', path: '/w/main', branch: 'refs/heads/main', displayName: 'main' }),
        worktree({
          id: 'feat',
          path: '/w/feat',
          branch: 'refs/heads/feat/login',
          displayName: 'Login'
        })
      ],
      repoId: 'repo-1',
      worktreePath: '/w/main',
      branch: 'main'
    })

    expect(targets).toEqual([
      { id: 'feat', displayName: 'Login', branch: 'feat/login', path: '/w/feat' }
    ])
  })

  it('matches rows by repoId, not by the worktreesByRepo key shape', () => {
    // Why: SSH/twin hosts key the listing by a host-qualified repo id, so the
    // caller iterates every row and must keep only this repo's checkouts.
    const targets = resolveEnvSnippetShareTargets({
      worktrees: [
        worktree({ id: 'mine', repoId: 'repo-1', branch: 'refs/heads/other' }),
        worktree({ id: 'theirs', repoId: 'ssh:repo-1', branch: 'refs/heads/nope' })
      ],
      repoId: 'repo-1',
      worktreePath: '/w/current',
      branch: 'current'
    })

    expect(targets.map((target) => target.id)).toEqual(['mine'])
  })

  it('drops the active checkout, same-branch twins, detached heads and duplicates', () => {
    const targets = resolveEnvSnippetShareTargets({
      worktrees: [
        worktree({ id: 'active', path: '/w/active', branch: 'refs/heads/main' }),
        worktree({ id: 'same-branch', path: '/w/same', branch: 'refs/heads/main' }),
        worktree({ id: 'detached', path: '/w/detached', branch: '' }),
        worktree({ id: 'dup-a', path: '/w/dup-a', branch: 'refs/heads/release', displayName: 'A' }),
        worktree({ id: 'dup-b', path: '/w/dup-b', branch: 'refs/heads/release', displayName: 'B' })
      ],
      repoId: 'repo-1',
      worktreePath: '/w/active',
      branch: 'main'
    })

    // One entry per branch: the snippet key only stores the branch name.
    expect(targets).toHaveLength(1)
    expect(targets[0]).toMatchObject({ branch: 'release' })
  })

  it('sorts by the label the menu shows', () => {
    const targets = resolveEnvSnippetShareTargets({
      worktrees: [
        worktree({ id: 'z', branch: 'refs/heads/z', displayName: 'Zeta' }),
        worktree({ id: 'a', branch: 'refs/heads/a', displayName: 'Alpha' })
      ],
      repoId: 'repo-1',
      worktreePath: null,
      branch: ''
    })

    expect(targets.map((target) => target.displayName)).toEqual(['Alpha', 'Zeta'])
  })
})
