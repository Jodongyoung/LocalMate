import { useState } from 'react'
import { CheckCircle2, Lightbulb, Sparkles } from 'lucide-react'
import { complaintKeywords } from '@/lib/mock-data'

const actions = [
  '금·토 19~21시 조리 인력 1명 추가 배치',
  '출고 전 사이드·음료 포장 체크리스트 도입',
  '배민 예상 배달시간 +10분 조정 (우천 시)',
]

export function AiSummary() {
  const [applied, setApplied] = useState<string[]>([])
  const maxPercent = Math.max(...complaintKeywords.map((k) => k.percent))

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          <h2 className="font-semibold">AI 추출 주요 불만 키워드</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">11월 불만·개선요청 리뷰 283건 분석</p>

        <ul className="mt-4 flex flex-col gap-3">
          {complaintKeywords.map((k, i) => (
            <li key={k.keyword}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4 tabular-nums">{i + 1}</span>
                  <span className="font-medium">{k.keyword}</span>
                </span>
                <span className="tabular-nums">
                  <span className="font-semibold">{k.percent}%</span>
                  <span className="text-xs text-muted-foreground ml-1">({k.count}건)</span>
                </span>
              </div>
              <div className="mt-1.5 ml-6 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-chart-2"
                  style={{ width: `${(k.percent / maxPercent) * 100}%`, opacity: 1 - i * 0.15 }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-primary text-primary-foreground p-5 shadow-sm flex-1">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4" aria-hidden="true" />
          <h2 className="font-semibold">AI 액션 추천</h2>
        </div>
        <p className="mt-2 text-sm text-primary-foreground/85 leading-relaxed text-pretty">
          대기시간 불만의 72%가 주말 저녁 피크타임에 집중돼요. 아래 조치로 불만 리뷰를 약 30% 줄일 수 있어요.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {actions.map((a) => {
            const done = applied.includes(a)
            return (
              <li key={a}>
                <button
                  type="button"
                  aria-pressed={done}
                  onClick={() =>
                    setApplied((prev) => (done ? prev.filter((x) => x !== a) : [...prev, a]))
                  }
                  className="w-full flex items-center gap-2.5 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2.5 text-left text-sm transition"
                >
                  <CheckCircle2
                    className={`size-4 shrink-0 ${done ? 'opacity-100' : 'opacity-40'}`}
                    aria-hidden="true"
                  />
                  <span className={done ? 'line-through opacity-70' : ''}>{a}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs text-primary-foreground/70">
          {applied.length}/{actions.length}개 실행 완료
        </p>
      </div>
    </div>
  )
}