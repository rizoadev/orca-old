# Custom Modules

Modular features that extend upstream Orca. Each module is self-contained
and hooks into the app through well-defined extension points.

## Adding a module

1. Create `src/custom-modules/<name>/`
2. Export from `src/custom-modules/<name>/index.ts`
3. Register in the relevant extension points:
   - Right sidebar tab → `right-sidebar-custom-tabs.ts`
   - IPC handlers → `custom-ipc-handlers.ts`
   - Preload bridge → `custom-preload-bridge.ts`
   - Status bar → `custom-status-bar.ts`

## Modules

| Module       | Tab ID       | Description                                     |
| ------------ | ------------ | ----------------------------------------------- |
| issues       | issues       | Issues panel with AI plan, close/assign actions |
| pet-pomodoro | pomodoro     | Virtual pet hero + pomodoro timer               |
| snippets     | snippets     | GitLab snippets, env sync                       |
| s3           | s3           | S3 file browser + upload                        |
| cloudflare   | (status-bar) | Cloudflare relay tunnel                         |
| voice        | voice        | Gemini Live voice call                          |
