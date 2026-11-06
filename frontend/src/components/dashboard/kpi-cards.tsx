'use client'

import { useState, useEffect } from 'react'
import { Wallet, Calendar, Gift, AlertCircle } from 'lucide-react'

const getInitialStoreId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

const BASE_SALES = {
  cafe: { today: 980000, month: 15200000 },
  chicken: { today: 1284000, month: 18500000 }
}

const getStoredSales = (storeId: string) => {
  const isCafe = storeId === 'cafe'
  const base = isCafe ? BASE_SALES.cafe : BASE_SALES.chicken
  if (typeof window === 'undefined') return base

  const todaySaved = localStorage.getItem(`localmate_today_sales_${storeId}`)
  const monthSaved = localStorage.getItem(`localmate_month_sales_${storeId}`)

  return {
    today: todaySaved ? Number(todaySaved) : base.today,
    month: monthSaved ? Number(monthSaved) : base.month
  }
}

const getReviewStatsFromStorage = (storeId: string) => {
  if (typeof window === 'undefined') {
    return { unanswered: 4, eventCount: 24 }
  }
  const saved = localStorage.getItem(`localmate_reviews_v12_${storeId}`)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        const unanswered = parsed.filter((r: any) => !r.reply).length
        const eventCount = parsed.filter((r: any) => r.eventParticipant).length
        return { unanswered, eventCount }
      }
    } catch (e) {}
  }
  return storeId === 'chicken' 
    ? { unanswered: 5, eventCount: 32 } 
    : { unanswered: 4, eventCount: 24 }
}

export function KpiCards({ unansweredCount: propUnanswered }: { unansweredCount?: number; [key: string]: any }) {
  const [storeId, setStoreId] = useState(getInitialStoreId)
  const [sales, setSales] = useState(() => getStoredSales(getInitialStoreId()))
  const [stats, setStats] = useState(() => getReviewStatsFromStorage(getInitialStoreId()))

  const updateAllData = (targetStore: string) => {
    setStoreId(targetStore)
    setSales(getStoredSales(targetStore))
    setStats(getReviewStatsFromStorage(targetStore))
  }

  useEffect(() => {
    const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
    updateAllData(currentStore)

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const target = customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      updateAllData(target)
    }

    const handleReviewsSync = () => {
      const target = localStorage.getItem('localmate_store_id') || 'cafe'
      setStats(getReviewStatsFromStorage(target))
    }

    const handleSalesSync = () => {
      const target = localStorage.getItem('localmate_store_id') || 'cafe'
      setSales(getStoredSales(target))
    }

    // 🎯 초기화 이벤트 수신 시 기본 매출로 즉각 복귀
    const handleSalesReset = () => {
      const target = localStorage.getItem('localmate_store_id') || 'cafe'
      updateAllData(target)
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('reviewsUpdated', handleReviewsSync)
    window.addEventListener('localmate_sales_updated', handleSalesSync)
    window.addEventListener('localmate_sales_reset', handleSalesReset)
    window.addEventListener('storage', handleSalesSync)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('reviewsUpdated', handleReviewsSync)
      window.removeEventListener('localmate_sales_updated', handleSalesSync)
      window.removeEventListener('localmate_sales_reset', handleSalesReset)
      window.removeEventListener('storage', handleSalesSync)
    }
  }, [])

  const displayUnanswered = typeof propUnanswered === 'number' ? propUnanswered : stats.unanswered
  const isCafe = storeId === 'cafe'
  const platformLabel = isCafe ? '배민' : '쿠팡이츠'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 font-sans">
      {/* 1. 오늘 매출 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">오늘 매출</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">
            {sales.today.toLocaleString()}원
          </p>
          <p className="text-xs font-semibold text-emerald-600">↗ 어제 대비 {isCafe ? '+8.5%' : '+12.4%'}</p>
        </div>
        <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Wallet className="size-5" />
        </div>
      </div>

      {/* 2. 이번 달 누적 매출 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">이번 달 누적 매출</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">
            {sales.month.toLocaleString()}원
          </p>
          <p className="text-xs font-semibold text-emerald-600">↗ 전월 동기 대비 {isCafe ? '+6.2%' : '+8.1%'}</p>
        </div>
        <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Calendar className="size-5" />
        </div>
      </div>

      {/* 3. 리뷰 이벤트 참여 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">{platformLabel} 리뷰 이벤트 참여</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{stats.eventCount}건</p>
          <p className="text-xs font-semibold text-emerald-600">↗ 이번 주 +{isCafe ? '5건' : '8건'}</p>
        </div>
        <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Gift className="size-5" />
        </div>
      </div>

      {/* 4. 미답변 리뷰 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">미답변 리뷰</p>
          <p className={`text-2xl font-bold tracking-tight ${displayUnanswered > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {displayUnanswered}건
          </p>
          <p className={`text-xs font-semibold ${displayUnanswered > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
            {displayUnanswered > 0 ? '24시간 내 답변 권장' : '✓ 모든 리뷰에 답변 완료'}
          </p>
        </div>
        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${displayUnanswered > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
          <AlertCircle className="size-5" />
        </div>
      </div>
    </div>
  )
}

export default KpiCards