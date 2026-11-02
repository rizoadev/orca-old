/**
 * Custom activity bar items for the right sidebar.
 * Each module registers its icon and title here.
 */
import { ListTodo, Timer, Code2, HardDrive, Mic } from 'lucide-react'
import type { ActivityBarItem } from '@/components/right-sidebar/activity-bar-buttons'
import { translate } from '@/i18n/i18n'

export function getCustomActivityItems(): ActivityBarItem[] {
  return [
    {
      id: 'issues' as ActivityBarItem['id'],
      icon: ListTodo,
      title: translate('custom.issues', 'Issues'),
      shortcut: ''
    },
    {
      id: 'pomodoro' as ActivityBarItem['id'],
      icon: Timer,
      title: translate('custom.pomodoro', 'Pomodoro'),
      shortcut: ''
    },
    {
      id: 'snippets' as ActivityBarItem['id'],
      icon: Code2,
      title: translate('custom.snippets', 'Snippets'),
      shortcut: ''
    },
    {
      id: 's3' as ActivityBarItem['id'],
      icon: HardDrive,
      title: translate('custom.s3', 'S3 Browser'),
      shortcut: ''
    },
    {
      id: 'voice' as ActivityBarItem['id'],
      icon: Mic,
      title: translate('custom.voice', 'Voice Call'),
      shortcut: ''
    }
  ]
}
