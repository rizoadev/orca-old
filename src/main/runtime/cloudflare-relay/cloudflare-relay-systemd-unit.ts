// Keeps the relay tunnel alive across Orca quits with a per-install systemd user unit.
import { runProcess } from '@orca/process-host'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Why: older builds wrote one shared unit name for every install on the machine.
const LEGACY_UNIT_NAME = 'orca-cloudflare-tunnel.service'
// user-manager calls answer locally; a hang here must not pin the relay start.
const SYSTEMCTL_TIMEOUT_MS = 10_000

export type SystemdUnitTarget = {
  stateDir: string
  machineId: string
}

function unitDir(): string {
  return join(process.env.HOME ?? '', '.config', 'systemd', 'user')
}

// Why: a dev and a packaged install share one HOME, so a fixed unit name makes them overwrite each other's tunnel.
function unitName({ stateDir, machineId }: SystemdUnitTarget): string {
  const key =
    machineId.slice(0, 8) || createHash('sha256').update(stateDir).digest('hex').slice(0, 8)
  return `orca-cloudflare-tunnel-${key}.service`
}

async function runSystemctl(args: string[]): Promise<boolean> {
  const result = await runProcess({
    program: 'systemctl',
    args: ['--user', ...args],
    timeoutMs: SYSTEMCTL_TIMEOUT_MS
  })
  return result.code === 0
}

// Why: retire the shared-name unit only when it actually targets this install.
async function retireLegacyUnit({ stateDir }: SystemdUnitTarget): Promise<void> {
  const unitPath = join(unitDir(), LEGACY_UNIT_NAME)
  if (!existsSync(unitPath)) {
    return
  }
  try {
    if (!readFileSync(unitPath, 'utf8').includes(stateDir)) {
      return
    }
    await runSystemctl(['disable', '--now', LEGACY_UNIT_NAME])
    unlinkSync(unitPath)
  } catch {
    // best-effort migration
  }
}

export async function installSystemdUnit(
  target: SystemdUnitTarget,
  binary: string,
  configPath: string
): Promise<boolean> {
  try {
    mkdirSync(unitDir(), { recursive: true })
    await retireLegacyUnit(target)
    const name = unitName(target)
    writeFileSync(
      join(unitDir(), name),
      [
        '[Unit]',
        'Description=Orca Cloudflare Relay Tunnel',
        'After=network-online.target',
        '',
        '[Service]',
        `ExecStart=${binary} tunnel --protocol http2 --region us --config ${configPath} run`,
        'Restart=always',
        'RestartSec=3',
        '',
        '[Install]',
        'WantedBy=default.target',
        ''
      ].join('\n'),
      'utf8'
    )
    await runSystemctl(['daemon-reload'])
    await runSystemctl(['enable', name])
    return await runSystemctl(['restart', name])
  } catch {
    return false
  }
}

export async function teardownSystemdUnit(target: SystemdUnitTarget): Promise<void> {
  try {
    const name = unitName(target)
    await runSystemctl(['disable', '--now', name])
    const unitPath = join(unitDir(), name)
    if (existsSync(unitPath)) {
      unlinkSync(unitPath)
    }
    await retireLegacyUnit(target)
    await runSystemctl(['daemon-reload'])
  } catch {
    // best-effort teardown
  }
}
