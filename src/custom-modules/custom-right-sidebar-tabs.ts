/**
 * Custom right-sidebar tab registry.
 *
 * Each entry adds a tab to the right sidebar activity bar
 * and maps it to a lazy-loaded panel component.
 *
 * To add a new tab:
 * 1. Add its ID to CUSTOM_SIDEBAR_TAB_IDS  
 * 2. Add an ActivityBarItem entry in getCustomActivityItems()
 * 3. Add a lazy component mapping in CUSTOM_TAB_COMPONENTS
 */
import type { ActiveRightSidebarTab } from '@/store/slices/editor'

// Custom tab IDs — extend the RightSidebarTab union in ui-chrome-types.ts
export const CUSTOM_SIDEBAR_TAB_IDS = ['issues', 'pomodoro', 'snippets', 's3', 'voice'] as const

export type CustomSidebarTabId = (typeof CUSTOM_SIDEBAR_TAB_IDS)[number]

export function isCustomSidebarTab(tab: ActiveRightSidebarTab): tab is CustomSidebarTabId {
  return (CUSTOM_SIDEBAR_TAB_IDS as readonly string[]).includes(tab)
}
