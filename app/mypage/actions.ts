'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function updateMyPageProfileAction(formData: FormData) {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  if (!fullName) {
    return {
      ok: false,
      message: '이름을 입력해 주세요.',
    }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      message: '로그인 후 다시 시도해 주세요.',
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone || null,
    })
    .eq('id', user.id)

  if (error) {
    return {
      ok: false,
      message: '회원 정보 저장에 실패했습니다.',
    }
  }

  revalidatePath('/mypage')

  return {
    ok: true,
    message: '회원 정보가 저장되었습니다.',
  }
}
