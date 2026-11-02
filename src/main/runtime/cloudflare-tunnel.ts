import { spawn, type ChildProcess } from 'node:child_process'
import type { CloudflareTunnelState } from '../../shared/cloudflare-tunnel-state'

export type { CloudflareTunnelState }

export type CloudflareTunnelStateListener = (state: CloudflareTunnelState) => void

// Extract the assigned *.trycloudflare.com URL from cloudflared stderr output.
const TUNNEL_URL_PATTERN = /https?:\/\/[^\s]*\.trycloudflare\.com/

export class CloudflareTunnel {
  private process: ChildProcess | null = null
  private state: CloudflareTunnelState = { status: 'stopped' }
  private listeners = new Set<CloudflareTunnelStateListener>()

  getState(): CloudflareTunnelState {
    return this.state
  }

  onStateChanged(listener: CloudflareTunnelStateListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private setState(next: CloudflareTunnelState): void {
    this.state = next
    for (const listener of this.listeners) {
      try {
        listener(next)
      } catch {
        // Listener errors must not break state propagation.
      }
    }
  }

  async start(localPort: number): Promise<CloudflareTunnelState> {
    if (this.process) {
      this.stop()
    }

    this.setState({ status: 'starting' })

    return new Promise<CloudflareTunnelState>((resolve) => {
      const localUrl = `http://localhost:${localPort}`
      let resolved = false
      let stderr = ''

      try {
        this.process = spawn('cloudflared', ['tunnel', '--url', localUrl], {
          stdio: ['ignore', 'pipe', 'pipe']
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start cloudflared'
        const state: CloudflareTunnelState = { status: 'error', message }
        this.setState(state)
        resolve(state)
        return
      }

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          const state: CloudflareTunnelState = {
            status: 'error',
            message:
              'Timed out waiting for cloudflared to provide a tunnel URL. Is cloudflared installed?'
          }
          this.setState(state)
          this.killProcess()
          resolve(state)
        }
      }, 30_000)

      const handleOutput = (chunk: Buffer): void => {
        if (resolved) {
          return
        }
        stderr += chunk.toString()
        const match = TUNNEL_URL_PATTERN.exec(stderr)
        if (match) {
          resolved = true
          clearTimeout(timeout)
          // Convert the HTTPS URL to a WSS URL for the address picker.
          const tunnelHttpsUrl = match[0]
          const tunnelWssUrl = tunnelHttpsUrl.replace(/^https:\/\//, 'wss://')
          const state: CloudflareTunnelState = { status: 'running', url: tunnelWssUrl }
          this.setState(state)
          resolve(state)
        }
      }

      this.process.stderr?.on('data', handleOutput)
      this.process.stdout?.on('data', handleOutput)

      this.process.on('error', (error) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          const state: CloudflareTunnelState = {
            status: 'error',
            message: `cloudflared failed: ${error.message}`
          }
          this.setState(state)
          resolve(state)
        }
      })

      this.process.on('exit', (code) => {
        this.process = null
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          const state: CloudflareTunnelState = {
            status: 'error',
            message: `cloudflared exited with code ${code ?? 'unknown'}`
          }
          this.setState(state)
          resolve(state)
        } else if (this.state.status === 'running') {
          this.setState({ status: 'stopped' })
        }
      })
    })
  }

  stop(): void {
    this.killProcess()
    this.setState({ status: 'stopped' })
  }

  private killProcess(): void {
    if (this.process) {
      try {
        this.process.kill()
      } catch {
        // Process may already be dead.
      }
      this.process = null
    }
  }

  dispose(): void {
    this.stop()
    this.listeners.clear()
  }
}
