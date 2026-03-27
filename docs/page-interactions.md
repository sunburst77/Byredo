# Byredo Project Page Interaction Notes

이 문서는 현재 코드베이스를 기준으로 각 페이지에 적용된 인터랙션, 구현 방식, 사용된 플러그인 및 라이브러리를 정리한 문서입니다.

## 공통 인터랙션 및 플러그인

### 전역 레이아웃
- `app/layout.tsx`
- `components/PageTransition.tsx`의 `PageTransition`
  - `framer-motion`으로 라우트 진입 전환 애니메이션을 처리합니다.
  - 라우트 변경 시 스크롤 위치를 최상단으로 초기화합니다.
  - 전환 중에는 Lenis를 멈추고, 전환 완료 후 다시 시작합니다.
- `components/SmoothScroll.tsx`의 `LenisInit`
  - 전역 부드러운 스크롤 엔진으로 `lenis`를 사용합니다.
  - Lenis를 `gsap.ticker`와 연결합니다.
  - `ScrollTrigger.scrollerProxy`를 설정해 GSAP와 Lenis가 같은 스크롤 상태를 공유하도록 만듭니다.
- `components/SplashScreen.tsx`의 `SplashScreen`
  - `/` 첫 방문 시에만 실행됩니다.
  - `requestAnimationFrame`으로 Byredo 로고를 그리고 채우는 스플래시 애니메이션을 보여줍니다.
  - 스플래시가 진행되는 동안 스크롤을 막고 Lenis를 일시 정지합니다.
- `components/CustomCursor.tsx`의 `CustomCursor`
  - 마우스 위치를 추적합니다.
  - 링크, 버튼, `[data-cursor-hover]` 위에서는 커서를 확대하고 색상을 바꿉니다.

### 공통 UI
- `components/Header.tsx`의 `Header`
  - 모바일 메뉴 토글.
  - 스크롤 위치에 따른 헤더 스타일 변경.
  - Supabase와 인증 상태 동기화.
  - 로그인 및 회원가입용 `AuthModal`을 엽니다.
- `components/auth/AuthModal.tsx`의 `AuthModal`
  - `createPortal` 기반 모달입니다.
  - 로그인/회원가입 탭 전환을 지원합니다.
  - ESC 닫기, 백드롭 닫기, 바디 스크롤 잠금을 처리합니다.
- `components/Footer.tsx`의 `Footer`
  - `gsap`과 `ScrollTrigger`로 로고 reveal 애니메이션을 적용합니다.
  - 내부 스크롤 컨테이너를 쓰는 페이지를 위해 커스텀 `scroller`를 받을 수 있습니다.

### 주요 외부 라이브러리
- `framer-motion`: 페이지 전환
- `lenis`: 부드러운 스크롤
- `gsap`, `gsap/ScrollTrigger`: reveal, pin, scrub, 가로 이동 등 스크롤 인터랙션
- `@react-three/fiber`, `@react-three/drei`, `three`: 3D 상품 뷰어
- `@supabase/supabase-js`, `@supabase/ssr`: 인증 및 관리자/회원 데이터
- Google Maps Embed: 오프라인 스토어 상세 지도

## `/`

### 인터랙션
- `components/HeroCarousel.tsx`의 `HeroCarousel`
  - `setInterval`로 3초마다 좌우 히어로 이미지를 교체합니다.
  - React state와 CSS `transform`, `transition`으로 동작합니다.
  - 왼쪽은 아래에서 위로, 오른쪽은 위에서 아래로 슬라이드됩니다.
- `components/ProductSection.tsx`의 `ProductSection`
  - 상품 카드가 스크롤 진입 시 clip-path 애니메이션으로 reveal 됩니다.
- `components/MainPageReveal.tsx`의 `EditorialImageReveal`, `JournalSectionReveal`
  - 에디토리얼 영역과 저널 영역에 같은 GSAP reveal 패턴을 재사용합니다.
- `components/sections/CollectionsMarquee.tsx`의 `CollectionsMarquee`
  - `requestAnimationFrame` 기반 무한 마키입니다.
  - wheel 입력에 따라 방향과 속도가 바뀝니다.
  - `ResizeObserver`로 너비를 다시 계산합니다.
  - 카드 hover 시 큰 배경 텍스트가 바뀝니다.

### 구현 방식
- 메인 페이지의 대부분의 reveal은 `GSAP + ScrollTrigger + clip-path` 패턴을 사용합니다.
- 일부 reveal 애니메이션은 페이지 전환이 끝난 뒤에 trigger를 생성하도록 지연 처리되어 있습니다.

### 플러그인 및 라이브러리
- `gsap`
- `gsap/ScrollTrigger`
- `framer-motion`
- `lenis`

## `/shop`

### 인터랙션
- `app/shop/ShopPageClient.tsx`의 `ShopPageClient`
  - 카테고리 버튼으로 상품을 필터링합니다.
  - 필터링된 결과는 reveal 애니메이션을 다시 실행합니다.
  - 결과가 없으면 empty state를 표시합니다.

### 구현 방식
- 필터링은 React state와 `useMemo`로 처리합니다.
- reveal 설정은 `useLayoutEffect`와 `useEffect`로 나눠 구현되어 있습니다.
- 목록 애니메이션은 스크롤 트리거가 아니라 필터 결과가 바뀔 때 실행됩니다.

### 플러그인 및 라이브러리
- `gsap`

## `/shop/[product]`

### 인터랙션
- `app/shop/[product]/ProductDetailClient.tsx`의 `ProductDetailClient`
  - 여러 단계로 구성된 스크롤 기반 스토리 레이아웃입니다.
  - dot navigation을 누르면 해당 스크롤 위치로 이동합니다.
  - 현재 단계에 따라 `Header`와 `ShopPinHeader`가 전환됩니다.
  - 로컬 상태 기반 위시리스트 하트 토글이 있습니다.
  - 체크아웃 모달은 URL query parameter로 제어됩니다.
- `components/sections/RelatedProducts.tsx`의 `RelatedProducts`
  - 좌우 화살표 기반 관련 상품 캐러셀입니다.
  - 섹션 진입 시 reveal 애니메이션이 실행됩니다.
- `components/checkout/CheckoutModal.tsx`의 `CheckoutModal`
  - ESC 닫기, 백드롭 닫기, 바디 스크롤 잠금, 포털 렌더링을 지원합니다.

### 3D 뷰어
- `components/sections/PerfumeViewer.tsx`의 `PerfumeViewer`
  - `Canvas` 안에서 GLB 상품 모델을 렌더링합니다.
  - `useGLTF`로 `/assets/3D/byredo.glb`를 불러옵니다.
  - 스크롤 진행률에 따라 카메라 위치를 보간합니다.
  - 병 뚜껑이 열리는 애니메이션도 진행률에 맞춰 적용합니다.
  - `Environment`, `ContactShadows`, 여러 조명을 사용합니다.

### 구현 방식
- 이 페이지는 `data-lenis-prevent`가 있는 자체 내부 스크롤 컨테이너를 사용합니다.
- `ScrollTrigger.scrollerProxy`를 해당 컨테이너에 직접 연결합니다.
- 단계 상태, 헤더 상태, 3D 뷰어 진행률이 모두 같은 정규화된 스크롤 진행률을 공유합니다.

### 플러그인 및 라이브러리
- `gsap`
- `gsap/ScrollTrigger`
- `@react-three/fiber`
- `@react-three/drei`
- `three`

## `/checkout`

### 인터랙션
- `components/checkout/CheckoutQuantityPanel.tsx`의 `CheckoutQuantityPanel`
  - 수량 증가/감소 버튼.
  - 총 가격이 즉시 다시 계산됩니다.

### 구현 방식
- React state와 `useMemo`를 사용합니다.
- 결제 버튼은 현재 플레이스홀더입니다.

### 플러그인 및 라이브러리
- 이 페이지 자체에 특수 애니메이션 플러그인은 없습니다.

## `/offline-store`

### 인터랙션
- `app/offline-store/page.tsx`
  - 세로 스크롤이 고정된 가로 갤러리 이동을 구동합니다.
  - 현재 스토어 인덱스가 스크롤 진행률에 따라 갱신됩니다.

### 구현 방식
- `data-lenis-prevent`가 있는 자체 스크롤 컨테이너를 사용합니다.
- `gsap.to(track, { x: ... })`와 `ScrollTrigger`의 pin, scrub을 조합합니다.
- 종료 지점은 트랙 너비를 기준으로 계산합니다.

### 플러그인 및 라이브러리
- `gsap`
- `gsap/ScrollTrigger`

## `/offline-store/detail`

### 인터랙션
- `app/offline-store/detail/CopyAddressButton.tsx`의 `CopyAddressButton`
  - Clipboard API로 매장 주소를 복사합니다.
- `app/offline-store/detail/GoogleMap.tsx`의 `GoogleMap`
  - 주소를 기준으로 embed URL을 생성합니다.
  - API 키가 있으면 Google Maps Embed API를, 없으면 fallback embed URL을 사용합니다.
- `app/offline-store/detail/DetailContent.tsx`의 `DetailContent`
  - 갤러리 컬럼이 스크롤 진입 시 reveal 됩니다.
  - 매장 테이블 행 hover 시 미리보기 이미지가 바뀝니다.
  - hover와 focus를 모두 지원합니다.

### 구현 방식
- 페이지는 `dynamic(..., { ssr: false })`로 `DetailContent`를 불러옵니다.
- hover preview는 짧은 timeout으로 깜빡임을 줄입니다.

### 플러그인 및 라이브러리
- `gsap`
- `gsap/ScrollTrigger`
- Google Maps Embed
- Clipboard API

## `/offline-store/[place]`

### 상태
- 단순히 라우트 파라미터를 출력하는 페이지입니다.
- 눈에 띄는 인터랙션이나 플러그인 사용은 없습니다.

## `/journal`

### 인터랙션
- `app/journal/JournalView.tsx`의 `JournalView`
  - 카드가 중앙으로 모였다가 큰 캔버스로 퍼집니다.
  - 인트로 이후에는 마우스 이동에 따라 캔버스 전체가 부드럽게 이동합니다.
  - 카드 hover 시 중앙 타이틀과 서브타이틀이 바뀝니다.

### 구현 방식
- `dynamic(..., { ssr: false })`로 로드됩니다.
- GSAP를 런타임에 import하고 timeline으로 gather/spread 시퀀스를 제어합니다.
- 캔버스 이동은 `requestAnimationFrame`과 lerp 보간으로 처리합니다.
- `/journal`은 일반 페이지 전환 래퍼 동작을 우회해서 전용 인트로가 바로 시작되게 합니다.

### 플러그인 및 라이브러리
- `gsap`
- `requestAnimationFrame` 루프

## `/mypage`

### 인터랙션
- 비로그인 사용자는 안내 화면을 봅니다.
- 로그인 사용자는 프로필 필드를 수정할 수 있습니다.
- 주문 내역과 배송 정보가 같은 페이지에 표시됩니다.

### 구현 방식
- `MyPageProfileForm`은 controlled input과 `useTransition`을 사용합니다.
- 저장은 서버 액션 `updateMyPageProfileAction`으로 처리합니다.
- 성공/실패 메시지는 인라인으로 표시됩니다.

### 플러그인 및 라이브러리
- Supabase 기반 회원 데이터

## `/admin/login`

### 인터랙션
- `AdminLoginForm`
  - 이메일과 비밀번호에 대한 클라이언트 검증.
  - 입력값 변경 시 필드 에러 해제.
  - 제출 중 pending 상태 표시.

### 구현 방식
- 실제 로그인 처리는 서버 액션 `loginAdminAction`이 담당합니다.
- 이미 로그인된 관리자는 `/admin`으로 리다이렉트됩니다.

### 플러그인 및 라이브러리
- Supabase 인증

## `/admin` 및 `/admin/dashboard`

### 인터랙션
- `/admin`은 `/admin/dashboard`로 리다이렉트됩니다.
- 대시보드는 링크와 표 중심의 요약/탐색 화면입니다.

### 구현 방식
- 서버 렌더링된 요약 데이터를 사용합니다.
- 상태 표시는 `StatusBadge`로 통일합니다.

### 플러그인 및 라이브러리
- Supabase 기반 관리자 데이터

## 관리자 공통 레이아웃

### 인터랙션
- `app/admin/layout.tsx`
  - 인증되지 않은 사용자를 `/admin/login`으로 리다이렉트합니다.
- `components/admin/AdminHeader.tsx`의 `AdminHeader`
  - 검색어에 따라 주문, 회원, 상품 페이지로 라우팅합니다.
  - 모바일 검색 토글.
  - 모바일 드로어 메뉴.
  - 로그아웃 폼.

### 플러그인 및 라이브러리
- Next navigation
- Supabase 인증

## `/admin/products`

### 인터랙션
- 검색
- 상품 생성 모달
- 카테고리 생성 모달
- 상품 수정 모달
- 상품 삭제
- 이미지 업로드용 파일 입력

### 구현 방식
- `ProductsManagement`가 대부분의 상태를 보유합니다.
- 생성, 수정, 삭제, 카테고리 생성은 서버 액션으로 처리합니다.
- 모달 노출 여부는 로컬 React state로 제어합니다.

### 플러그인 및 라이브러리
- Supabase 기반 관리자 액션

## `/admin/orders`

### 인터랙션
- 주문/결제 통합 검색
- 주문 상세 모달
- 결제 상세 모달
- 주문 상태 변경
- 결제 상태 변경

### 구현 방식
- `OrdersManagement`가 주문과 결제를 함께 관리합니다.
- 상태 변경 중에는 `useTransition`을 사용하고, 이후 로컬 상태를 갱신합니다.

### 플러그인 및 라이브러리
- Supabase 기반 관리자 액션

## `/admin/payments`

### 상태
- `/admin/orders`로 리다이렉트됩니다.

## `/admin/members`

### 인터랙션
- 검색
- 역할 필터
- 페이지네이션
- 회원 생성 모달
- 회원 상세 및 역할 변경 모달

### 구현 방식
- `MembersManagement`가 query, filter, page, modal 상태를 클라이언트에서 관리합니다.
- 역할 변경과 계정 생성은 `canManageRoles` 조건으로 제한됩니다.
- 서버 액션 결과를 다시 로컬 상태에 반영합니다.

### 플러그인 및 라이브러리
- Supabase 기반 관리자 액션

## `/admin/settings`

### 인터랙션
- 설정 섹션 전환
- 필드 편집
- boolean 토글 필드
- secret 보기/숨기기
- 섹션 단위 저장
- 변경 로그 표시

### 구현 방식
- `SettingsManagement`는 현재 상태와 저장된 상태를 함께 유지합니다.
- 관리자 역할에 따라 보이는 섹션이 달라집니다.

### 플러그인 및 라이브러리
- 대부분 React state 기반

## 참고
- `hooks/useScrollReveal.ts`는 재사용 가능한 GSAP reveal 훅이지만, 현재 주요 페이지는 이 훅을 재사용하기보다 각 컴포넌트 안에서 같은 패턴을 직접 구현하는 경우가 많습니다.
