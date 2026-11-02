import React, { useState, useEffect, useCallback } from 'react'
import { Globe, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type TunnelStatus = 'unknown' | 'connecting' | 'connected' | 'error' | 'disabled'

type TunnelInfo = {
  status: TunnelStatus
  url?: string
  error?: string
}

export function CloudflareRelayStatusSegment({
  compact,
  iconOnly
}: {
  compact: boolean
  iconOnly: boolean
}): React.JSX.Element | null {
  const [tunnel, setTunnel] = useState<TunnelInfo>({ status: 'unknown' })

  const refreshStatus = useCallback(async () => {
    try {
      if (!window.api?.mobile?.getCloudflareRelayStatus) {
        setTunnel({ status: 'disabled' })
        return
      }
      const result = await window.api.mobile.getCloudflareRelayStatus()
      setTunnel({
        status: result.tunnelUrl ? 'connected' : result.error ? 'error' : 'connecting',
        url: result.tunnelUrl ?? undefined,
        error: result.error ?? undefined
      })
    } catch {
      setTunnel({ status: 'disabled' })
    }
  }, [])

  useEffect(() => {
    refreshStatus()
    const id = window.setInterval(refreshStatus, 15_000)
    return () => {
      window.clearInterval(id)
    }
  }, [refreshStatus])

  if (tunnel.status === 'disabled' || tunnel.status === 'unknown') {
    return null
  }

  const icon =
    tunnel.status === 'connected' ? (
      <CheckCircle2 size={12} className="text-green-500" />
    ) : tunnel.status === 'connecting' ? (
      <Loader2 size={12} className="animate-spin text-yellow-500" />
    ) : (
      <AlertCircle size={12} className="text-red-500" />
    )

  const label =
    tunnel.status === 'connected'
      ? (tunnel.url ?? 'Tunnel active')
      : tunnel.status === 'connecting'
        ? 'Connecting…'
        : (tunnel.error ?? 'Tunnel error')

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={refreshStatus}
          className="flex items-center gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Globe size={12} />
          {icon}
          {!iconOnly && !compact && (
            <span className="max-w-[140px] truncate">
              {tunnel.status === 'connected' ? 'wss' : label}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="text-xs">
          <div className="font-medium">Cloudflare Tunnel</div>
          <div className="text-muted-foreground">{label}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
