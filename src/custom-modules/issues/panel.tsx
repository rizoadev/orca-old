import { ListTodo } from 'lucide-react'

export default function IssuesPanel(): React.JSX.Element {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <ListTodo size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">Issues</span>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <p className="text-sm text-muted-foreground">
          Issues panel – AI plan, close/assign actions
        </p>
      </div>
    </div>
  )
}
