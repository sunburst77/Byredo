import { SettingsManagement } from '@/components/admin/SettingsManagement'
import { getCurrentAdminProfile } from '@/lib/admin/supabase-auth'

export default async function SettingsPage() {
  const profile = await getCurrentAdminProfile()

  if (!profile) {
    return null
  }

  return <SettingsManagement role={profile.role === 'admin' ? 'admin' : 'staff'} adminName={profile.full_name || profile.email} />
}
