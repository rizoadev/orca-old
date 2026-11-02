import React, { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronDown, KeyRound, RefreshCw, Loader2 } from 'lucide-react'
import { useActiveWorktree, useRepoById } from '@/store/selectors'
import { branchName } from '@/lib/git-utils'

type SnippetRow = {
  title: string
  path: string
  synced: boolean
}

export function FileExplorerSnippetSection(): React.JSX.Element | null {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [snippets, setSnippets] = useState<SnippetRow[]>([])
  const [isGitLab, setIsGitLab] = useState(false)
  const activeWorktree = useActiveWorktree()
  const repo = useRepoById(activeWorktree?.repoId ?? null)
  const branch = branchName(activeWorktree?.branch ?? '')

  // Detect GitLab repo
  useEffect(() => {
    if (!repo?.remoteUrl) {
      setIsGitLab(false)
      return
    }
    setIsGitLab(repo.remoteUrl.includes('gitlab'))
  }, [repo?.remoteUrl])

  const loadSnippets = useCallback(async () => {
    if (!window.api?.gl?.listProjectSnippets || !repo) {
      return
    }
    setLoading(true)
    try {
      const result = await window.api.gl.listProjectSnippets({
        repoId: repo.id,
        connectionId: activeWorktree?.connectionId ?? null
      })
      if (Array.isArray(result)) {
        setSnippets(
          result.map((s: { title: string }) => ({
            title: s.title,
            path: s.title.replace(/^env:/, '.'),
            synced: true
          }))
        )
      }
    } catch {
      // GitLab IPC not available yet
    } finally {
      setLoading(false)
    }
  }, [repo, activeWorktree?.connectionId])

  useEffect(() => {
    if (open && isGitLab) {
      loadSnippets()
    }
  }, [open, isGitLab, loadSnippets])

  if (!isGitLab) {
    return null
  }

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <KeyRound size={12} />
        <span>Env Snippets</span>
        {branch && <span className="ml-auto text-[10px] opacity-60">{branch}</span>}
      </button>
      {open && (
        <div className="px-3 pb-2">
          {loading ? (
            <div className="flex items-center gap-1.5 py-2 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" />
              Loading snippets…
            </div>
          ) : snippets.length > 0 ? (
            <div className="space-y-0.5">
              {snippets.map((s) => (
                <div
                  key={s.title}
                  className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs hover:bg-accent"
                >
                  <KeyRound size={10} className="shrink-0 text-yellow-500" />
                  <span className="truncate">{s.path}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-1 text-[11px] text-muted-foreground">
              No .env snippets synced for this branch.
            </p>
          )}
          <button
            onClick={loadSnippets}
            className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}
