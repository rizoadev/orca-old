import { describe, expect, it } from 'vitest'
import { STATIC_ACTIVE_RIGHT_SIDEBAR_TABS } from '../../../shared/right-sidebar-static-tabs'
import { normalizeRightSidebarRoute } from './right-sidebar-route'

describe('normalizeRightSidebarRoute', () => {
  it.each(STATIC_ACTIVE_RIGHT_SIDEBAR_TABS)(
    'keeps the built-in %s tab instead of falling back to explorer',
    (tab) => {
      expect(normalizeRightSidebarRoute(tab).rightSidebarTab).toBe(tab)
    }
  )

  it('maps the legacy search tab to the explorer search view', () => {
    expect(normalizeRightSidebarRoute('search')).toEqual({
      rightSidebarTab: 'explorer',
      rightSidebarExplorerView: 'search'
    })
  })
  it('preserves well-formed plugin panel tabs', () => {
    expect(normalizeRightSidebarRoute('plugin:samples.my-plugin/dashboard')).toEqual({
      rightSidebarTab: 'plugin:samples.my-plugin/dashboard',
      rightSidebarExplorerView: 'files'
    })
  })

  it('drops a well-formed tab once the installed plugin list proves it is stale', () => {
    expect(
      normalizeRightSidebarRoute('plugin:samples.removed/dashboard', undefined, {
        installedPluginTabKeys: new Set(['plugin:samples.present/dashboard'])
      })
    ).toEqual({
      rightSidebarTab: 'explorer',
      rightSidebarExplorerView: 'files'
    })
  })
})
