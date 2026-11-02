import { Mic } from 'lucide-react'

export default function VoiceCallPanel(): React.JSX.Element {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Mic size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">Voice Call</span>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <p className="text-sm text-muted-foreground">Gemini Live voice call</p>
      </div>
    </div>
  )
}
