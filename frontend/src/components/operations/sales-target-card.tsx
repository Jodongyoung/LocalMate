import { useState } from 'react'
import { Pencil, Target } from 'lucide-react'
import { formatKRW, salesTarget } from '@/lib/mock-data'

const presets = [20_000_000, 25_000_000, 30_000_000]

export function SalesTargetCard() {
  const [goal, setGoal] = useState((salesTarget as any).goal ?? (salesTarget as any).target ?? 0)
  const [editing, setEditing] = useState(false)
  const current = salesTarget.current
  const percent = Math.min(100, Math.round((current / goal) * 100))
  const remaining = Math.max(0, goal - current)
  const daysLeft = 29
  const dailyNeeded = Math.ceil(remaining / daysLeft / 1000) * 1000

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
            <Target className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">11월 매출 목표</h2>
            <p className="text-xs text-muted-foreground">목표까지 {formatKRW(remaining)} 남음</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:bg-secondary rounded-lg px-2 py-1 transition"
          aria-expanded={editing}
        >
          <Pencil className="size-3" aria-hidden="true" />
          목표 수정
        </button>
      </div>

      {editing && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="목표 금액 선택">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setGoal(p)
                setEditing(false)
              }}
              className={`text-xs rounded-full border px-3 py-1.5 transition ${
                p === goal ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
              }`}
            >
              {(p / 10_000).toLocaleString('ko-KR')}만원
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">현재 누적</p>
          <p className="text-xl md:text-2xl font-bold tracking-tight tabular-nums">{formatKRW(current)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">목표</p>
          <p className="text-sm font-semibold tabular-nums">{formatKRW(goal)}</p>
        </div>
      </div>

      <div className="mt-3 group">
        <div
          className="relative h-3 w-full rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="월 매출 목표 달성률"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-chart-4 transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-primary tabular-nums">{percent}% 달성</span>
          <span className="text-muted-foreground">
            하루 평균 <span className="font-medium text-foreground tabular-nums">{formatKRW(dailyNeeded)}</span> 필요
          </span>
        </div>
      </div>
    </div>
  )
}
