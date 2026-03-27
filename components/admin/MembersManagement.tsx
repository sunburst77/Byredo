'use client'

import { useEffect, useState, useTransition } from 'react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import type { AdminMemberRow } from '@/lib/admin/data'
import styles from './MembersManagement.module.css'

type MembersManagementProps = {
  initialMembers: AdminMemberRow[]
  initialQuery?: string
  canManageRoles: boolean
  currentAdminId: string
  onCreateMemberAction: (formData: FormData) => Promise<{ ok: boolean; message: string }>
  onRoleChangeAction: (formData: FormData) => Promise<void>
}

type CreateFormState = {
  fullName: string
  email: string
  phone: string
  password: string
  role: AdminMemberRow['role']
}

const ROLE_FILTERS = [
  { label: '전체', value: 'all' },
  { label: '관리자', value: 'admin' },
  { label: '스태프', value: 'staff' },
  { label: '일반회원', value: 'customer' },
] as const

const PAGE_SIZE = 8
const ROLE_OPTIONS: AdminMemberRow['role'][] = ['admin', 'staff', 'customer']
const createFormInitialState: CreateFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'staff',
}

function formatLongDate(value: string | null) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export function MembersManagement({
  initialMembers,
  initialQuery = '',
  canManageRoles,
  currentAdminId,
  onCreateMemberAction,
  onRoleChangeAction,
}: MembersManagementProps) {
  const [members, setMembers] = useState(initialMembers)
  const [query, setQuery] = useState(initialQuery)
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]['value']>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<AdminMemberRow['role']>('customer')
  const [roleErrorMessage, setRoleErrorMessage] = useState('')
  const [createForm, setCreateForm] = useState<CreateFormState>(createFormInitialState)
  const [createMessage, setCreateMessage] = useState('')
  const [createErrorMessage, setCreateErrorMessage] = useState('')
  const [isCreatePending, startCreateTransition] = useTransition()
  const [isRolePending, startRoleTransition] = useTransition()

  useEffect(() => {
    setMembers(initialMembers)
  }, [initialMembers])

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, roleFilter])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredMembers = members.filter((member) => {
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesQuery =
      !normalizedQuery ||
      member.name.toLowerCase().includes(normalizedQuery) ||
      member.email.toLowerCase().includes(normalizedQuery)

    return matchesRole && matchesQuery
  })

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedMembers = filteredMembers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? null

  useEffect(() => {
    if (selectedMember) {
      setSelectedRole(selectedMember.role)
    }
  }, [selectedMember])

  const adminCount = members.filter((member) => member.role === 'admin').length
  const staffCount = members.filter((member) => member.role === 'staff').length
  const customerCount = members.filter((member) => member.role === 'customer').length
  const activeCount = members.filter((member) => member.status === 'active').length
  const isCurrentAdminMember = selectedMember?.id === currentAdminId

  function handleCreateInputChange<K extends keyof CreateFormState>(key: K, value: CreateFormState[K]) {
    setCreateForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function openCreateModal() {
    setCreateMessage('')
    setCreateErrorMessage('')
    setCreateForm(createFormInitialState)
    setIsCreateModalOpen(true)
  }

  function handleCreateMember() {
    if (!canManageRoles) {
      return
    }

    const formData = new FormData()
    formData.set('fullName', createForm.fullName)
    formData.set('email', createForm.email)
    formData.set('phone', createForm.phone)
    formData.set('password', createForm.password)
    formData.set('role', createForm.role)
    setCreateMessage('')
    setCreateErrorMessage('')

    startCreateTransition(async () => {
      try {
        const result = await onCreateMemberAction(formData)
        const createdAt = new Date().toISOString()

        setMembers((current) => [
          {
            id: `new-${createForm.email}-${Date.now()}`,
            name: createForm.fullName,
            email: createForm.email.trim().toLowerCase(),
            phone: createForm.phone.trim() || '-',
            role: createForm.role,
            joinedAt: formatShortDate(createdAt),
            joinedAtRaw: createdAt,
            orders: 0,
            status: 'active',
          },
          ...current,
        ])
        setCreateMessage(result.message)
        setCreateForm(createFormInitialState)
        setIsCreateModalOpen(false)
      } catch (error) {
        setCreateErrorMessage(error instanceof Error ? error.message : '계정 생성 중 오류가 발생했습니다.')
      }
    })
  }

  function handleRoleSave() {
    if (!selectedMember || !canManageRoles || selectedRole === selectedMember.role) {
      return
    }

    const formData = new FormData()
    formData.set('memberId', selectedMember.id)
    formData.set('role', selectedRole)
    setRoleErrorMessage('')

    startRoleTransition(async () => {
      try {
        await onRoleChangeAction(formData)
        setMembers((current) =>
          current.map((member) =>
            member.id === selectedMember.id
              ? {
                  ...member,
                  role: selectedRole,
                }
              : member
          )
        )
      } catch (error) {
        setRoleErrorMessage(error instanceof Error ? error.message : '권한 변경 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Members</p>
          <h1 className={styles.title}>회원관리</h1>
          <p className={styles.description}>
            이름과 이메일로 검색하고 역할별로 필터링하면서 회원 상태를 확인할 수 있습니다. 상세 보기에서는 가입 정보와 주문 건수를 보고,
            관리자 계정은 여기서 바로 역할을 변경할 수 있습니다.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.metaChip}>전체 {members.length}명</span>
          <span className={styles.metaChip}>활성 {activeCount}명</span>
          <button type="button" className={styles.primaryAction} onClick={openCreateModal} disabled={!canManageRoles}>
            관리자 추가
          </button>
        </div>
      </section>

      <section className={styles.metricGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Total Members</p>
          <p className={styles.metricValue}>{members.length}</p>
          <p className={styles.metricMeta}>현재 등록된 전체 회원</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Admins</p>
          <p className={styles.metricValue}>{adminCount}</p>
          <p className={styles.metricMeta}>운영 권한 보유 계정</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Staff</p>
          <p className={styles.metricValue}>{staffCount}</p>
          <p className={styles.metricMeta}>실무 운영 스태프</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Customers</p>
          <p className={styles.metricValue}>{customerCount}</p>
          <p className={styles.metricMeta}>일반 구매 회원</p>
        </article>
      </section>

      {createMessage ? <p className={styles.successText}>{createMessage}</p> : null}

      <section className={styles.tableCard}>
        <div className={styles.toolbar}>
          <label className={styles.searchField}>
            <span className={styles.searchLabel}>검색</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={styles.searchInput}
              type="search"
              placeholder="이름 또는 이메일 검색"
            />
          </label>

          <div className={styles.filterGroup}>
            {ROLE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setRoleFilter(filter.value)}
                className={filter.value === roleFilter ? styles.filterButtonActive : styles.filterButton}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <div className={`${styles.tableRow} ${styles.tableHead}`}>
            <span>회원</span>
            <span>가입일</span>
            <span>권한</span>
            <span>상태</span>
            <span>주문</span>
            <span>상세</span>
          </div>

          {paginatedMembers.length === 0 ? (
            <div className={styles.empty}>조건에 맞는 회원이 없습니다.</div>
          ) : (
            paginatedMembers.map((member) => (
              <div key={member.id} className={styles.tableRow}>
                <div>
                  <p className={styles.primaryCell}>{member.name}</p>
                  <p className={styles.secondaryCell}>{member.email}</p>
                </div>
                <span>{member.joinedAt}</span>
                <span>
                  <StatusBadge status={member.role} />
                </span>
                <span>
                  <StatusBadge status={member.status} />
                </span>
                <span className={styles.primaryCell}>{member.orders}건</span>
                <span>
                  <button type="button" className={styles.detailButton} onClick={() => setSelectedMemberId(member.id)}>
                    상세 보기
                  </button>
                </span>
              </div>
            ))
          )}
        </div>

        <div className={styles.pagination}>
          <p className={styles.paginationMeta}>
            {filteredMembers.length === 0 ? '0명' : `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, filteredMembers.length)} / ${filteredMembers.length}명`}
          </p>
          <div className={styles.paginationButtons}>
            <button type="button" className={styles.pageButton} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safePage === 1}>
              이전
            </button>
            <span className={styles.pageIndicator}>
              {safePage} / {totalPages}
            </span>
            <button type="button" className={styles.pageButton} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safePage === totalPages}>
              다음
            </button>
          </div>
        </div>
      </section>

      {isCreateModalOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Create Account</p>
                <h2 className={styles.modalTitle}>관리자 계정 추가</h2>
              </div>
              <button type="button" className={styles.closeButton} onClick={() => setIsCreateModalOpen(false)}>
                닫기
              </button>
            </div>

            <div className={styles.createGrid}>
              <label className={styles.inputField}>
                <span className={styles.searchLabel}>이름</span>
                <input className={styles.searchInput} value={createForm.fullName} onChange={(event) => handleCreateInputChange('fullName', event.target.value)} placeholder="홍길동" />
              </label>
              <label className={styles.inputField}>
                <span className={styles.searchLabel}>이메일</span>
                <input className={styles.searchInput} type="email" value={createForm.email} onChange={(event) => handleCreateInputChange('email', event.target.value)} placeholder="admin@example.com" />
              </label>
              <label className={styles.inputField}>
                <span className={styles.searchLabel}>연락처</span>
                <input className={styles.searchInput} value={createForm.phone} onChange={(event) => handleCreateInputChange('phone', event.target.value)} placeholder="010-0000-0000" />
              </label>
              <label className={styles.inputField}>
                <span className={styles.searchLabel}>초기 비밀번호</span>
                <input className={styles.searchInput} type="password" value={createForm.password} onChange={(event) => handleCreateInputChange('password', event.target.value)} placeholder="8자 이상 입력" />
              </label>
              <label className={styles.inputField}>
                <span className={styles.searchLabel}>권한</span>
                <select className={styles.roleSelect} value={createForm.role} onChange={(event) => handleCreateInputChange('role', event.target.value as AdminMemberRow['role'])} disabled={!canManageRoles}>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.primaryAction} onClick={handleCreateMember} disabled={!canManageRoles || isCreatePending}>
                {isCreatePending ? '생성 중...' : '계정 추가'}
              </button>
            </div>

            {createErrorMessage ? <p className={styles.errorText}>{createErrorMessage}</p> : null}
          </div>
        </div>
      ) : null}

      {selectedMember ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Member Detail</p>
                <h2 className={styles.modalTitle}>{selectedMember.name}</h2>
              </div>
              <button type="button" className={styles.closeButton} onClick={() => setSelectedMemberId(null)}>
                닫기
              </button>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>이메일</span>
                <strong>{selectedMember.email}</strong>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>연락처</span>
                <strong>{selectedMember.phone}</strong>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>가입일</span>
                <strong>{formatLongDate(selectedMember.joinedAtRaw)}</strong>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>주문 수</span>
                <strong>{selectedMember.orders}건</strong>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>현재 권한</span>
                <StatusBadge status={selectedMember.role} />
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>상태</span>
                <StatusBadge status={selectedMember.status} />
              </div>
            </div>

            <div className={styles.rolePanel}>
              <div>
                <p className={styles.roleTitle}>권한 변경</p>
                <p className={styles.roleDescription}>admin 계정만 회원 역할을 변경할 수 있습니다.</p>
              </div>
              <div className={styles.roleControls}>
                <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as AdminMemberRow['role'])} className={styles.roleSelect} disabled={!canManageRoles}>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role} disabled={isCurrentAdminMember && role !== 'admin'}>
                      {role}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleRoleSave}
                  disabled={!canManageRoles || isRolePending || selectedRole === selectedMember.role || (selectedMember.id === currentAdminId && selectedRole !== 'admin')}
                  className={styles.saveButton}
                >
                  {isRolePending ? '변경 중...' : '권한 저장'}
                </button>
              </div>
              {!canManageRoles ? <p className={styles.roleHint}>현재 계정은 권한 변경 권한이 없습니다.</p> : null}
              {isCurrentAdminMember ? <p className={styles.roleHint}>현재 로그인한 관리자 계정은 admin 상태로 유지됩니다.</p> : null}
              {roleErrorMessage ? <p className={styles.errorText}>{roleErrorMessage}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
