import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { Review } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { ReviewCard } from './card'

type Filter = 'all' | 'unanswered' | 'negative'

export type ReviewHandlers = {
  onGenerate: (id: string) => void
  onDraftChange: (id: string, value: string) => void
  onCancel: (id: string) => void
  onSave: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ReviewList({
  reviews,
  drafts,
  onGenerateAll,
  ...handlers
}: {
  reviews: Review[]
  drafts: Record<string, string>
  onGenerateAll: () => void
} & ReviewHandlers) {
  const [filter, setFilter] = useState<Filter>('all')

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: reviews.length },
    { key: 'unanswered', label: '미답변', count: reviews.filter((r) => !r.reply).length },
    {
      key: 'negative',
      label: '불만 리뷰',
      count: reviews.filter((r) => r.tags.some((t) => t !== '긍정')).length,
    },
  ]

  const visible = reviews.filter((r) => {
    if (filter === 'unanswered') return !r.reply
    if (filter === 'negative') return r.tags.some((t) => t !== '긍정')
    return true
  })

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <section aria-labelledby="reviews-title" className="rounded-2xl border bg-card shadow-sm">
      <div className="p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#2ac1bc] px-1.5 py-0.5 text-[10px] font-bold text-white">배민</span>
            <h2 id="reviews-title" className="font-semibold">
              고객 리뷰 관리
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            최근 리뷰 평균 별점 <span className="font-semibold text-foreground">★ {avgRating}</span> · AI 감성
            태그 자동 분류
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-muted p-1" role="tablist" aria-label="리뷰 필터">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  filter === f.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label} <span className="tabular-nums">{f.count}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onGenerateAll}
            className="flex items-center gap-1.5 rounded-xl bg-secondary text-secondary-foreground px-3 py-2 text-xs font-semibold hover:bg-primary/15 transition"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            미답변 일괄 초안
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted-foreground">해당하는 리뷰가 없어요. 모두 처리했어요!</p>
      ) : (
        <ul className="divide-y">
          {visible.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} draft={drafts[r.id]} {...handlers} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
