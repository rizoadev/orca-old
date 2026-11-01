import { getCanonicalUserDataPath, type Store } from '../persistence'
import { CloudflareRelayService } from '../runtime/cloudflare-relay/cloudflare-relay'
import type { OrcaRuntimeRpcServer } from '../runtime/runtime-rpc'
import { getWebSocketPort } from '../runtime/windows-mobile-firewall'
import { mainProcessState as state } from './main-process-state'

// Why: relay IPCs answer before the transport binds, so the port resolves lazily.
export function installCloudflareRelay(
  store: Store,
  runtimeRpc: OrcaRuntimeRpcServer
): CloudflareRelayService {
  const relay = new CloudflareRelayService({
    store,
    userDataPath: getCanonicalUserDataPath(),
    getWsPort: () => getWebSocketPort(runtimeRpc.getWebSocketEndpoint())
  })
  state.cloudflareRelay = relay
  return relay
}

// Why: token + domain are the on-switch, so a blank either means the relay is off by design.
export function isCloudflareRelayConfigured(store: Store): boolean {
  const settings = store.getSettings()
  return Boolean(settings.cloudflareRelayToken?.trim() && settings.cloudflareRelayDomain?.trim())
}

// Why: ingress must target the bound port, so the tunnel starts only after the transport listens.
export function startCloudflareRelay(runtimeRpc: OrcaRuntimeRpcServer): void {
  const relay = state.cloudflareRelay
  const port = getWebSocketPort(runtimeRpc.getWebSocketEndpoint())
  if (!relay || port === null) {
    return
  }
  void relay.start(port)
}
