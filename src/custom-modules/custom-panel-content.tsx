/**
 * Custom panel content router.
 * Maps custom tab IDs to their panel components.
 */
import React, { Suspense } from 'react'
import type { ActiveRightSidebarTab } from '@/store/slices/editor'
import { isCustomSidebarTab } from './custom-right-sidebar-tabs'

// Lazy-load each panel so they don't bloat the main bundle
const IssuesPanel = React.lazy(() => import('./issues/panel'))
const PomodoroPanel = React.lazy(() => import('./pet-pomodoro/panel'))
const SnippetsPanel = React.lazy(() => import('./snippets/panel'))
const S3Panel = React.lazy(() => import('./s3/panel'))
const VoicePanel = React.lazy(() => import('./voice/panel'))

export function CustomPanelContent({
  tab
}: {
  tab: ActiveRightSidebarTab
}): React.JSX.Element | null {
  if (!isCustomSidebarTab(tab)) {
    return null
  }

  return (
    <Suspense fallback={<div className="p-4 text-muted-foreground text-sm">Loading…</div>}>
      {tab === 'issues' && <IssuesPanel />}
      {tab === 'pomodoro' && <PomodoroPanel />}
      {tab === 'snippets' && <SnippetsPanel />}
      {tab === 's3' && <S3Panel />}
      {tab === 'voice' && <VoicePanel />}
    </Suspense>
  )
}
