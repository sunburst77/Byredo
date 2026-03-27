import { createMemberAccountAction, updateMemberRoleAction } from '@/app/admin/actions'
import { MembersManagement } from '@/components/admin/MembersManagement'
import { getAdminMembers } from '@/lib/admin/data'
import { getCurrentAdminProfile } from '@/lib/admin/supabase-auth'

type MembersPageProps = {
  searchParams?: {
    q?: string
  }
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const [memberRows, profile] = await Promise.all([getAdminMembers(), getCurrentAdminProfile()])

  return (
    <MembersManagement
      initialMembers={memberRows}
      initialQuery={searchParams?.q ?? ''}
      canManageRoles={profile?.role === 'admin'}
      currentAdminId={profile?.id ?? ''}
      onCreateMemberAction={createMemberAccountAction}
      onRoleChangeAction={updateMemberRoleAction}
    />
  )
}
