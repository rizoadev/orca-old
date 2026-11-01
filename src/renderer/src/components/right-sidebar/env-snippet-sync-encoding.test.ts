import { describe, expect, it } from 'vitest'
import {
  encodeSnippetFileName,
  parseSnippetTitle,
  snippetMatchesBranch,
  snippetTitle
} from './env-snippet-sync-encoding'

describe('env snippet branch keys', () => {
  it('round-trips a branch with slashes so each worktree gets its own snippet', () => {
    const title = snippetTitle('feat/login-ui', '.env.local')

    expect(title).toBe('orca-sync:feat/login-ui:.env.local')
    expect(parseSnippetTitle(title)).toEqual({
      branch: 'feat/login-ui',
      relativePath: '.env.local'
    })
  })

  it('keeps two branches of the same file on separate keys', () => {
    expect(snippetTitle('main', '.env')).not.toBe(snippetTitle('release/1.4', '.env'))
  })

  it('still decodes the legacy env-only title', () => {
    expect(parseSnippetTitle('env: .env.local')).toEqual({
      branch: '',
      relativePath: '.env.local'
    })
  })

  it('shows a snippet only on its own branch', () => {
    expect(snippetMatchesBranch('main', 'main')).toBe(true)
    expect(snippetMatchesBranch('main', 'feat/login-ui')).toBe(false)
    // A legacy title carries no branch, so it stays visible everywhere.
    expect(snippetMatchesBranch('', 'feat/login-ui')).toBe(true)
    // Without an active branch there is nothing to match against.
    expect(snippetMatchesBranch('main', '')).toBe(false)
  })

  it('encodes nested paths into a slash-free GitLab fileName', () => {
    expect(encodeSnippetFileName('.envs/docker/app.env')).toBe('.envs__docker__app.env')
  })
})
