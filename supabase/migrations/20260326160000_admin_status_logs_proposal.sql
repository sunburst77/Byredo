begin;

create table if not exists public.admin_status_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('order', 'payment')),
  entity_id uuid not null,
  entity_key text,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  reason text,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_status_logs_entity on public.admin_status_logs(entity_type, entity_id, created_at desc);
create index if not exists idx_admin_status_logs_changed_by on public.admin_status_logs(changed_by, created_at desc);

comment on table public.admin_status_logs is '주문/결제 상태 변경 이력 로그 제안 구조';
comment on column public.admin_status_logs.snapshot is '상태 변경 시점의 주문/결제 핵심 데이터를 jsonb로 저장';

commit;
