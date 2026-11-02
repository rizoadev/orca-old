import { useCallback, useEffect, useRef, useState } from 'react'
import { Cloud, CloudOff, Loader2 } from 'lucide-react'
import type { CloudflareTunnelState } from '../../../../shared/cloudflare-tunnel-state'
import { Button } from '../ui/button'
import { translate } from '@/i18n/i18n'

export function useCloudflareTunnel(
  intent: string,
  onSelectedAddressChange: (address: string) => void
): {
  tunnelState: CloudflareTunnelState
  startTunnel: () => void
  stopTunnel: () => void
} {
  const [tunnelState, setTunnelState] = useState<CloudflareTunnelState>({ status: 'stopped' })
  const onSelectedAddressChangeRef = useRef(onSelectedAddressChange)
  onSelectedAddressChangeRef.current = onSelectedAddressChange

  useEffect(() => {
    void window.api.mobile.getCloudflareTunnelState().then(setTunnelState)
    const unsubscribe = window.api.mobile.onCloudflareTunnelStateChanged((state) => {
      setTunnelState(state)
      if (state.status === 'running') {
        onSelectedAddressChangeRef.current(state.url)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (intent === 'tunnel' && tunnelState.status === 'running') {
      onSelectedAddressChangeRef.current(tunnelState.url)
    }
  }, [intent, tunnelState])

  const startTunnel = useCallback(() => {
    void window.api.mobile.startCloudflareTunnel().then((result) => {
      if (result.status === 'running') {
        onSelectedAddressChangeRef.current(result.url)
      }
    })
  }, [])

  const stopTunnel = useCallback(() => {
    void window.api.mobile.stopCloudflareTunnel()
  }, [])

  return { tunnelState, startTunnel, stopTunnel }
}

export function CloudflareTunnelPanel({
  tunnelState,
  startTunnel,
  stopTunnel
}: {
  tunnelState: CloudflareTunnelState
  startTunnel: () => void
  stopTunnel: () => void
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs">
        <div className="font-medium">
          {translate(
            'auto.components.settings.RuntimePairingUrlGenerator.tunnelTitle',
            'Cloudflare Quick Tunnel'
          )}
        </div>
        <p className="mt-1 text-muted-foreground">
          {translate(
            'auto.components.settings.RuntimePairingUrlGenerator.tunnelDescription',
            'Start a temporary Cloudflare Tunnel to make this computer reachable from anywhere. Requires cloudflared to be installed.'
          )}
        </p>
        {tunnelState.status === 'running' ? (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <Cloud className="size-3.5 text-green-500" />
              <span className="font-medium text-green-600 dark:text-green-400">
                {translate(
                  'auto.components.settings.RuntimePairingUrlGenerator.tunnelRunning',
                  'Tunnel active'
                )}
              </span>
            </div>
            <div className="break-all font-mono">{tunnelState.url}</div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="gap-1.5"
              onClick={stopTunnel}
            >
              <CloudOff className="size-3" />
              {translate(
                'auto.components.settings.RuntimePairingUrlGenerator.stopTunnel',
                'Stop tunnel'
              )}
            </Button>
          </div>
        ) : tunnelState.status === 'starting' ? (
          <div className="mt-2 flex items-center gap-2">
            <Loader2 className="size-3.5 animate-spin" />
            <span>
              {translate(
                'auto.components.settings.RuntimePairingUrlGenerator.tunnelStarting',
                'Starting tunnel\u2026'
              )}
            </span>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {tunnelState.status === 'error' ? (
              <p className="text-destructive" role="alert">
                {tunnelState.message}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="gap-1.5"
              onClick={startTunnel}
            >
              <Cloud className="size-3" />
              {translate(
                'auto.components.settings.RuntimePairingUrlGenerator.startTunnel',
                'Start tunnel'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
