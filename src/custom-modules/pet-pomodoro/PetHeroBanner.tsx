/**
 * PetHero banner — greeting, time, and cat sprites above the terminal.
 * Requires settings.experimentalPet === true to render.
 */
import React, { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/store'
import { useActiveWorktree } from '@/store/selectors'
import { branchName } from '@/lib/git-utils'
import catPlayingUrl from '../../../resources/cat-playing.svg?url'
import catWatermelonUrl from '../../../resources/cat-watermelon.svg?url'
import catDanceUrl from '../../../resources/cat-dance.svg?url'

const HERO_PETS = [
  { url: catPlayingUrl, className: 'pet-hero-roam-left' },
  { url: catWatermelonUrl, className: 'pet-hero-roam-center' },
  { url: catDanceUrl, className: 'pet-hero-roam-right' }
] as const

function formatLiveTime(): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date())
}

export function PetHeroBanner({
  worktreeId: _worktreeId
}: {
  worktreeId: string
}): React.JSX.Element | null {
  const petEnabled = useAppStore((s) => s.settings?.experimentalPet === true)
  const petVisible = useAppStore((s) => s.petVisible)
  const activeWorktree = useActiveWorktree()
  const branch = useMemo(() => branchName(activeWorktree?.branch ?? ''), [activeWorktree])

  const [currentTime, setCurrentTime] = useState(() => formatLiveTime())
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(formatLiveTime())
      setHour(new Date().getHours())
    }, 1000)
    return () => {
      window.clearInterval(timer)
    }
  }, [])

  if (!petEnabled || !petVisible) {
    return null
  }

  const timeOfDay = hour < 11 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam'
  const greeting = `${timeOfDay}, Riza.`

  return (
    <div className="relative flex items-center gap-3 overflow-hidden border-b border-border bg-gradient-to-r from-card to-card/80 px-4 py-2">
      <div className="z-10 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">{greeting}</span>
        <span className="font-mono text-xs text-muted-foreground">{currentTime}</span>
        {branch && <span className="text-[10px] text-muted-foreground/70">⎇ {branch}</span>}
      </div>
      <div className="ml-auto flex items-end gap-1">
        {HERO_PETS.map((pet) => (
          <img
            key={pet.url}
            src={pet.url}
            alt=""
            className="h-8 w-8 object-contain opacity-70"
            draggable={false}
          />
        ))}
      </div>
    </div>
  )
}
