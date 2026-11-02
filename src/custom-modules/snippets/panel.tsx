import React from 'react'
import { Code2, KeyRound } from 'lucide-react'

export default function SnippetsPanel(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Code2 size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">Snippets</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
        <KeyRound size={32} className="text-muted-foreground/50" />
        <p className="text-center text-sm text-muted-foreground">GitLab snippets &amp; .env sync</p>
        <p className="text-center text-xs text-muted-foreground/70">
          Connect a GitLab repo to manage project snippets and sync environment variables across
          branches.
        </p>
      </div>
    </div>
  )
}
