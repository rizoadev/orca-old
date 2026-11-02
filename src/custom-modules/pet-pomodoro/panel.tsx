import { Timer } from 'lucide-react'

export default function PomodoroPanel(): React.JSX.Element {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Timer size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">Pomodoro</span>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <p className="text-sm text-muted-foreground">Pomodoro timer + virtual pet hero</p>
      </div>
    </div>
  )
}
