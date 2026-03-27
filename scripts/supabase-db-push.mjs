import { spawnSync } from 'node:child_process'
import { getNpxCommand, readEnvFile } from './supabase-env.mjs'

const env = readEnvFile()
const args = ['supabase', 'db', 'push']

if (env.SUPABASE_DB_PASSWORD) {
  args.push('--password', env.SUPABASE_DB_PASSWORD)
}

const result = spawnSync(getNpxCommand(), args, {
  stdio: 'inherit',
  shell: false,
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
