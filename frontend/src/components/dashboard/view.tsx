'use client'

import { useEffect, useRef, useState } from 'react'
import Link from '@/components/layout/router-compat'
import { generateReplyDraft, initialReviews, type Review } from '@/lib/mock-data'
import { getCurrentWeatherScenario, type WeatherCondition } from '@/lib/weather-scenarios'
import { DashboardHeader } from './dashboard-header'
import { SalesTargetCard } from './sales-target-card'
import { KpiCards } from './kpi-cards'
import { SentimentChart } from './sentiment-chart'
import { AiSummary } from './ai-summary'

export function DashboardView({ onLogout = () => {} }: { onLogout?: () => void }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [storeId, setStoreId] = useState('cafe')
  const [weatherInfo, setWeatherInfo] = useState<WeatherCondition>(() => getCurrentWeatherScenario('cafe'))

  // 🎯 승인 대기 건수 및 대표 제안 내용 동적 상태 (0건이면 배너 숨김)
  const [pendingTasks, setPendingTasks] = useState<{ count: number; firstTitle?: string }>({ count: 0 })

  const reviewsRef = useRef(reviews)

  useEffect(() => {
    reviewsRef.current = reviews
  }, [reviews])

  // 승인 대기 건수 동기화 함수
  const syncPendingTasks = (currentStore: string) => {
    const saved = localStorage.getItem(`localmate_proposals_v5_${currentStore}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const pending = parsed.filter((p: any) => p.status === 'pending')
        setPendingTasks({
          count: pending.length,
          firstTitle: pending[0]?.title
        })
        return
      } catch (e) {}
    }

    // fallback
    const globalCount = localStorage.getItem('localmate_pending_tasks_count')
    const count = globalCount !== null ? Number(globalCount) : 0
    setPendingTasks({ count, firstTitle: undefined })
  }

  // 지점 동기화, 설정 변경(주소 수정), 날씨 및 승인 대기 상태 실시간 체크
  useEffect(() => {
    const updateDashboard = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      setStoreId(currentStore)
      setWeatherInfo(getCurrentWeatherScenario(currentStore))
      syncPendingTasks(currentStore)
    }

    updateDashboard()

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setStoreId(customEvent.detail)
        setWeatherInfo(getCurrentWeatherScenario(customEvent.detail))
        syncPendingTasks(customEvent.detail)
      }
    }

    const handleSettingsSync = () => {
      updateDashboard()
    }

    // 🎯 TasksView에서 승인/보류 시 실시간으로 대시보드 배너 상태 업데이트
    const handlePendingUpdated = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      syncPendingTasks(currentStore)
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('settingsChange', handleSettingsSync)
    window.addEventListener('pendingTasksUpdated', handlePendingUpdated)
    const timer = setInterval(updateDashboard, 60 * 1000)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('settingsChange', handleSettingsSync)
      window.removeEventListener('pendingTasksUpdated', handlePendingUpdated)
      clearInterval(timer)
    }
  }, [])

  const unansweredCount = reviews.filter((r) => !r.reply).length

  function generateDraft(id: string) {
    const review = reviews.find((r) => r.id === id)
    if (!review) return
    setDrafts((prev) => ({ ...prev, [id]: generateReplyDraft(review) }))
  }

  function generateAllDrafts(): Review[] {
    const targets = reviewsRef.current.filter((r) => !r.reply)
    setDrafts((prev) => {
      const next = { ...prev }
      for (const r of targets) {
        if (next[r.id] === undefined) next[r.id] = generateReplyDraft(r)
      }
      return next
    })
    return targets
  }

  function updateDraft(id: string, value: string) {
    setDrafts((prev) => ({ ...prev, [id]: value }))
  }

  function cancelDraft(id: string) {
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function saveReply(id: string) {
    const text = drafts[id]?.trim()
    if (!text) return
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: text } : r)))
    cancelDraft(id)
  }

  function editReply(id: string) {
    const review = reviews.find((r) => r.id === id)
    if (!review?.reply) return
    setDrafts((prev) => ({ ...prev, [id]: review.reply as string }))
  }

  function deleteReply(id: string) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: undefined } : r)))
    cancelDraft(id)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={onLogout || (() => {})} unansweredCount={unansweredCount} />

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 flex flex-col gap-6 pb-28">
        <section className="grid lg:grid-cols-[1fr_minmax(0,1.1fr)] gap-4 md:gap-6 items-stretch">
          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground">2026년 11월 1일 일요일</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-balance">
              사장님, 오늘도 좋은 하루 보내세요!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
              <span className="font-semibold text-primary mr-1.5">[{weatherInfo.badgeText}]</span>
              {weatherInfo.conditionText}. {weatherInfo.actionAdvice}
            </p>
          </div>
          <SalesTargetCard />
        </section>

        <KpiCards {...({ unansweredCount } as any)} />

        <section className="grid lg:grid-cols-5 gap-4 md:gap-6">
          <div className="lg:col-span-3">
            <SentimentChart />
          </div>
          <div className="lg:col-span-2">
            <AiSummary />
          </div>
        </section>

        {/* 🎯 승인 대기 알림 배너 */}
        {pendingTasks.count > 0 && (
          <div className="rounded-2xl border bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-5 shadow-sm animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-sm">🔔</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-amber-900">승인 대기</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {pendingTasks.count}건
                  </span>
                </div>
                <p className="mt-1 text-sm text-amber-800">
                  {pendingTasks.firstTitle 
                    ? `[승인 대기] ${pendingTasks.firstTitle}` 
                    : `매장 보호 및 매출 최적화를 위한 AI 긴급 제안이 ${pendingTasks.count}건 대기 중입니다.`}
                </p>
                <Link
                  href="/tasks"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-amber-700 transition shadow-xs"
                >
                  제안 검토 및 승인하기
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DashboardView