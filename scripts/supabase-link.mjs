import { spawnSync } from 'node:child_process'
import { getNpxCommand, getSupabaseProjectRef, readEnvFile } from './supabase-env.mjs'

const env = readEnvFile()
const projectRef = getSupabaseProjectRef(env)
const dbPassword = env.SUPABASE_DB_PASSWORD

if (!dbPassword) {
  throw new Error('SUPABASE_DB_PASSWORD is missing from .env.local.')
}

if (env.SUPABASE_ACCESS_TOKEN) {
  const login = spawnSync(
    getNpxCommand(),
    ['supabase', 'login', '--token', env.SUPABASE_ACCESS_TOKEN, '--name', 'local-env-token'],
    {
      stdio: 'inherit',
      shell: false,
    }
  )

  if (login.status !== 0) {
    process.exit(login.status ?? 1)
  }
}

const link = spawnSync(
  getNpxCommand(),
  ['supabase', 'link', '--project-ref', projectRef, '--password', dbPassword],
  {
    stdio: 'inherit',
    shell: false,
  }
)

if (link.status !== 0) {
  process.exit(link.status ?? 1)
}
