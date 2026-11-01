'use client'

import { useState } from 'react'
import { Sparkles, MessageSquare, Pencil, Trash2, Loader2, Gift } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { generateReplyDraft, type Review } from '@/lib/mock-data'

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function ReviewCard({
  review,
  draft,
  onGenerate,
  onDraftChange,
  onCancel,
  onSave,
  onEdit,
  onDelete,
}: {
  review: Review
  draft?: string
  onGenerate: (id: string) => void
  onDraftChange: (id: string, value: string) => void
  onCancel: (id: string) => void
  onSave: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const isEditing = draft !== undefined

  const handleAIButtonClick = () => {
    setIsGenerating(true)
    setTimeout(() => {
      onGenerate(review.id)
      setIsGenerating(false)
    }, 500)
  }

  return (
    <div className="flex flex-col py-6 px-6 relative w-full border-b border-border last:border-b-0 bg-card text-card-foreground">
      {/* 우측 상단 고정 이미지 */}
      {review.photo && (
        <div className="absolute top-6 right-6">
          <img
            src={review.photo}
            alt="리뷰 이미지"
            className="h-[104px] w-[104px] rounded-xl object-cover border border-border shadow-sm"
          />
        </div>
      )}

      {/* 1. 작성자 및 평점 정보 */}
      <div className="flex items-center gap-3 mb-2 pr-[120px]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground font-medium shrink-0 text-base">
          {review.customerId?.substring(0, 1) || '고'}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{review.customerId}</span>
            <span className="text-xs text-muted-foreground">{review.date}</span>
            
            {/* 리뷰이벤트 뱃지 */}
            {review.eventParticipant && (
              <span className="inline-flex items-center gap-1.5 bg-[#E8F8F7] px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#0A887C]">
                <Gift className="size-3.5 text-[#0A887C]" />
                리뷰이벤트
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-warning text-sm">
              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            </div>
            <span className="text-xs text-muted-foreground">{review.menu && `• ${review.menu}`}</span>
          </div>
        </div>
      </div>

      {/* 2. 감성 태그 */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground">AI</span>
          {review.tags.map((tag, idx) => (
            <span
              key={idx}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                tag.includes('불만') || tag.includes('요청') ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 3. 리뷰 본문 */}
      <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed pr-[120px] mb-4">
        {review.text}
      </p>

      {/* 4. 답글 미등록 액션 버튼 */}
      {!review.reply && !isEditing && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAIButtonClick}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> 답변을 생성중입니다...
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" /> AI 답글 추천 생성
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onDraftChange(review.id, '')}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-full border border-input bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            <Pencil className="size-3.5" /> 직접 작성
          </button>
        </div>
      )}

      {/* 5. 편집 모드 (연보라 박스 + 내부 하얀색 입력창 구조로 원본 완벽 복제) */}
      {isEditing && (
        <div className="mt-2 w-full rounded-2xl bg-[#F4F5FB] p-5 border border-indigo-100 shadow-sm">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
            <Sparkles className="size-3.5" /> {review.reply ? '답글 수정' : 'AI 추천 답글 초안'}
          </div>
          
          {/* 원본처럼 연보라 박스 안에 쏙 들어가는 깔끔한 화이트 텍스트박스 */}
          <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
            <textarea
              value={draft || ''}
              onChange={(e) => onDraftChange(review.id, e.target.value)}
              className="w-full resize-none bg-transparent p-0 text-xs text-foreground focus:outline-none min-h-[120px] leading-relaxed"
              placeholder="답글을 입력하세요..."
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{(draft || '').length}/1000자</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onCancel(review.id)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition px-2 py-1"
              >
                ✕ 취소
              </button>
              <button
                type="button"
                onClick={() => onSave(review.id)}
                className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition shadow-sm"
              >
                💾 저장 및 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 사장님 답글 등록 완료 영역 */}
      {review.reply && !isEditing && (
        <div className="mt-2 w-full rounded-2xl bg-muted/50 p-4 border border-border">
          <div className="mb-2 flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <MessageSquare className="size-3.5" /> 사장님 답글
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => onEdit(review.id)}
                className="flex items-center gap-1 hover:text-foreground transition"
              >
                <Pencil className="size-3" /> 수정
              </button>
              <button
                type="button"
                onClick={() => onDelete(review.id)}
                className="flex items-center gap-1 hover:text-destructive transition"
              >
                <Trash2 className="size-3" /> 삭제
              </button>
            </div>
          </div>
          <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{review.reply}</p>
        </div>
      )}
    </div>
  )
}
export default ReviewCard