import { HardDrive } from 'lucide-react'

export default function S3BrowserPanel(): React.JSX.Element {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <HardDrive size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">S3 Browser</span>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <p className="text-sm text-muted-foreground">S3 file browser & upload</p>
      </div>
    </div>
  )
}
