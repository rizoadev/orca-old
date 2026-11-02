export type CloudflareTunnelState =
  | { status: 'stopped' }
  | { status: 'starting' }
  | { status: 'running'; url: string }
  | { status: 'error'; message: string }
