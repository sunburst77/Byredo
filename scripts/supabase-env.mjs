import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const envPath = join(process.cwd(), '.env.local')

export function readEnvFile() {
  if (!existsSync(envPath)) {
    throw new Error('.env.local file not found.')
  }

  const source = readFileSync(envPath, 'utf8')
  const lines = source.split(/\r?\n/)
  const env = {}

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    env[key] = value
  }

  return env
}

export function getSupabaseProjectRef(env) {
  if (env.SUPABASE_PROJECT_REF) {
    return env.SUPABASE_PROJECT_REF
  }

  const projectUrl = env.NEXT_PUBLIC_SUPABASE_URL

  if (!projectUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing from .env.local.')
  }

  const { hostname } = new URL(projectUrl)

  return hostname.split('.')[0]
}

export function getNpxCommand() {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx'
}
