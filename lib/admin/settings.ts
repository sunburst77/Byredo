export type SettingsRole = 'admin' | 'staff'
export type SettingsFieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'switch' | 'password' | 'time'

export type SettingsField = {
  id: string
  label: string
  description: string
  type: SettingsFieldType
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  value: string | boolean
  sensitive?: boolean
}

export type SettingsSection = {
  id:
    | 'basic_info'
    | 'admin_accounts'
    | 'member'
    | 'product'
    | 'order'
    | 'payment'
    | 'shipping'
    | 'notifications'
    | 'security'
    | 'logs_history'
    | 'integrations'
    | 'policies'
  title: string
  shortLabel: string
  description: string
  allowedRoles: SettingsRole[]
  fields: SettingsField[]
}

export const settingsSections: SettingsSection[] = [
  {
    id: 'basic_info',
    title: '기본정보 설정',
    shortLabel: '기본정보',
    description: '브랜드명, 고객 응대 채널, 운영 시간처럼 운영자가 가장 자주 확인하는 기본 정보를 관리합니다.',
    allowedRoles: ['admin', 'staff'],
    fields: [
      { id: 'brand_name', label: '브랜드명', description: '관리자 화면과 고객 안내 메시지에 공통으로 쓰이는 이름입니다.', type: 'text', value: 'BYREDO KOREA' },
      { id: 'support_email', label: '대표 문의 이메일', description: '고객 문의 및 운영 알림 수신에 사용하는 메일 주소입니다.', type: 'email', value: 'support@byredo.kr' },
      { id: 'support_phone', label: '대표 문의 전화', description: 'CS 연락처로 노출되는 대표 전화번호입니다.', type: 'text', value: '02-1234-5678' },
      { id: 'timezone', label: '운영 타임존', description: '주문일, 로그 시간, 알림 전송 기준이 되는 타임존입니다.', type: 'select', value: 'Asia/Seoul', options: [
        { label: 'Asia/Seoul', value: 'Asia/Seoul' },
        { label: 'UTC', value: 'UTC' },
        { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
      ] },
      { id: 'business_hours', label: '운영 시간', description: '초보 운영자도 참고할 수 있게 고객 응대 시간을 명확히 적어 둡니다.', type: 'text', value: '평일 10:00 - 18:00' },
    ],
  },
  {
    id: 'admin_accounts',
    title: '관리자 계정 및 권한 설정',
    shortLabel: '관리자 계정',
    description: '관리자 초대 정책, 기본 권한, 세션 기준처럼 운영 권한과 직접 연결되는 항목입니다.',
    allowedRoles: ['admin'],
    fields: [
      { id: 'invite_policy', label: '계정 초대 방식', description: '새 관리자 계정을 누가 어떤 방식으로 만들 수 있는지 정합니다.', type: 'select', value: 'admin_only', options: [
        { label: '최고 관리자만 초대', value: 'admin_only' },
        { label: '운영 관리자 승인 후 초대', value: 'approval' },
      ] },
      { id: 'default_admin_role', label: '기본 운영 권한', description: '새 관리자 계정을 만들 때 기본으로 제안할 권한입니다.', type: 'select', value: 'staff', options: [
        { label: '스태프', value: 'staff' },
        { label: '관리자', value: 'admin' },
      ] },
      { id: 'session_timeout', label: '세션 유지 시간(분)', description: '장시간 로그인 유지로 인한 보안 위험을 줄이기 위한 기준입니다.', type: 'number', value: '120' },
      { id: 'approval_required', label: '권한 변경 이중 승인', description: '관리자 권한 승급이나 주요 권한 변경 시 추가 승인을 요구합니다.', type: 'switch', value: true },
    ],
  },
  {
    id: 'member',
    title: '회원 설정',
    shortLabel: '회원 설정',
    description: '회원가입 승인, 휴면 전환 기준, 마케팅 수신 기본값처럼 회원 운영 규칙을 정의합니다.',
    allowedRoles: ['admin', 'staff'],
    fields: [
      { id: 'signup_approval', label: '회원가입 수동 승인', description: '가입 즉시 활성화가 아닌, 운영 확인 후 승인하는 방식입니다.', type: 'switch', value: false },
      { id: 'dormant_days', label: '휴면 전환 기준(일)', description: '장기간 미접속 회원을 휴면 상태로 관리할 기준 일수입니다.', type: 'number', value: '180' },
      { id: 'member_grade_policy', label: '회원 등급 기준 메모', description: '운영자가 참고할 수 있도록 등급 부여 기준을 짧게 정리합니다.', type: 'textarea', value: '최근 12개월 구매금액 기준으로 VIP / Gold / Regular를 분류합니다.' },
      { id: 'marketing_default', label: '마케팅 수신 기본값', description: '체크박스를 기본 선택 상태로 둘지 여부를 결정합니다.', type: 'switch', value: false },
    ],
  },
  {
    id: 'product',
    title: '상품 설정',
    shortLabel: '상품 설정',
    description: '기본 노출 정책, 재고 경고 기준, 이미지 운영 가이드를 관리합니다.',
    allowedRoles: ['admin', 'staff'],
    fields: [
      { id: 'default_visibility', label: '기본 상품 노출 상태', description: '신규 상품 등록 시 기본으로 적용할 상태입니다.', type: 'select', value: 'draft', options: [
        { label: '초안', value: 'draft' },
        { label: '활성', value: 'active' },
      ] },
      { id: 'low_stock_threshold', label: '재고 경고 기준', description: '이 수량 이하가 되면 관리자에서 low stock으로 표시합니다.', type: 'number', value: '10' },
      { id: 'review_policy', label: '상품 검수 방식', description: '상품 등록 후 바로 노출할지, 검수 후 노출할지 정합니다.', type: 'select', value: 'manual_review', options: [
        { label: '운영 검수 후 노출', value: 'manual_review' },
        { label: '저장 즉시 노출 가능', value: 'instant' },
      ] },
      { id: 'image_guide', label: '이미지 가이드', description: '운영자가 상품 이미지를 올릴 때 참고할 권장 규격입니다.', type: 'textarea', value: '정사각형 2000px 이상, 배경은 밝은 톤, 파일 용량은 5MB 이하 권장.' },
    ],
  },
  {
    id: 'order',
    title: '주문 설정',
    shortLabel: '주문 설정',
    description: '주문 기본 상태, 취소 허용 시간, 운영자가 수동 보정할 수 있는 범위를 설정합니다.',
    allowedRoles: ['admin', 'staff'],
    fields: [
      { id: 'default_order_status', label: '신규 주문 기본 상태', description: '주문이 생성될 때 기본으로 들어갈 상태입니다.', type: 'select', value: 'pending', options: [
        { label: '대기', value: 'pending' },
        { label: '결제완료', value: 'paid' },
      ] },
      { id: 'auto_confirm_hours', label: '자동 확정 기준(시간)', description: '배송 완료 후 자동 구매확정 처리까지의 시간입니다.', type: 'number', value: '72' },
      { id: 'cancel_window_hours', label: '취소 허용 시간(시간)', description: '고객이 직접 취소를 시도할 수 있는 최대 시간입니다.', type: 'number', value: '3' },
      { id: 'manual_edit_order', label: '운영자 수동 주문 수정 허용', description: '운영자가 주문 상태와 배송지를 직접 수정할 수 있도록 허용합니다.', type: 'switch', value: true },
    ],
  },
  {
    id: 'payment',
    title: '결제 설정',
    shortLabel: '결제 설정',
    description: '결제 provider, 승인 대기 시간, 환불 승인 기준, API 연동 키를 관리합니다.',
    allowedRoles: ['admin'],
    fields: [
      { id: 'default_payment_provider', label: '기본 결제 provider', description: '가장 우선으로 사용할 기본 결제 라우팅입니다.', type: 'select', value: 'toss', options: [
        { label: '토스페이먼츠', value: 'toss' },
        { label: '수기 결제', value: 'manual' },
      ] },
      { id: 'virtual_account_expire_hours', label: '가상계좌 유효 시간(시간)', description: '가상계좌 발급 후 입금 대기 상태를 유지할 기준입니다.', type: 'number', value: '24' },
      { id: 'refund_policy', label: '환불 승인 기준', description: '환불 요청이 들어왔을 때 누가 최종 승인하는지 설정합니다.', type: 'select', value: 'admin_only', options: [
        { label: '관리자 승인', value: 'admin_only' },
        { label: '스태프 즉시 처리', value: 'staff_allowed' },
      ] },
      { id: 'payment_api_key', label: 'Payment API Key', description: '외부 결제사 연동용 공개 키입니다. 화면에서는 마스킹됩니다.', type: 'password', value: 'pk_live_byredo_2026_demo_key', sensitive: true },
      { id: 'payment_secret_key', label: 'Payment Secret Key', description: '결제 승인/취소 API 호출에 쓰이는 비밀 키입니다. 꼭 관리자만 관리하세요.', type: 'password', value: 'sk_live_byredo_2026_demo_secret', sensitive: true },
    ],
  },
  {
    id: 'shipping',
    title: '배송 설정',
    shortLabel: '배송 설정',
    description: '기본 택배사, 무료배송 기준, 송장 발송 정책처럼 배송 운영 기준을 설정합니다.',
    allowedRoles: ['admin', 'staff'],
    fields: [
      { id: 'default_carrier', label: '기본 택배사', description: '운영자가 가장 자주 사용하는 기본 배송사입니다.', type: 'select', value: 'cj', options: [
        { label: 'CJ대한통운', value: 'cj' },
        { label: '롯데택배', value: 'lotte' },
        { label: '한진택배', value: 'hanjin' },
      ] },
      { id: 'free_shipping_threshold', label: '무료배송 기준 금액', description: '이 금액 이상 주문 시 배송비를 자동으로 면제합니다.', type: 'number', value: '150000' },
      { id: 'base_shipping_fee', label: '기본 배송비', description: '무료배송이 아닐 때 기본으로 부과하는 배송비입니다.', type: 'number', value: '3500' },
      { id: 'tracking_auto_send', label: '송장 자동 알림 발송', description: '송장 입력 즉시 고객에게 알림을 보낼지 설정합니다.', type: 'switch', value: true },
    ],
  },
  {
    id: 'notifications',
    title: '알림 설정',
    shortLabel: '알림 설정',
    description: '주문, 결제 실패, 일일 리포트 알림처럼 운영자가 놓치면 안 되는 이벤트를 관리합니다.',
    allowedRoles: ['admin', 'staff'],
    fields: [
      { id: 'order_email_notice', label: '주문 접수 이메일 알림', description: '새 주문 발생 시 운영 메일로 즉시 알림을 보냅니다.', type: 'switch', value: true },
      { id: 'payment_fail_sms', label: '결제 실패 SMS 알림', description: '결제 실패 건을 빠르게 대응할 수 있도록 문자 알림을 활성화합니다.', type: 'switch', value: false },
      { id: 'daily_report_time', label: '일일 리포트 발송 시간', description: '매일 운영 요약 리포트를 보낼 시간을 설정합니다.', type: 'time', value: '09:30' },
      { id: 'slack_webhook', label: 'Slack Webhook URL', description: '운영 알림을 Slack으로 받을 때 사용하는 주소입니다. 화면에서는 마스킹됩니다.', type: 'password', value: 'https://hooks.slack.com/services/T000/B000/DEMOSECRET', sensitive: true },
    ],
  },
  {
    id: 'security',
    title: '보안 설정',
    shortLabel: '보안 설정',
    description: '2단계 인증, IP 허용 목록, 비밀번호 주기처럼 민감한 운영 보안 기준을 정의합니다.',
    allowedRoles: ['admin'],
    fields: [
      { id: 'admin_2fa', label: '관리자 2단계 인증 필수', description: '관리자 로그인 시 추가 인증을 반드시 요구합니다.', type: 'switch', value: true },
      { id: 'allowed_ip', label: '허용 IP 목록', description: '사내망 또는 지정된 장소에서만 접근하도록 제한할 때 사용합니다.', type: 'textarea', value: '211.234.10.1\n211.234.10.2' },
      { id: 'password_cycle', label: '비밀번호 교체 주기(일)', description: '관리자 비밀번호를 정기적으로 갱신하도록 유도합니다.', type: 'number', value: '90' },
      { id: 'audit_retention_days', label: '감사 로그 보관일', description: '관리자 변경 이력을 얼마나 오래 보관할지 정합니다.', type: 'number', value: '365' },
    ],
  },
  {
    id: 'logs_history',
    title: '로그 및 이력',
    shortLabel: '로그 및 이력',
    description: '운영 변경 사항을 언제, 누가, 왜 바꿨는지 남길 수 있도록 로그 보관 정책을 관리합니다.',
    allowedRoles: ['admin'],
    fields: [
      { id: 'log_retention_days', label: '운영 로그 보관일', description: '운영 이력을 몇 일간 보관할지 설정합니다.', type: 'number', value: '365' },
      { id: 'log_export_format', label: '내보내기 포맷', description: '감사 대응용 로그를 어떤 형식으로 저장할지 정합니다.', type: 'select', value: 'csv', options: [
        { label: 'CSV', value: 'csv' },
        { label: 'JSON', value: 'json' },
      ] },
      { id: 'capture_snapshot', label: '변경 전후 스냅샷 저장', description: '중요 설정 변경 시 변경 전후 값을 함께 남깁니다.', type: 'switch', value: true },
      { id: 'critical_alert', label: '중요 설정 변경 실시간 알림', description: '보안, 결제 설정 변경이 생기면 바로 운영 채널에 알려줍니다.', type: 'switch', value: true },
    ],
  },
  {
    id: 'integrations',
    title: '외부 연동 설정',
    shortLabel: '외부 연동',
    description: '분석, ERP, CRM, 마케팅 툴과 연결되는 외부 연동 값을 관리합니다.',
    allowedRoles: ['admin'],
    fields: [
      { id: 'toss_mid', label: 'Toss MID', description: '토스페이먼츠 상점 식별자입니다. 화면에서는 마스킹됩니다.', type: 'password', value: 'mid_byredo_live_2026', sensitive: true },
      { id: 'ga_measurement_id', label: 'GA Measurement ID', description: '유입 및 구매 전환 분석에 사용하는 측정 ID입니다.', type: 'text', value: 'G-BYREDO2026' },
      { id: 'erp_endpoint', label: 'ERP Endpoint', description: 'ERP 주문 동기화용 엔드포인트 주소입니다. 민감 정보이므로 마스킹 처리됩니다.', type: 'password', value: 'https://erp.byredo.internal/sync/orders', sensitive: true },
      { id: 'crm_sync', label: 'CRM 회원 동기화 사용', description: '회원 정보와 구매 이력을 외부 CRM에 동기화합니다.', type: 'switch', value: true },
    ],
  },
  {
    id: 'policies',
    title: '약관/정책 관리',
    shortLabel: '약관/정책',
    description: '약관 버전, 개인정보 담당자, 반품/배송 정책처럼 고객 안내 문구의 기준이 되는 항목입니다.',
    allowedRoles: ['admin', 'staff'],
    fields: [
      { id: 'terms_version', label: '현재 약관 버전', description: '운영자가 고객 고지 버전을 쉽게 추적할 수 있도록 관리합니다.', type: 'text', value: 'v2026.03' },
      { id: 'privacy_manager', label: '개인정보 보호 책임자', description: '정책 문서에 노출되는 내부 담당자명입니다.', type: 'text', value: '김미경' },
      { id: 'return_policy', label: '반품 정책 요약', description: 'CS 응대 시 그대로 참고할 수 있는 반품 정책 요약입니다.', type: 'textarea', value: '상품 수령 후 7일 이내 미개봉 상태에 한해 반품 가능합니다.' },
      { id: 'shipping_policy', label: '배송 정책 요약', description: '운영자와 고객 모두 이해하기 쉬운 배송 정책 문구입니다.', type: 'textarea', value: '평일 오후 2시 이전 결제 완료 주문은 당일 출고를 원칙으로 합니다.' },
    ],
  },
]
