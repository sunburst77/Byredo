import { spawnSync } from 'node:child_process'
import { getNpxCommand, readEnvFile } from './supabase-env.mjs'

const env = readEnvFile()
const accessToken = env.SUPABASE_ACCESS_TOKEN

if (!accessToken) {
  throw new Error('SUPABASE_ACCESS_TOKEN is missing from .env.local.')
}

const result = spawnSync(
  getNpxCommand(),
  ['supabase', 'login', '--token', accessToken, '--name', 'local-env-token'],
  {
    stdio: 'inherit',
    shell: false,
  }
)

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
