/**
 * Settings → Integrations card for Gemini Live / OpenAI Realtime Voice Call.
 * Matches the IntegrationCardShell pattern used by S3, Linear, etc.
 */
import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Mic, Unlink, LoaderCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { useMountedRef } from '@/hooks/useMountedRef'
import {
  IntegrationCardDetails,
  IntegrationCardShell
} from '@/components/settings/integration-card-shell'
import type { VoiceCallKeyStatus } from './shared/voice-call-types'

type KeyStatus = { gemini: boolean; openai: boolean }
type SaveState = 'idle' | 'saving' | 'ok' | 'error'

function ProviderRow({
  label,
  placeholder,
  hint,
  configured,
  onSave,
  onClear
}: {
  provider: 'gemini' | 'openai'
  label: string
  placeholder: string
  hint: string
  configured: boolean
  onSave: (key: string) => Promise<void>
  onClear: () => Promise<void>
}): React.JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (): Promise<void> => {
    if (!apiKey.trim()) {
      return
    }
    setSaveState('saving')
    setError(null)
    try {
      await onSave(apiKey.trim())
      setSaveState('ok')
      setApiKey('')
    } catch (err) {
      setSaveState('error')
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleClear = async (): Promise<void> => {
    setError(null)
    setSaveState('idle')
    await onClear()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="flex items-center gap-2">
          {configured && saveState !== 'ok' ? (
            <span className="flex items-center gap-1 text-xs text-status-success">
              <CheckCircle2 className="size-3.5" />
              Configured
            </span>
          ) : null}
          {saveState === 'ok' ? (
            <span className="flex items-center gap-1 text-xs text-status-success">
              <CheckCircle2 className="size-3.5" />
              Saved
            </span>
          ) : null}
          {configured ? (
            <button
              type="button"
              onClick={() => void handleClear()}
              aria-label={`Remove ${label} key`}
              className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:text-destructive"
            >
              <Unlink className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              void handleSave()
            }
          }}
          placeholder={configured ? '••••••••  (leave blank to keep existing)' : placeholder}
          className="font-mono text-xs"
          autoComplete="new-password"
        />
        <Button
          size="sm"
          onClick={() => void handleSave()}
          disabled={saveState === 'saving' || !apiKey.trim()}
        >
          {saveState === 'saving' ? (
            <>
              <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <p className="text-[11px] text-muted-foreground/70">{hint}</p>
    </div>
  )
}

export function VoiceIntegrationCard(): React.JSX.Element {
  const mountedRef = useMountedRef()
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null)
  const [checked, setChecked] = useState(false)

  const refresh = useCallback(async (): Promise<void> => {
    if (!window.voiceApi?.getKeyStatus) {
      if (mountedRef.current) {
        setKeyStatus({ gemini: false, openai: false })
        setChecked(true)
      }
      return
    }
    try {
      const next = await window.voiceApi.getKeyStatus()
      if (mountedRef.current) {
        setKeyStatus(next)
      }
    } catch {
      // non-fatal
    } finally {
      if (mountedRef.current) {
        setChecked(true)
      }
    }
  }, [mountedRef])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleSave = async (provider: keyof VoiceCallKeyStatus, key: string): Promise<void> => {
    await (provider === 'gemini'
      ? window.voiceApi?.saveGeminiApiKey(key)
      : window.voiceApi?.saveOpenAiApiKey(key))
    await refresh()
  }

  const handleClear = async (provider: keyof VoiceCallKeyStatus): Promise<void> => {
    await (provider === 'gemini'
      ? window.voiceApi?.clearGeminiApiKey()
      : window.voiceApi?.clearOpenAiApiKey())
    await refresh()
  }

  const checking = !checked
  const anyConfigured = Boolean(keyStatus?.gemini || keyStatus?.openai)

  return (
    <IntegrationCardShell
      icon={<Mic className="size-5" />}
      name="Voice Call"
      description={
        checking
          ? 'Checking voice API keys…'
          : anyConfigured
            ? `${keyStatus?.gemini ? 'Gemini Live' : ''}${keyStatus?.gemini && keyStatus?.openai ? ' · ' : ''}${keyStatus?.openai ? 'OpenAI Realtime' : ''} configured`
            : 'Configure Gemini Live or OpenAI Realtime for hands-free voice interaction.'
      }
      checking={checking}
      statusTone={anyConfigured ? 'connected' : 'neutral'}
      statusLabel={checking ? 'Checking' : anyConfigured ? 'Connected' : 'Not configured'}
    >
      <IntegrationCardDetails>
        {!checking ? (
          <div className="space-y-4">
            <ProviderRow
              provider="gemini"
              label="Gemini Live"
              placeholder="AIzaSy…"
              hint="From Google AI Studio (aistudio.google.com). Key stored encrypted at ~/.orca/gemini-live-token.enc"
              configured={Boolean(keyStatus?.gemini)}
              onSave={(key) => handleSave('gemini', key)}
              onClear={() => handleClear('gemini')}
            />
            <div className="border-t border-border/60" />
            <ProviderRow
              provider="openai"
              label="OpenAI Realtime"
              placeholder="sk-…"
              hint="From platform.openai.com. Key stored encrypted at ~/.orca/openai-realtime-token.enc"
              configured={Boolean(keyStatus?.openai)}
              onSave={(key) => handleSave('openai', key)}
              onClear={() => handleClear('openai')}
            />
          </div>
        ) : null}
      </IntegrationCardDetails>
    </IntegrationCardShell>
  )
}
