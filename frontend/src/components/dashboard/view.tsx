import { useEffect, useRef, useState } from 'react'
import { generateReplyDraft, initialReviews, type Review } from '@/lib/mock-data'
import { DashboardHeader } from './dashboard-header'
import { SalesTargetCard } from './sales-target-card'
import { KpiCards } from './kpi-cards'
import { SentimentChart } from './sentiment-chart'
import { AiSummary } from './ai-summary'

export function DashboardView({ onLogout }: { onLogout: () => void }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const reviewsRef = useRef(reviews)

  useEffect(() => {
    reviewsRef.current = reviews
  }, [reviews])

  const unansweredCount = reviews.filter((r) => !r.reply).length

  function generateDraft(id: string) {
    const review = reviews.find((r) => r.id === id)
    if (!review) return
    setDrafts((prev) => ({ ...prev, [id]: generateReplyDraft(review) }))
  }

  // Reads the ref so delayed callers (e.g. the assistant's typing timeout) always see the latest replies.
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
      <DashboardHeader onLogout={onLogout} unansweredCount={unansweredCount} />

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 flex flex-col gap-6 pb-28">
        <section className="grid lg:grid-cols-[1fr_minmax(0,1.1fr)] gap-4 md:gap-6 items-stretch">
          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground">2026년 11월 1일 일요일</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-balance">
              사장님, 오늘도 좋은 하루 보내세요!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
              오늘 저녁 7시 비 예보가 있어요. 주문량이 평소보다 약 30% 늘어날 것으로 예상됩니다.
            </p>
          </div>
          <SalesTargetCard />
        </section>

        <KpiCards unansweredCount={unansweredCount} />

        <section className="grid lg:grid-cols-5 gap-4 md:gap-6">
          <div className="lg:col-span-3">
            <SentimentChart />
          </div>
          <div className="lg:col-span-2">
            <AiSummary />
          </div>
        </section>

        {/* 승인 대기 알림 배너 */}
        <div className="rounded-2xl border bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-sm">🔔</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">승인 대기</h3>
              <p className="mt-1 text-sm text-amber-800">
                [승인 대기] 피크타임 조리 인력 추가 배치 및 주문 동선 점검
              </p>
              <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-amber-700 transition">
                제안 검토 및 승인하기
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
