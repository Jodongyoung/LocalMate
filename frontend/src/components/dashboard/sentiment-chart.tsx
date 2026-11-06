'use client'

import { useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { STORE_DASHBOARD_DATA } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const series = [
  { key: 'positive', label: '만족/긍정', color: 'var(--chart-1)' },
  { key: 'complaint', label: '불만', color: 'var(--chart-2)' },
  { key: 'improvement', label: '개선요청', color: 'var(--chart-3)' },
] as const

type SeriesKey = (typeof series)[number]['key']

type TooltipPayload = { dataKey: string; value: number; color: string }

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0)
  return (
    <div className="rounded-xl border bg-popover px-3 py-2.5 shadow-lg text-xs min-w-36 font-sans">
      <p className="font-semibold mb-1.5">{label} 리뷰 {total}건</p>
      {payload.map((p) => {
        const s = series.find((x) => x.key === p.dataKey)
        const percent = total > 0 ? Math.round(((p.value || 0) / total) * 100) : 0
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-sm" style={{ backgroundColor: p.color }} />
              {s?.label}
            </span>
            <span className="font-medium tabular-nums">
              {p.value || 0}건 ({percent}%)
            </span>
          </div>
        )
      })}
    </div>
  )
}

const getInitialStoreId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

// 🎯 저장된 실제 리뷰 데이터를 바탕으로 11월 수치 동적 계산
const computeChartDataWithReviews = (storeId: string) => {
  const base = storeId === 'cafe'
    ? JSON.parse(JSON.stringify(STORE_DASHBOARD_DATA.cafe.sentimentTrend))
    : JSON.parse(JSON.stringify(STORE_DASHBOARD_DATA.chicken.sentimentTrend))

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`localmate_reviews_v12_${storeId}`)
    if (saved) {
      try {
        const list = JSON.parse(saved)
        if (Array.isArray(list) && list.length > 0) {
          const positive = list.filter((r: any) => (Number(r.rating) || 5) >= 4).length
          const complaint = list.filter((r: any) => (Number(r.rating) || 5) <= 2).length
          const improvement = list.filter((r: any) => (Number(r.rating) || 5) === 3).length

          base[base.length - 1] = {
            month: '11월',
            positive,
            complaint,
            improvement
          }
        }
      } catch (e) {}
    }
  }

  return base
}

export function SentimentChart({ reviews: propReviews }: { reviews?: any[]; [key: string]: any }) {
  const [hidden, setHidden] = useState<SeriesKey[]>([])
  const [storeId, setStoreId] = useState(getInitialStoreId)
  const [chartData, setChartData] = useState(() => computeChartDataWithReviews(getInitialStoreId()))

  const refreshChart = (targetStore: string) => {
    setStoreId(targetStore)
    setChartData(computeChartDataWithReviews(targetStore))
  }

  useEffect(() => {
    const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
    refreshChart(currentStore)

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const target = customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      refreshChart(target)
    }

    const handleReviewsSync = () => {
      const target = localStorage.getItem('localmate_store_id') || 'cafe'
      refreshChart(target)
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('reviewsUpdated', handleReviewsSync)
    window.addEventListener('storage', handleReviewsSync)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('reviewsUpdated', handleReviewsSync)
      window.removeEventListener('storage', handleReviewsSync)
    }
  }, [])

  // 부모에서 props로 reviews 배열이 전달될 경우 즉시 11월 수치 재계산
  useEffect(() => {
    if (propReviews && propReviews.length > 0) {
      const base = storeId === 'cafe'
        ? JSON.parse(JSON.stringify(STORE_DASHBOARD_DATA.cafe.sentimentTrend))
        : JSON.parse(JSON.stringify(STORE_DASHBOARD_DATA.chicken.sentimentTrend))

      const positive = propReviews.filter((r: any) => (Number(r.rating) || 5) >= 4).length
      const complaint = propReviews.filter((r: any) => (Number(r.rating) || 5) <= 2).length
      const improvement = propReviews.filter((r: any) => (Number(r.rating) || 5) === 3).length

      base[base.length - 1] = {
        month: '11월',
        positive,
        complaint,
        improvement
      }
      setChartData(base)
    }
  }, [propReviews, storeId])

  const latest = chartData[chartData.length - 1] || { positive: 0, complaint: 0, improvement: 0 }
  const latestTotal = (latest.positive || 0) + (latest.complaint || 0) + (latest.improvement || 0)
  const positiveRate = latestTotal > 0 ? Math.round(((latest.positive || 0) / latestTotal) * 100) : 0

  function toggle(key: SeriesKey) {
    setHidden((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const platformName = storeId === 'cafe' ? '배달의민족' : '쿠팡이츠'

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm h-full flex flex-col font-sans">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-sm">월별 리뷰 감성 분석</h2>
          <p className="text-xs text-muted-foreground mt-0.5">최근 6개월 · {platformName} 리뷰 기준</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary tabular-nums">{positiveRate}%</p>
          <p className="text-xs text-muted-foreground">11월 긍정 비율</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="차트 항목 표시 전환">
        {series.map((s) => {
          const isHidden = hidden.includes(s.key)
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={!isHidden}
              onClick={() => toggle(s.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition',
                isHidden ? 'opacity-50 hover:opacity-80' : 'hover:bg-muted'
              )}
            >
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 h-64 md:h-72 flex-1 min-h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
            <Tooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltip />} />
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="sentiment"
                fill={s.color}
                hide={hidden.includes(s.key)}
                radius={i === series.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={44}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SentimentChart