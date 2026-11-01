import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { sentimentTrend } from '@/lib/mock-data'
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
  const total = payload.reduce((sum, p) => sum + p.value, 0)
  return (
    <div className="rounded-xl border bg-popover px-3 py-2.5 shadow-lg text-xs min-w-36">
      <p className="font-semibold mb-1.5">{label} 리뷰 {total}건</p>
      {payload.map((p) => {
        const s = series.find((x) => x.key === p.dataKey)
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-sm" style={{ backgroundColor: p.color }} />
              {s?.label}
            </span>
            <span className="font-medium tabular-nums">
              {p.value}건 ({Math.round((p.value / total) * 100)}%)
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function SentimentChart() {
  const [hidden, setHidden] = useState<SeriesKey[]>([])
  const latest = sentimentTrend[sentimentTrend.length - 1]
  const latestTotal = latest.positive + latest.complaint + latest.improvement
  const positiveRate = Math.round((latest.positive / latestTotal) * 100)

  function toggle(key: SeriesKey) {
    setHidden((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm h-full flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">월별 리뷰 감성 분석</h2>
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
          <BarChart data={sentimentTrend} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
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
