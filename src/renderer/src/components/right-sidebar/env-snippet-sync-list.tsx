import {
  CloudUpload,
  CloudDownload,
  CheckCircle2,
  Circle,
  Eye,
  ExternalLink,
  GitBranch,
  LoaderCircle,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { GitLabSnippet } from '../../../../shared/gitlab-types'
import type { ShareTargetWorktree } from './use-file-explorer-env-snippet-sync'

export type SyncStatus = 'idle' | 'uploading' | 'downloading' | 'deleting'

export type SyncRow = {
  relativePath: string
  localFile: boolean
  snippet?: GitLabSnippet
  /** Set when the row belongs to another branch (a pull source, not a local upload). */
  branchLabel?: string
}

const NO_SHARE_TARGETS: ShareTargetWorktree[] = []
const NO_ROWS: SyncRow[] = []

export function EnvSnippetSyncList({
  rows,
  otherBranchRows = NO_ROWS,
  shareTargets = NO_SHARE_TARGETS,
  syncStatusByPath,
  onUpload,
  onRestore,
  onPreview,
  onDelete,
  onOpen
}: {
  rows: SyncRow[]
  otherBranchRows?: SyncRow[]
  shareTargets?: ShareTargetWorktree[]
  syncStatusByPath: Record<string, SyncStatus>
  onUpload: (relativePath: string, targetBranch?: string, targetName?: string) => void
  onRestore: (snippet: GitLabSnippet) => void
  onPreview: (snippet: GitLabSnippet) => void
  onDelete: (snippet: GitLabSnippet) => void
  onOpen: (url: string) => void
}): React.JSX.Element {
  return (
    <>
      <EnvSnippetRows
        rows={rows}
        shareTargets={shareTargets}
        syncStatusByPath={syncStatusByPath}
        onUpload={onUpload}
        onRestore={onRestore}
        onPreview={onPreview}
        onDelete={onDelete}
        onOpen={onOpen}
      />
      {otherBranchRows.length > 0 ? (
        <div className="mt-1 border-t border-sidebar-border/70 pt-1">
          <p className="px-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {translate(
              'auto.components.right.sidebar.EnvSnippetSyncSection.otherBranches',
              'Other branches'
            )}
          </p>
          <EnvSnippetRows
            rows={otherBranchRows}
            shareTargets={NO_SHARE_TARGETS}
            syncStatusByPath={syncStatusByPath}
            onUpload={onUpload}
            onRestore={onRestore}
            onPreview={onPreview}
            onDelete={onDelete}
            onOpen={onOpen}
          />
        </div>
      ) : null}
    </>
  )
}

function EnvSnippetRows({
  rows,
  shareTargets,
  syncStatusByPath,
  onUpload,
  onRestore,
  onPreview,
  onDelete,
  onOpen
}: {
  rows: SyncRow[]
  shareTargets: ShareTargetWorktree[]
  syncStatusByPath: Record<string, SyncStatus>
  onUpload: (relativePath: string, targetBranch?: string, targetName?: string) => void
  onRestore: (snippet: GitLabSnippet) => void
  onPreview: (snippet: GitLabSnippet) => void
  onDelete: (snippet: GitLabSnippet) => void
  onOpen: (url: string) => void
}): React.JSX.Element {
  return (
    <ul className="space-y-0.5">
      {rows.map(({ relativePath, localFile, snippet, branchLabel }) => {
        const synced = snippet !== undefined
        const rowKey = snippet ? `snippet-${snippet.id}` : `local-${relativePath}`
        const status = syncStatusByPath[relativePath] ?? 'idle'
        const busy = status === 'uploading' || status === 'downloading' || status === 'deleting'
        const snippetWebUrl = snippet?.webUrl ?? ''
        return (
          <li
            key={rowKey}
            className="flex items-center gap-1.5 rounded px-2 py-1.5 transition-colors hover:bg-sidebar-accent"
          >
            {synced ? (
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="h-3 w-3 shrink-0 text-muted-foreground/40" />
            )}
            <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
              {relativePath}
            </span>
            {branchLabel ? (
              <span
                className="flex shrink-0 items-center gap-0.5 rounded bg-sidebar-accent px-1 py-px text-[10px] text-muted-foreground"
                title={`Snippet on ${branchLabel}`}
              >
                <GitBranch className="h-2.5 w-2.5" />
                <span className="max-w-[92px] truncate">{branchLabel}</span>
              </span>
            ) : null}
            <div className="flex shrink-0 items-center gap-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={busy || !localFile}
                    title={translate(
                      'auto.components.right.sidebar.EnvSnippetSyncSection.pushTo',
                      'Sync to a branch…'
                    )}
                  >
                    {status === 'uploading' ? (
                      <LoaderCircle className="h-3 w-3 animate-spin text-muted-foreground" />
                    ) : (
                      <CloudUpload
                        className={cn(
                          'h-3 w-3',
                          localFile ? 'text-muted-foreground' : 'text-muted-foreground/30'
                        )}
                      />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {translate(
                      'auto.components.right.sidebar.EnvSnippetSyncSection.pushTo',
                      'Sync to a branch…'
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => onUpload(relativePath)}>
                    <CloudUpload />
                    <span className="truncate">
                      {translate(
                        'auto.components.right.sidebar.EnvSnippetSyncSection.pushCurrentBranch',
                        'This branch / workspace'
                      )}
                    </span>
                  </DropdownMenuItem>
                  {shareTargets.length > 0 ? <DropdownMenuSeparator /> : null}
                  {shareTargets.map((target) => (
                    <DropdownMenuItem
                      key={target.id}
                      onSelect={() => onUpload(relativePath, target.branch, target.displayName)}
                    >
                      <GitBranch />
                      <span className="truncate">{target.displayName}</span>
                      <span className="ml-auto max-w-[74px] truncate text-[11px] text-muted-foreground">
                        {target.branch}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={busy || !synced}
                onClick={() => snippet && onRestore(snippet)}
                title={translate(
                  'auto.components.right.sidebar.EnvSnippetSyncSection.pull',
                  'Restore from GitLab'
                )}
              >
                {status === 'downloading' ? (
                  <LoaderCircle className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <CloudDownload
                    className={cn(
                      'h-3 w-3',
                      synced ? 'text-muted-foreground' : 'text-muted-foreground/30'
                    )}
                  />
                )}
              </Button>
              {snippet ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={busy}
                  onClick={() => onPreview(snippet)}
                  title={translate(
                    'auto.components.right.sidebar.EnvSnippetSyncSection.preview',
                    'Preview diff vs local'
                  )}
                >
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </Button>
              ) : null}
              {snippetWebUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={busy}
                  onClick={() => onOpen(snippetWebUrl)}
                  title={translate(
                    'auto.components.right.sidebar.EnvSnippetSyncSection.openSnippet',
                    'Open snippet'
                  )}
                >
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Button>
              ) : null}
              {snippet ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  disabled={busy}
                  onClick={() => onDelete(snippet)}
                  title={translate(
                    'auto.components.right.sidebar.EnvSnippetSyncSection.delete',
                    'Delete snippet from GitLab'
                  )}
                >
                  {status === 'deleting' ? (
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
