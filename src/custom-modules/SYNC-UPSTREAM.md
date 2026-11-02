# Upstream Sync Workflow

## Pull latest upstream (do this regularly)

```bash
git fetch upstream
git merge upstream/main
# If conflicts in src/custom-modules/ — those are our files, keep ours
# If conflicts in extension points — merge carefully
```

## Extension points that hook custom modules into upstream

Only 3 files are modified from upstream:

1. **`src/shared/ui-chrome-types.ts`** — adds 5 custom tab IDs to `RightSidebarTab` union
2. **`src/renderer/src/components/right-sidebar/use-right-sidebar-activity-items.ts`** — imports + spreads `getCustomActivityItems()`
3. **`src/renderer/src/components/right-sidebar/right-sidebar-panel-content.tsx`** — imports + renders `<CustomPanelContent>`

## When upstream updates conflict

### ui-chrome-types.ts

Just re-add our tab IDs to the `RightSidebarTab` union:

```typescript
| 'issues' | 'pomodoro' | 'snippets' | 's3' | 'voice'
```

### use-right-sidebar-activity-items.ts

Just re-add the import and spread:

```typescript
import { getCustomActivityItems } from '../../../../custom-modules/custom-activity-items'
// In the activityItems array, before plugin items:
...getCustomActivityItems(),
```

### right-sidebar-panel-content.tsx

Just re-add the import and render:

```typescript
import { CustomPanelContent } from '../../../../custom-modules/custom-panel-content'
import { isCustomSidebarTab } from '../../../../custom-modules/custom-right-sidebar-tabs'
// Before plugin panel:
{isCustomSidebarTab(effectiveTab) && <CustomPanelContent tab={effectiveTab} />}
```

## Adding a new custom module

1. Create `src/custom-modules/<name>/`
2. Add tab ID to `custom-right-sidebar-tabs.ts`
3. Add activity item to `custom-activity-items.ts`
4. Add lazy import + render to `custom-panel-content.tsx`
5. Add tab ID to `ui-chrome-types.ts` union

## Removing a custom module

Reverse of adding — remove from the 4 registry files + delete directory.
