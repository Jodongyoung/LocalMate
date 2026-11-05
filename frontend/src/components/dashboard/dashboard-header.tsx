'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Bell, 
  Store, 
  Users, 
  AlertTriangle, 
  ClipboardList, 
  MessageSquare, 
  Flame
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TableItem } from '@/types/reservation'

interface DashboardHeaderProps {
  onLogout: () => void
  unansweredCount?: number
}

interface NotificationItem {
  id: string
  type: 'reservation' | 'noshow' | 'task' | 'review' | 'full'
  title: string
  description: string
  time: string
  targetPath: string
  isUrgent?: boolean
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const [storeId, setStoreId] = useState('cafe')
  const [storeName, setStoreName] = useState('동성로 카페 (본점)')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [hasUnread, setHasUnread] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 1. 매장 상태 및 실시간 알림 데이터 집계
  const syncNotifications = (currentStore: string) => {
    const isCafe = currentStore === 'cafe'
    setStoreId(currentStore)
    setStoreName(isCafe ? '동성로 카페 (본점)' : '수성 치킨 (지점)')

    const list: NotificationItem[] = []

    // A. 테이블 및 예약 상태 파악
    const savedTables = localStorage.getItem(`localmate_tables_${currentStore}`)
    if (savedTables) {
      try {
        const tables: TableItem[] = JSON.parse(savedTables)
        
        // 1) 만석 여부
        const availableCount = tables.filter(t => t.status === 'available').length
        if (availableCount === 0) {
          list.push({
            id: 'notif-full',
            type: 'full',
            title: '매장 전석 만석 (Full)',
            description: '모든 테이블이 가용 중입니다. 신규 예약은 웨이팅으로 자동 전환됩니다.',
            time: '방금 전',
            targetPath: '/reservations',
            isUrgent: true
          })
        }

        // 2) 노쇼 임박 테이블
        const noShowTables = tables.filter(t => t.status === 'noshow_warning')
        noShowTables.forEach(t => {
          list.push({
            id: `notif-noshow-${t.id}`,
            type: 'noshow',
            title: `[노쇼 임박] ${t.name}`,
            description: `${t.reservation?.guestName} 고객님 유예 시간 초과 임박! 좌석 회수를 검토하세요.`,
            time: '2분 전',
            targetPath: '/reservations',
            isUrgent: true
          })
        })

        // 3) 최근 네이버 예약 건
        const reservedTables = tables.filter(t => t.status === 'reserved' && t.reservation)
        reservedTables.slice(0, 2).forEach(t => {
          list.push({
            id: `notif-res-${t.id}`,
            type: 'reservation',
            title: `[네이버 예약] ${t.name} 자동 배정 완료`,
            description: `${t.reservation?.guestName} 님 (${t.reservation?.guestCount}명) ${t.reservation?.reservedTime} 예약이 배정되었습니다.`,
            time: '10분 전',
            targetPath: '/reservations'
          })
        })
      } catch (e) {}
    }

    // B. AI 업무 승인 대기 파악
    const savedProposals = localStorage.getItem(`localmate_proposals_v5_${currentStore}`)
    if (savedProposals) {
      try {
        const parsed = JSON.parse(savedProposals)
        const pending = parsed.filter((p: any) => p.status === 'pending')
        if (pending.length > 0) {
          list.push({
            id: 'notif-task',
            type: 'task',
            title: `AI 긴급 제안 ${pending.length}건 승인 대기`,
            description: pending[0]?.title || '매장 운영 최적화를 위한 AI 조치가 대기 중입니다.',
            time: '15분 전',
            targetPath: '/tasks',
            isUrgent: true
          })
        }
      } catch (e) {}
    }

    // C. 🎯 실시간 영속화된 리뷰 데이터 기반 미답변 건수 직접 산출
    const savedReviews = localStorage.getItem(`localmate_reviews_v2_${currentStore}`)
    let unansweredCount = 0
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews)
        unansweredCount = parsedReviews.filter((r: any) => !r.reply).length
      } catch (e) {}
    }

    // 미답변 리뷰가 1건 이상일 때만 알림 목록에 추가 (0건이면 완벽히 제외!)
    if (unansweredCount > 0) {
      list.push({
        id: 'notif-review',
        type: 'review',
        title: `미답변 고객 리뷰 ${unansweredCount}건 대기`,
        description: 'AI가 사장님 맞춤 어조로 작성한 답글 초안이 준비되어 있습니다.',
        time: '방금 전',
        targetPath: '/reviews'
      })
    }

    setNotifications(list)
  }

  useEffect(() => {
    const current = localStorage.getItem('localmate_store_id') || 'cafe'
    syncNotifications(current)

    const handleStoreChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        syncNotifications(customEvent.detail)
      }
    }

    const handleUpdate = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      syncNotifications(currentStore)
    }

    // 리뷰 상태 업데이트 리스너 연결
    window.addEventListener('storeChange', handleStoreChange)
    window.addEventListener('pendingTasksUpdated', handleUpdate)
    window.addEventListener('reviewsUpdated', handleUpdate)

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('storeChange', handleStoreChange)
      window.removeEventListener('pendingTasksUpdated', handleUpdate)
      window.removeEventListener('reviewsUpdated', handleUpdate)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleNotificationClick = (path: string) => {
    setIsDropdownOpen(false)
    navigate(path)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-6 backdrop-blur font-sans">
      
      {/* 좌측: 매장 브랜드 및 지점 표기 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-2xs">
            <Store className="size-4" />
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight">LocalMate</span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">{storeName}</span>
          <span className="text-slate-400">({storeId === 'cafe' ? '배달의민족 연동' : '쿠팡이츠 연동'})</span>
        </div>
      </div>

      {/* 우측: 알림 벨 & 사장님 프로필 */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        
        {/* 알림 벨 버튼 */}
        <button
          type="button"
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen)
            setHasUnread(false)
          }}
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="매장 실시간 알림"
        >
          <Bell className="size-5" />
          {hasUnread && notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
          )}
        </button>

        {/* 팝업: 실시간 매장 알림 센터 */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">실시간 매장 알림 센터</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-600">
                  {notifications.length}건
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">실시간 동기화</span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  확인할 신규 알림이 없습니다.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item.targetPath)}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                      item.isUrgent ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'full' && (
                        <div className="size-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                          <Flame className="size-4" />
                        </div>
                      )}
                      {item.type === 'noshow' && (
                        <div className="size-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center animate-pulse">
                          <AlertTriangle className="size-4" />
                        </div>
                      )}
                      {item.type === 'reservation' && (
                        <div className="size-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Users className="size-4" />
                        </div>
                      )}
                      {item.type === 'task' && (
                        <div className="size-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                          <ClipboardList className="size-4" />
                        </div>
                      )}
                      {item.type === 'review' && (
                        <div className="size-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <MessageSquare className="size-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold truncate ${item.isUrgent ? 'text-rose-700' : 'text-slate-800'}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 px-3 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400">
                알림을 누르면 해당 관제 페이지로 즉시 이동합니다
              </span>
            </div>
          </div>
        )}

        <div className="h-4 w-px bg-slate-200" />

        {/* 사장님 프로필 표시 */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 border border-indigo-200">
            김
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-800">김사장님</span>
            <span className="text-[10px] text-slate-400">게스트 체험 중</span>
          </div>
        </div>

      </div>

    </header>
  )
}