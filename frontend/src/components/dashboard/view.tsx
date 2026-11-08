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

export interface DynamicWeatherState {
  badgeText: string
  conditionText: string
  actionAdvice: string
  isHeatwave: boolean
}

const getInitialStoreId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

const loadStoredReviews = (storeId: string): Review[] => {
  if (typeof window === 'undefined') return initialReviews
  const saved = localStorage.getItem(`localmate_reviews_v12_${storeId}`)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch (e) {}
  }
  return initialReviews
}

const getInitialDynamicWeather = (storeId: string): DynamicWeatherState => {
  const baseScenario = getCurrentWeatherScenario(storeId)
  const isHeatwave = baseScenario.weather === 'heat' || baseScenario.badgeText.includes('폭염')

  return {
    badgeText: baseScenario.badgeText,
    conditionText: baseScenario.conditionText,
    actionAdvice: baseScenario.actionAdvice,
    isHeatwave
  }
}

export function DashboardView({ onLogout = () => {} }: { onLogout?: () => void }) {
  const [storeId, setStoreId] = useState(getInitialStoreId)
  const [reviews, setReviews] = useState<Review[]>(() => loadStoredReviews(getInitialStoreId()))
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [weatherInfo, setWeatherInfo] = useState<WeatherCondition>(() => getCurrentWeatherScenario(getInitialStoreId()))
  const [dynamicWeather, setDynamicWeather] = useState<DynamicWeatherState>(() => getInitialDynamicWeather(getInitialStoreId()))
  const [pendingTasks, setPendingTasks] = useState<{ count: number; firstTitle?: string }>({ count: 0 })

  const reviewsRef = useRef(reviews)
  useEffect(() => {
    reviewsRef.current = reviews
  }, [reviews])

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
    const globalCount = localStorage.getItem('localmate_pending_tasks_count')
    const count = globalCount !== null ? Number(globalCount) : 0
    setPendingTasks({ count, firstTitle: undefined })
  }

  const updateWeatherWithSettings = (currentStore: string) => {
    const baseScenario = getCurrentWeatherScenario(currentStore)
    const isHeatwave = baseScenario.weather === 'heat' || baseScenario.badgeText.includes('폭염')

    setDynamicWeather({
      badgeText: baseScenario.badgeText,
      conditionText: baseScenario.conditionText,
      actionAdvice: baseScenario.actionAdvice,
      isHeatwave
    })
  }

  const syncReviewsData = (currentStore: string) => {
    const currentReviews = loadStoredReviews(currentStore)
    setReviews(currentReviews)
  }

  useEffect(() => {
    const updateDashboard = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      setStoreId(currentStore)
      setWeatherInfo(getCurrentWeatherScenario(currentStore))
      updateWeatherWithSettings(currentStore)
      syncPendingTasks(currentStore)
      syncReviewsData(currentStore)
    }

    updateDashboard()

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const targetStore = customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      setStoreId(targetStore)
      setWeatherInfo(getCurrentWeatherScenario(targetStore))
      updateWeatherWithSettings(targetStore)
      syncPendingTasks(targetStore)
      syncReviewsData(targetStore)
    }

    const handleWeatherSync = () => {
      updateDashboard()
    }

    const handleReviewsUpdated = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      syncReviewsData(currentStore)
    }

    const handleSettingsSync = () => {
      updateDashboard()
    }

    const handlePendingUpdated = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      syncPendingTasks(currentStore)
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('weatherChange', handleWeatherSync)
    window.addEventListener('reviewsUpdated', handleReviewsUpdated)
    window.addEventListener('settingsChange', handleSettingsSync)
    window.addEventListener('pendingTasksUpdated', handlePendingUpdated)
    window.addEventListener('storage', handleSettingsSync)
    const timer = setInterval(updateDashboard, 60 * 1000)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('weatherChange', handleWeatherSync)
      window.removeEventListener('reviewsUpdated', handleReviewsUpdated)
      window.removeEventListener('settingsChange', handleSettingsSync)
      window.removeEventListener('pendingTasksUpdated', handlePendingUpdated)
      window.removeEventListener('storage', handleSettingsSync)
      clearInterval(timer)
    }
  }, [])

  const unansweredCount = reviews.filter((r) => !r.reply).length

  return (
    <div className="min-h-screen bg-background font-sans">
      <DashboardHeader onLogout={onLogout || (() => {})} unansweredCount={unansweredCount} />

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 flex flex-col gap-6 pb-28">
        <section className="grid lg:grid-cols-[1fr_minmax(0,1.1fr)] gap-4 md:gap-6 items-stretch">
          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground">2026년 11월 1일 일요일</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-balance">
              사장님, 오늘도 좋은 하루 보내세요!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
              <span className={`font-semibold mr-1.5 ${dynamicWeather.isHeatwave ? 'text-amber-600' : 'text-blue-600'}`}>
                [{dynamicWeather.badgeText}]
              </span>
              {dynamicWeather.conditionText}. {dynamicWeather.actionAdvice}
            </p>
          </div>
          <SalesTargetCard />
        </section>

        <KpiCards {...({ unansweredCount, reviews } as any)} />

        <section className="grid lg:grid-cols-5 gap-4 md:gap-6">
          <div className="lg:col-span-3">
            <SentimentChart {...({ reviews } as any)} />
          </div>
          <div className="lg:col-span-2">
            <AiSummary />
          </div>
        </section>

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