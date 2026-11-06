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

// 🎯 첫 렌더링 깜빡임 방지를 위한 초기 감성 트렌드 로더
const getInitialSentimentData = () => {
  if (typeof window !== 'undefined') {
    const storeId = localStorage.getItem('localmate_store_id') || 'cafe'
    return storeId === 'cafe' ? STORE_DASHBOARD_DATA.cafe.sentimentTrend : STORE_DASHBOARD_DATA.chicken.sentimentTrend
  }
  return STORE_DASHBOARD_DATA.cafe.sentimentTrend
}

export function SentimentChart() {
  const [hidden, setHidden] = useState<SeriesKey[]>([])
  
  // 1. 초기 상태부터 localStorage 지점 정보를 정확히 반영하여 깜빡임 원천 차단
  const [chartData, setChartData] = useState(getInitialSentimentData)

  // 2. 매장 변경 이벤트(storeChange 및 storage) 감지하여 차트 데이터 실시간 연동
  useEffect(() => {
    const updateStoreData = (storeId: string) => {
      const data = storeId === 'cafe' ? STORE_DASHBOARD_DATA.cafe.sentimentTrend : STORE_DASHBOARD_DATA.chicken.sentimentTrend
      setChartData(data)
    }

    const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
    updateStoreData(savedStore)

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const targetStore = customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      updateStoreData(targetStore)
    }

    const handleStorageSync = () => {
      const targetStore = localStorage.getItem('localmate_store_id') || 'cafe'
      updateStoreData(targetStore)
    }

    window.addEventListener('storeChange', handleSync)
    window.addEventListener('storage', handleStorageSync)
    
    return () => {
      window.removeEventListener('storeChange', handleSync)
      window.removeEventListener('storage', handleStorageSync)
    }
  }, [])

  const latest = chartData[chartData.length - 1] || { positive: 0, complaint: 0, improvement: 0 }
  const latestTotal = (latest.positive || 0) + (latest.complaint || 0) + (latest.improvement || 0)
  const positiveRate = latestTotal > 0 ? Math.round(((latest.positive || 0) / latestTotal) * 100) : 0

  function toggle(key: SeriesKey) {
    setHidden((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm h-full flex flex-col font-sans">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-sm">월별 리뷰 감성 분석</h2>
          <p className="text-xs text-muted-foreground mt-0.5">최근 6개월 · 배달의민족 리뷰 기준</p>
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