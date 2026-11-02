import React from 'react'
import { HardDrive, Upload } from 'lucide-react'

export default function S3Panel(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <HardDrive size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">S3 Browser</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
        <Upload size={32} className="text-muted-foreground/50" />
        <p className="text-center text-sm text-muted-foreground">
          S3-compatible object storage browser
        </p>
        <p className="text-center text-xs text-muted-foreground/70">
          Configure S3 credentials in settings to browse buckets, upload, and download files.
        </p>
      </div>
    </div>
  )
}
