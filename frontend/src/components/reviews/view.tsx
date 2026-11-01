import React, { useState } from 'react'
import { generateReplyDraft, initialReviews, type Review } from '@/lib/mock-data'
import { ReviewList } from './list'

export function ReviewsView() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const reviewsRef = React.useRef(reviews)

  React.useEffect(() => {
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
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: null } : r)))
    cancelDraft(id)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 flex flex-col gap-6 pb-28">
        <ReviewList
          reviews={reviews}
          drafts={drafts}
          onGenerate={generateDraft}
          onGenerateAll={generateAllDrafts}
          onDraftChange={updateDraft}
          onCancel={cancelDraft}
          onSave={saveReply}
          onEdit={editReply}
          onDelete={deleteReply}
        />
      </main>
    </div>
  )
}