import React from 'react'
import { Mic, Settings } from 'lucide-react'

export default function VoicePanel(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Mic size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">Voice Call</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
          <Mic size={24} className="text-muted-foreground/50" />
        </div>
        <p className="text-center text-sm text-muted-foreground">Gemini Live Voice Call</p>
        <p className="text-center text-xs text-muted-foreground/70">
          Hands-free voice interaction powered by Gemini Live or OpenAI Realtime.
        </p>
        <button className="mt-2 flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent">
          <Settings size={12} />
          Configure API Key
        </button>
      </div>
    </div>
  )
}
