import type { GitStatusEntry } from '../../../../shared/git-status-types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Github, Gitlab, Pencil } from 'lucide-react'
import mountainLandscapeUrl from '../../../../../resources/mountain-landscape-transparent.svg?url'
import catPlayingUrl from '../../../../../resources/cat-playing.svg?url'
import catWatermelonUrl from '../../../../../resources/cat-watermelon.svg?url'
import catDanceUrl from '../../../../../resources/cat-dance.svg?url'
import { usePomodoroStore, type PomodoroPhase } from '../right-sidebar/pomodoro-timer-store'
import { parseRemoteRepo } from '../right-sidebar/source-control-remote-repo'
import { isImeOwnedKeyboardEvent } from '@/lib/ime-composition-keyboard-event'
import { branchName } from '../../lib/git-utils'
import { useAppStore } from '../../store'

const HERO_PETS = [
  { url: catPlayingUrl, className: 'pet-hero-roam-left' },
  { url: catWatermelonUrl, className: 'pet-hero-roam-center' },
  { url: catDanceUrl, className: 'pet-hero-roam-right' }
] as const

// Why: stable reference to avoid infinite re-render when worktree has no git status yet.
const EMPTY_GIT_ENTRIES: GitStatusEntry[] = []

type PetHeroMode = 'working' | 'cooldown' | 'sleep' | 'rest'

function formatLiveTime(): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date())
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function pomodoroPhaseLabel(phase: PomodoroPhase): string {
  if (phase === 'focus') {
    return 'focus'
  }
  return phase === 'long-break' ? 'long break' : 'break'
}

export default function PetHero({ worktreeId }: { worktreeId: string }): React.JSX.Element | null {
  const workspace = useAppStore(
    useShallow((state) => {
      for (const worktrees of Object.values(state.worktreesByRepo)) {
        const worktree = worktrees.find((item) => item.id === worktreeId)
        if (worktree) {
          const repo = state.repos.find((repo) => repo.id === worktree.repoId)
          return {
            branch: branchName(worktree.branch),
            path: worktree.path,
            projectName: repo?.displayName ?? null,
            remoteUrl: repo?.gitRemoteIdentity?.remoteUrl ?? null
          }
        }
      }
      return null
    })
  )
  const repoHost = workspace?.remoteUrl
    ? (() => {
        const ref = parseRemoteRepo(workspace.remoteUrl)
        if (ref?.provider === 'github' || ref?.provider === 'gitlab') {
          return { provider: ref.provider as 'github' | 'gitlab', url: ref.webBaseUrl }
        }
        return null
      })()
    : null
  const petMode = useAppStore((state): PetHeroMode => {
    let hasWorkingAgent = false
    let hasWaitingAgent = false
    for (const entry of Object.values(state.agentStatusByPaneKey)) {
      if (entry.worktreeId !== worktreeId) {
        continue
      }
      if (entry.state === 'working') {
        hasWorkingAgent = true
      } else if (entry.state === 'waiting' || entry.state === 'blocked') {
        hasWaitingAgent = true
      }
    }
    const hasSleepingAgent = Object.values(state.sleepingAgentSessionsByPaneKey).some(
      (entry) => entry.worktreeId === worktreeId
    )
    if (hasWorkingAgent) {
      return 'working'
    }
    if (hasSleepingAgent) {
      return 'sleep'
    }
    if (hasWaitingAgent) {
      return 'rest'
    }
    return 'rest'
  })
  const pomodoroPhase = usePomodoroStore((state) => state.phase)
  const pomodoroSecondsLeft = usePomodoroStore((state) => state.secondsLeft)
  const pomodoroRunning = usePomodoroStore((state) => state.running)
  const gitEntries = useAppStore(
    (state) => state.gitStatusByWorktree[worktreeId] ?? EMPTY_GIT_ENTRIES
  )
  const rightSidebarOpen = useAppStore((s) => s.rightSidebarOpen)
  const gitDiffStats = useMemo(() => {
    let added = 0
    let removed = 0
    for (const entry of gitEntries) {
      if (entry.added != null) {
        added += entry.added
      }
      if (entry.removed != null) {
        removed += entry.removed
      }
    }
    return { added, removed }
  }, [gitEntries])

  const [currentTime, setCurrentTime] = useState(() => formatLiveTime())

  const [timeOfDay, setTimeOfDay] = useState(() => {
    const h = new Date().getHours()
    return h < 11 ? 'Pagi' : h < 15 ? 'Siang' : h < 18 ? 'Sore' : 'Malam'
  })

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(formatLiveTime())
      const h = new Date().getHours()
      setTimeOfDay(h < 11 ? 'Pagi' : h < 15 ? 'Siang' : h < 18 ? 'Sore' : 'Malam')
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const greeting = `${timeOfDay}, Riza.`
  const effectiveMode: PetHeroMode =
    pomodoroPhase !== 'focus'
      ? 'cooldown'
      : pomodoroRunning || petMode === 'working'
        ? 'working'
        : petMode
  const modeLabel =
    effectiveMode === 'working'
      ? 'working'
      : effectiveMode === 'cooldown'
        ? 'cooldown'
        : effectiveMode === 'sleep'
          ? 'sleeping'
          : 'resting'

  const [statusText, setStatusText] = useState(() => {
    return localStorage.getItem('pet-hero-status') || 'Semangat kerja ya — buat nabung rumah.'
  })
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const statusInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditingStatus && statusInputRef.current) {
      statusInputRef.current.focus()
      statusInputRef.current.select()
    }
  }, [isEditingStatus])

  const handleStatusSave = (): void => {
    const newValue = statusInputRef.current?.value?.trim() || ''
    if (newValue) {
      setStatusText(newValue)
      localStorage.setItem('pet-hero-status', newValue)
    }
    setIsEditingStatus(false)
  }

  const handleStatusKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (isImeOwnedKeyboardEvent(e)) {
      return
    }
    if (e.key === 'Enter') {
      handleStatusSave()
    } else if (e.key === 'Escape') {
      setIsEditingStatus(false)
    }
  }

  return (
    <header
      className="pet-hero"
      data-pet-hero="true"
      data-pet-mode={effectiveMode}
      data-right-sidebar-open={rightSidebarOpen}
    >
      <div className="pet-hero-copy">
        <p className="pet-hero-eyebrow">ORCA / WORKSPACE</p>
        <h1 className="pet-hero-title">{greeting}</h1>
        <div
          className="pet-hero-description-wrapper"
          style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          {isEditingStatus ? (
            <input
              ref={statusInputRef}
              type="text"
              className="pet-hero-description-input"
              defaultValue={statusText}
              onBlur={handleStatusSave}
              onKeyDown={handleStatusKeyDown}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '4px 8px',
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                width: '100%',
                minWidth: '300px'
              }}
            />
          ) : (
            <>
              <p className="pet-hero-description">{statusText}</p>
              <button
                type="button"
                onClick={() => setIsEditingStatus(true)}
                className="pet-hero-edit-button"
                aria-label="Edit status"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  opacity: 0.6,
                  transition: 'opacity 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              >
                <Pencil size={14} />
              </button>
            </>
          )}
        </div>
        <p className="pet-hero-workspace">
          {workspace?.projectName || 'Orca project'} / {workspace?.branch || 'detached'}
          {repoHost && (
            <a
              className="pet-hero-repo-link"
              href={repoHost.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open on ${repoHost.provider}`}
            >
              {repoHost.provider === 'github' ? <Github size={14} /> : <Gitlab size={14} />}
            </a>
          )}
        </p>
        {workspace?.path && (
          <p className="pet-hero-path" title={workspace.path}>
            {workspace.path}
          </p>
        )}
      </div>
      <div className="pet-hero-scene" aria-hidden="true">
        <div className="pet-hero-stars">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="pet-hero-horizon" />
        <img className="pet-hero-mountains" src={mountainLandscapeUrl} alt="" draggable={false} />
        {HERO_PETS.map((pet) => (
          <img
            key={pet.url}
            className={`pet-hero-pet ${pet.className}`}
            src={pet.url}
            alt=""
            draggable={false}
          />
        ))}
      </div>
      <div className="pet-hero-status" aria-label={`Pets are ${modeLabel}`}>
        <span className="pet-hero-status-dot" />
        <span>
          {currentTime} · {modeLabel}
        </span>
        {(gitDiffStats.added > 0 || gitDiffStats.removed > 0) && (
          <span className="pet-hero-git-diff">
            {gitDiffStats.added > 0 && (
              <span className="pet-hero-git-added">+{gitDiffStats.added}</span>
            )}
            {gitDiffStats.removed > 0 && (
              <span className="pet-hero-git-removed">-{gitDiffStats.removed}</span>
            )}
          </span>
        )}
      </div>
      <div
        className="pet-hero-pomodoro"
        aria-label={`Pomodoro ${pomodoroPhaseLabel(pomodoroPhase)}`}
      >
        <span className="pet-hero-pomodoro-label">{pomodoroPhaseLabel(pomodoroPhase)}</span>
        <strong>{formatCountdown(pomodoroSecondsLeft)}</strong>
        <span className="pet-hero-pomodoro-state">{pomodoroRunning ? 'live' : 'paused'}</span>
      </div>
    </header>
  )
}
