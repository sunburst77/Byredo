# Byredo Project

Next.js 14 + TypeScript + Tailwind CSS 기반 프로젝트입니다.

## 시작하기

개발 서버 실행:

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 확인합니다.

프로덕션 빌드:

```bash
npm run build
```

프로덕션 실행:

```bash
npm start
```

## 프로젝트 구조

```text
byredo-project/
├─ app/
│  ├─ admin/
│  ├─ checkout/
│  ├─ journal/
│  ├─ offline-store/
│  ├─ shop/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ admin/
│  ├─ auth/
│  ├─ checkout/
│  └─ sections/
├─ lib/
│  ├─ admin/
│  ├─ auth/
│  ├─ checkout/
│  ├─ shop/
│  └─ supabase/
├─ public/
├─ .env.local
├─ package.json
├─ tailwind.config.js
└─ tsconfig.json
```

## Supabase 세팅 가이드

이 프로젝트는 Supabase를 다음 구조로 분리해서 사용합니다.

- 브라우저용 공개 클라이언트: `lib/supabase/client.ts`
- 서버 컴포넌트 / 서버 액션용 클라이언트: `lib/supabase/server.ts`
- 관리자 권한 서버 전용 클라이언트: `lib/supabase/admin.ts`

중요 원칙:

- `NEXT_PUBLIC_*` 환경변수는 브라우저에서 접근 가능합니다.
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`는 서버에서만 사용해야 합니다.
- 비밀키는 클라이언트 컴포넌트, 브라우저 코드, 공개 저장소에 넣으면 안 됩니다.

### 1. Supabase 회원가입 방법

1. `https://supabase.com`에 접속합니다.
2. 우측 상단의 `Start your project` 또는 로그인 버튼으로 이동합니다.
3. GitHub 계정 또는 이메일로 회원가입/로그인합니다.
4. 처음 가입하면 기본 Organization이 함께 생성됩니다.

### 2. 새 프로젝트 생성 방법

1. 로그인 후 Supabase Dashboard로 이동합니다.
2. `New project`를 클릭합니다.
3. Organization을 선택합니다.
4. Project name을 입력합니다.
5. Database Password를 강하게 설정하고 안전한 곳에 보관합니다.
6. Region을 선택합니다.
7. `Create new project`를 눌러 생성합니다.
8. 프로젝트 생성이 끝날 때까지 잠시 기다립니다.

빠르게 시작하려면 Supabase 공식 가이드에서 안내하는 `database.new`를 사용해도 됩니다.

### 3. Project URL 찾는 위치

Project URL은 보통 아래 위치에서 찾습니다.

1. Supabase Dashboard에서 프로젝트를 엽니다.
2. `Connect` 다이얼로그를 열거나
3. `Project Settings` → `API` 또는 `API Keys` 화면으로 이동합니다.
4. `Project URL` 값을 복사합니다.

이 값은 `.env.local`의 아래 항목에 넣습니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
```

### 4. Publishable key / anon key 찾는 위치

브라우저용 공개키는 아래 위치에서 찾습니다.

1. 프로젝트 Dashboard 진입
2. `Connect` 다이얼로그를 열거나
3. `Project Settings` → `API Keys`로 이동
4. 다음 중 하나를 확인
   `Publishable key`
   또는 Legacy 탭의 `anon` key

이 프로젝트에서는 현재 아래 이름으로 사용합니다.

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

정리:

- `Publishable key` 또는 `anon key`는 클라이언트에서 사용 가능
- `NEXT_PUBLIC_*`로 시작해야 브라우저에서 사용할 수 있음
- 공개키라도 DB 권한은 RLS 정책으로 제한해야 함

### 5. Secret key / service_role key 찾는 위치

서버 전용 키는 아래 위치에서 찾습니다.

1. 프로젝트 Dashboard 진입
2. `Project Settings` → `API Keys`로 이동
3. 다음 중 하나를 확인
   `Secret key`
   또는 Legacy 탭의 `service_role` key

이 프로젝트에서는 아래 둘 중 하나를 사용하도록 구성했습니다.

```env
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
# SUPABASE_SECRET_KEY=your-server-only-secret-key
```

정리:

- `Secret key` 또는 `service_role key`는 서버에서만 사용
- 절대 `NEXT_PUBLIC_` 접두사를 붙이면 안 됨
- 절대 클라이언트 컴포넌트에서 import 하면 안 됨

### 6. 어떤 키를 어디에 넣어야 하는지

브라우저에서 사용하는 값:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

서버에서만 사용하는 값:

- `SUPABASE_SERVICE_ROLE_KEY`
- 또는 `SUPABASE_SECRET_KEY`

파일별 사용 위치:

- `lib/supabase/client.ts`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `lib/supabase/server.ts`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `lib/supabase/admin.ts`: `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` 또는 `SUPABASE_SECRET_KEY`

### 7. .env.local 파일에 어떻게 작성하는지

프로젝트 루트의 `.env.local` 파일에 아래처럼 작성합니다.

```env
# Public values: safe to expose to the browser bundle.
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key

# Server-only values: never import these into client components.
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
# SUPABASE_SECRET_KEY=your-server-only-secret-key
```

작성 후 해야 할 일:

1. 저장
2. 개발 서버가 켜져 있으면 재시작
3. 필요 시 `npm run build`로 환경변수 누락 여부 확인

### 8. 절대 노출하면 안 되는 값

아래 값은 절대 외부에 노출하면 안 됩니다.

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEY`
- Database password
- 직접 발급한 관리자용 토큰

노출하면 안 되는 이유:

- 서버 전용 키는 높은 권한을 가집니다.
- 특히 `service_role`은 Row Level Security를 우회할 수 있습니다.
- 공개 저장소, 브라우저 번들, 콘솔 로그, 스크린샷, 채팅창에 노출되면 위험합니다.

주의사항:

- `NEXT_PUBLIC_`가 붙은 변수는 브라우저 번들에 포함될 수 있습니다.
- 서버 전용 키에는 `NEXT_PUBLIC_`를 절대 붙이지 마세요.
- 서버 전용 키는 `server-only`가 붙은 파일이나 Route Handler, Server Action에서만 사용하세요.

## Supabase 사용 예시

브라우저용 클라이언트:

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const supabase = createSupabaseBrowserClient()
```

서버용 클라이언트:

```ts
import { createSupabaseServerClient } from '@/lib/supabase/server'

const supabase = await createSupabaseServerClient()
```

관리자 권한 서버 전용 클라이언트:

```ts
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const supabase = createSupabaseAdminClient()
```

## 기술 스택

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase
