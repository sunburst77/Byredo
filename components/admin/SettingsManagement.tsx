'use client'

import { useEffect, useMemo, useState } from 'react'
import type { SettingsField, SettingsRole, SettingsSection } from '@/lib/admin/settings'
import { settingsSections } from '@/lib/admin/settings'
import styles from './SettingsManagement.module.css'

type SettingsManagementProps = {
  role: SettingsRole
  adminName: string
}

type SectionValues = Record<string, string | boolean>
type SettingsState = Record<string, SectionValues>
type ChangeLogItem = {
  id: string
  sectionId: string
  sectionTitle: string
  changedAt: string
  changedBy: string
  summary: string
}

const STORAGE_KEY = 'byredo_admin_settings_v1'
const LOG_KEY = 'byredo_admin_settings_logs_v1'

function SectionIcon({ sectionId }: { sectionId: SettingsSection['id'] }) {
  const iconMap: Record<SettingsSection['id'], string> = {
    basic_info: 'BI',
    admin_accounts: 'AD',
    member: 'MB',
    product: 'PD',
    order: 'OR',
    payment: 'PY',
    shipping: 'SH',
    notifications: 'NT',
    security: 'SC',
    logs_history: 'LG',
    integrations: 'EX',
    policies: 'PL',
  }

  return <span className={styles.menuIcon}>{iconMap[sectionId]}</span>
}

function maskValue(value: string) {
  if (value.length <= 8) {
    return '*'.repeat(Math.max(8, value.length))
  }

  return `${value.slice(0, 4)}${'*'.repeat(Math.max(4, value.length - 8))}${value.slice(-4)}`
}

function buildInitialState(sections: SettingsSection[]) {
  return sections.reduce<SettingsState>((acc, section) => {
    acc[section.id] = section.fields.reduce<SectionValues>((fieldAcc, field) => {
      fieldAcc[field.id] = field.value
      return fieldAcc
    }, {})
    return acc
  }, {})
}

function formatLogTime(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function SettingsManagement({ role, adminName }: SettingsManagementProps) {
  const visibleSections = useMemo(() => settingsSections.filter((section) => section.allowedRoles.includes(role)), [role])
  const [activeSectionId, setActiveSectionId] = useState(visibleSections[0]?.id ?? 'basic_info')
  const [settingsState, setSettingsState] = useState<SettingsState>(() => buildInitialState(visibleSections))
  const [savedState, setSavedState] = useState<SettingsState>(() => buildInitialState(visibleSections))
  const [logs, setLogs] = useState<ChangeLogItem[]>([])
  const [message, setMessage] = useState('')
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const baseState = buildInitialState(visibleSections)
    setSettingsState(baseState)
    setSavedState(baseState)
    if (visibleSections[0] && !visibleSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(visibleSections[0].id)
    }
  }, [visibleSections, activeSectionId])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const savedSettings = window.localStorage.getItem(STORAGE_KEY)
    const savedLogs = window.localStorage.getItem(LOG_KEY)

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings) as SettingsState
      setSettingsState((current) => ({ ...current, ...parsed }))
      setSavedState((current) => ({ ...current, ...parsed }))
    }

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs) as ChangeLogItem[])
    }
  }, [])

  const activeSection = visibleSections.find((section) => section.id === activeSectionId) ?? visibleSections[0]
  const currentValues = activeSection ? settingsState[activeSection.id] ?? {} : {}
  const currentSavedValues = activeSection ? savedState[activeSection.id] ?? {} : {}
  const changedFieldCount = activeSection
    ? activeSection.fields.filter((field) => currentValues[field.id] !== currentSavedValues[field.id]).length
    : 0

  function updateField(sectionId: string, fieldId: string, value: string | boolean) {
    setSettingsState((current) => ({
      ...current,
      [sectionId]: {
        ...current[sectionId],
        [fieldId]: value,
      },
    }))
    setMessage('')
  }

  function toggleSecret(fieldId: string) {
    setVisibleSecrets((current) => ({
      ...current,
      [fieldId]: !current[fieldId],
    }))
  }

  function saveSection() {
    if (!activeSection) {
      return
    }

    const changedFields = activeSection.fields.filter(
      (field) => settingsState[activeSection.id]?.[field.id] !== savedState[activeSection.id]?.[field.id]
    )

    if (changedFields.length === 0) {
      setMessage('변경된 항목이 없습니다. 현재 설정이 최신 상태입니다.')
      return
    }

    const nextSavedState = {
      ...savedState,
      [activeSection.id]: {
        ...settingsState[activeSection.id],
      },
    }

    const nextLog: ChangeLogItem = {
      id: `${activeSection.id}-${Date.now()}`,
      sectionId: activeSection.id,
      sectionTitle: activeSection.title,
      changedAt: formatLogTime(),
      changedBy: adminName,
      summary: changedFields.map((field) => field.label).join(', '),
    }

    setSavedState(nextSavedState)
    setLogs((current) => {
      const nextLogs = [nextLog, ...current].slice(0, 12)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOG_KEY, JSON.stringify(nextLogs))
      }
      return nextLogs
    })
    setMessage(`${activeSection.title} 저장이 완료되었습니다. ${changedFields.length}개 항목이 반영되었습니다.`)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSavedState))
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Settings</p>
          <h1 className={styles.title}>관리자 설정</h1>
          <p className={styles.description}>
            운영 기준, 결제/배송 정책, 보안 옵션, 외부 연동 값을 한 화면에서 관리할 수 있도록 구성했습니다. 초보 운영자도 이해하기 쉽도록 각 항목마다 설명을 함께 제공합니다.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.metaChip}>접근 권한 {role}</span>
          <span className={styles.metaChip}>노출 메뉴 {visibleSections.length}개</span>
        </div>
      </section>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <p className={styles.sidebarTitle}>설정 메뉴</p>
            <p className={styles.sidebarText}>권한에 따라 접근 가능한 설정만 노출됩니다.</p>
            <div className={styles.menuList}>
              {visibleSections.map((section) => {
                const isActive = section.id === activeSection?.id
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`${styles.menuButton} ${isActive ? styles.menuButtonActive : ''}`}
                    onClick={() => {
                      setActiveSectionId(section.id)
                      setMessage('')
                    }}
                  >
                    <span className={styles.menuButtonInner}>
                      <SectionIcon sectionId={section.id} />
                      <span className={styles.menuLabel}>{section.shortLabel}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        <section className={styles.content}>
          {activeSection ? (
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <div>
                  <p className={styles.eyebrow}>Section</p>
                  <h2 className={styles.sectionTitle}>{activeSection.title}</h2>
                  <p className={styles.sectionDescription}>{activeSection.description}</p>
                </div>
                <div className={styles.formActions}>
                  <span className={styles.changeChip}>변경 {changedFieldCount}건</span>
                  <button type="button" className={styles.primaryButton} onClick={saveSection}>
                    저장
                  </button>
                </div>
              </div>

              <div className={styles.formGrid}>
                {activeSection.fields.map((field) => {
                  const value = currentValues[field.id]
                  const secretVisible = visibleSecrets[field.id]
                  const stringValue = typeof value === 'string' ? value : ''
                  const displayValue = field.sensitive && !secretVisible ? maskValue(stringValue) : stringValue

                  return (
                    <label key={field.id} className={`${styles.field} ${field.type === 'textarea' ? styles.fieldWide : ''}`}>
                      <span className={styles.fieldLabel}>{field.label}</span>
                      <span className={styles.fieldDescription}>{field.description}</span>

                      {field.type === 'textarea' ? (
                        <textarea
                          className={styles.textarea}
                          value={stringValue}
                          onChange={(event) => updateField(activeSection.id, field.id, event.target.value)}
                          placeholder={field.placeholder}
                          rows={5}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          className={styles.input}
                          value={stringValue}
                          onChange={(event) => updateField(activeSection.id, field.id, event.target.value)}
                        >
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : field.type === 'switch' ? (
                        <button
                          type="button"
                          className={`${styles.switch} ${value ? styles.switchOn : styles.switchOff}`}
                          onClick={() => updateField(activeSection.id, field.id, !Boolean(value))}
                        >
                          <span>{value ? '사용' : '사용 안 함'}</span>
                          <span className={styles.switchThumb} />
                        </button>
                      ) : (
                        <div className={styles.inputWrap}>
                          <input
                            className={styles.input}
                            type={field.sensitive && !secretVisible ? 'password' : field.type === 'number' ? 'number' : field.type === 'time' ? 'time' : 'text'}
                            value={field.sensitive && !secretVisible ? displayValue : stringValue}
                            onChange={(event) => updateField(activeSection.id, field.id, event.target.value)}
                            placeholder={field.placeholder}
                          />
                          {field.sensitive ? (
                            <button type="button" className={styles.ghostButton} onClick={() => toggleSecret(field.id)}>
                              {secretVisible ? '마스킹' : '보기'}
                            </button>
                          ) : null}
                        </div>
                      )}
                    </label>
                  )
                })}
              </div>

              {message ? <p className={styles.successMessage}>{message}</p> : null}
            </div>
          ) : null}
        </section>

        <aside className={styles.logPanel}>
          <div className={styles.logCard}>
            <p className={styles.sidebarTitle}>변경 이력</p>
            <p className={styles.sidebarText}>최근 저장 기준으로 최대 12건까지 표시합니다.</p>
            <div className={styles.logList}>
              {logs.length === 0 ? (
                <div className={styles.emptyLog}>아직 저장된 변경 이력이 없습니다.</div>
              ) : (
                logs.map((log) => (
                  <article key={log.id} className={styles.logItem}>
                    <p className={styles.logTitle}>{log.sectionTitle}</p>
                    <p className={styles.logSummary}>{log.summary}</p>
                    <p className={styles.logMeta}>{log.changedBy} · {log.changedAt}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className={styles.logCard}>
            <p className={styles.sidebarTitle}>이력 설계 메모</p>
            <div className={styles.designList}>
              <div>
                <strong>권장 저장 구조</strong>
                <p>`admin_settings`에 현재값을 저장하고, `admin_setting_logs`에 변경 전후 스냅샷을 적재하는 구조를 권장합니다.</p>
              </div>
              <div>
                <strong>필수 컬럼</strong>
                <p>section_id, field_id, before_value, after_value, changed_by, reason, changed_at</p>
              </div>
              <div>
                <strong>운영 팁</strong>
                <p>결제/보안/외부연동처럼 민감한 메뉴는 변경 사유 입력을 필수로 두면 추적성이 높아집니다.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
