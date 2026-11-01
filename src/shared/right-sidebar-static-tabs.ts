import type { ActiveRightSidebarTab } from './ui-chrome-types'

/** The built-in tabs a user can open; plugin panel keys stay open-ended and validate by shape. */
export const STATIC_ACTIVE_RIGHT_SIDEBAR_TABS = [
  'explorer',
  'vault',
  'workspaces',
  'pr-checks',
  'source-control',
  'checks',
  'ports',
  'snippets',
  'pomodoro'
] as const satisfies readonly Exclude<ActiveRightSidebarTab, `plugin:${string}`>[]

export type StaticActiveRightSidebarTab = (typeof STATIC_ACTIVE_RIGHT_SIDEBAR_TABS)[number]

type UnlistedStaticTab = Exclude<
  Exclude<ActiveRightSidebarTab, `plugin:${string}`>,
  StaticActiveRightSidebarTab
>
// Compile-check the list against the union so a new built-in tab cannot be normalized away to Explorer.
const assertNoUnlistedStaticTab: UnlistedStaticTab extends never ? true : never = true
void assertNoUnlistedStaticTab

export function isStaticActiveRightSidebarTab(
  value: unknown
): value is StaticActiveRightSidebarTab {
  return typeof value === 'string' && STATIC_ACTIVE_RIGHT_SIDEBAR_TABS.some((tab) => tab === value)
}
