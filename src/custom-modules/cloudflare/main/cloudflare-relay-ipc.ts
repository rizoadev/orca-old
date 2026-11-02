/**
 * Cloudflare Relay IPC handlers — wires CloudflareRelayService into main
 * and exposes status/restart to the renderer via mobile:* IPC channel.
 */
import { app, ipcMain } from 'electron'
import { mainProcessState as state } from '../../../main/startup/main-process-state'
import { getCanonicalUserDataPath } from '../../../main/persistence/loading-store/user-data-path'
import { CloudflareRelayService } from './runtime/cloudflare-relay/cloudflare-relay'
import type { CloudflareRelayStatusPayload } from '../../../shared/cloudflare-relay-status'

let relay: CloudflareRelayService | null = null

function buildPayload(): CloudflareRelayStatusPayload {
  const settings = state.store?.getSettings()
  const configured = Boolean(settings?.cloudflareRelayToken && settings?.cloudflareRelayDomain)
  if (!relay) {
    return { configured, state: 'disabled', hostname: '', wsPort: null }
  }
  const status = relay.getStatus()
  return {
    configured,
    state: status.state,
    hostname: status.state === 'running' ? status.hostname : '',
    message: status.state === 'error' ? status.message : undefined,
    wsPort: null
  }
}

export function registerCloudflareRelayHandlers(): void {
  ipcMain.removeHandler('mobile:getCloudflareRelayStatus')
  ipcMain.removeHandler('mobile:restartCloudflareRelay')

  ipcMain.handle('mobile:getCloudflareRelayStatus', (): CloudflareRelayStatusPayload =>
    buildPayload()
  )

  ipcMain.handle(
    'mobile:restartCloudflareRelay',
    async (): Promise<{ ok: boolean; error?: string }> => {
      if (!relay) {
        return { ok: false, error: 'cloudflare_relay_unavailable' }
      }
      return relay.restart()
    }
  )

  // Initialise the service once the app is ready and the store is loaded.
  void app.whenReady().then(() => {
    const store = state.store
    if (!store) {
      return
    }
    const settings = store.getSettings()
    if (!settings?.cloudflareRelayToken || !settings?.cloudflareRelayDomain) {
      return // Not configured — stay dormant.
    }
    relay = new CloudflareRelayService({
      store,
      userDataPath: getCanonicalUserDataPath()
    })
  })
}
