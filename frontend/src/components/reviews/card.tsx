'use client'

import { useState } from 'react'
import { Sparkles, MessageSquare, Pencil, Trash2, Loader2, Gift } from 'lucide-react'
import { type Review } from '@/lib/mock-data'

// 외부 패키지 미설치로 인한 번들 에러를 방지하는 무결점 클래스 합성 헬퍼
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

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

  // 1. 방어 코드: review 객체가 유효하지 않을 경우 렌더링 차단
  if (!review || !review.id) return null

  const isEditing = draft !== undefined
  const hasReply = !!review.reply

  // 별점 및 작성자 안전 파싱
  const parsedRating = Number(review.rating)
  const ratingNum = isNaN(parsedRating) ? 5 : Math.round(Math.max(1, Math.min(5, parsedRating)))
  const yellowStars = '★'.repeat(ratingNum)
  const greyStars = '☆'.repeat(Math.max(0, 5 - ratingNum))

  const customerName = String(review.customerId || (review as any).author || '고객')
  const firstChar = customerName.charAt(0) || '고'
  const menuName = review.menu || '주문 메뉴'
  const reviewDate = review.date || '최근'
  const reviewText = review.text || (review as any).content || ''

  // 🎯 우측 상단 104x104 사진 경로 추출
  const photoSrc = 
    (review as any).photo || 
    (review as any).imageUrl || 
    (review as any).image || 
    (Array.isArray((review as any).images) && (review as any).images[0]) || 
    undefined

  // 태그 목록 안전 정제
  const tagsList: string[] = Array.isArray(review.tags)
    ? review.tags.filter(t => typeof t === 'string' && t.trim().length > 0)
    : []

  // 🎯 뱃지 데이터 추출 (ReviewsView에서 전달된 loyaltyBadge 활용)
  const loyaltyBadge = (review as any).loyaltyBadge

  const handleAIButtonClick = () => {
    setIsGenerating(true)
    setTimeout(() => {
      onGenerate(review.id)
      setIsGenerating(false)
    }, 350)
  }

  // 🎯 태그 색상 체계: 긍정(초록) / 일반(회색) / 누락·지연·에러(빨강)
  const getTagBadgeStyle = (tag: string) => {
    if (tag.includes('불만') || tag.includes('누락') || tag.includes('지연') || tag.includes('식음') || tag.includes('요청')) {
      return 'bg-rose-50 text-rose-600 border border-rose-200 font-semibold'
    }
    if (tag === '긍정' || tag.includes('추천') || tag.includes('바삭') || tag.includes('맛집') || tag.includes('육즙') || tag.includes('달콤')) {
      return 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold'
    }
    if (tag === '일반' || tag.includes('보통') || tag.includes('무난')) {
      return 'bg-slate-100 text-slate-600 border border-slate-200 font-medium'
    }
    return 'bg-slate-100 text-slate-600 border border-slate-200 font-medium'
  }

  return (
    <div className="flex flex-col py-6 px-6 relative w-full border-b border-slate-200 last:border-b-0 bg-white text-slate-900 font-sans">
      
      {/* 🎯 우측 상단 104x104 고정 규격 실물 썸네일 */}
      {photoSrc && (
        <div className="absolute top-6 right-6">
          <img
            src={photoSrc}
            alt="리뷰 음식 사진"
            className="h-[104px] w-[104px] rounded-xl object-cover border border-slate-200 shadow-xs bg-slate-50"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* 1. 작성자 및 평점 정보 (우측 사진 공간 pr-[120px] 확보) */}
      <div className={cn("flex items-center gap-3 mb-2", photoSrc ? "pr-[120px]" : "")}>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold shrink-0 text-base">
          {firstChar}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">{customerName}</span>
            
            {/* 🎯 [추가됨] 고객 주문 횟수 & 단골 뱃지 렌더링 */}
            {loyaltyBadge && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] border font-medium ${loyaltyBadge.className}`}>
                {loyaltyBadge.text}
              </span>
            )}

            <span className="text-xs text-slate-400">{reviewDate}</span>
            
            {/* 리뷰이벤트 뱃지 */}
            {(review as any).eventParticipant && (
              <span className="inline-flex items-center gap-1.5 bg-[#E8F8F7] px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#0A887C]">
                <Gift className="size-3.5 text-[#0A887C]" />
                리뷰이벤트
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400 text-sm tracking-tight">
              {yellowStars}{greyStars}
            </div>
            <span className="text-xs text-slate-500">{menuName}</span>
          </div>
        </div>
      </div>

      {/* 2. 🎯 AI 감성 태그 (긍정: 초록 / 일반: 회색 / 에러사항: 빨강) */}
      {tagsList.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Sparkles className="size-3 text-indigo-500" /> AI
          </span>
          {tagsList.map((tag, idx) => (
            <span
              key={idx}
              className={cn('rounded-full px-2.5 py-0.5 text-xs', getTagBadgeStyle(tag))}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 3. 리뷰 본문 */}
      <p className={cn("text-slate-700 whitespace-pre-wrap text-sm leading-relaxed mb-4", photoSrc ? "pr-[120px]" : "")}>
        {reviewText}
      </p>

      {/* 4. 답글 미등록 액션 버튼 */}
      {!hasReply && !isEditing && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAIButtonClick}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> 초안 생성 중...
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
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Pencil className="size-3.5 text-slate-500" /> 직접 작성
          </button>
        </div>
      )}

      {/* 5. 편집 모드 */}
      {isEditing && (
        <div className="mt-2 w-full rounded-2xl bg-[#F4F5FB] p-5 border border-indigo-100 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles className="size-3.5" /> {hasReply ? '답글 수정' : 'AI 추천 답글 초안'}
            </div>
            <span className="text-[11px] text-indigo-500 font-medium bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
              매장 설정 어조 자동 적용됨
            </span>
          </div>
          
          <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-2xs">
            <textarea
              value={draft || ''}
              onChange={(e) => onDraftChange(review.id, e.target.value)}
              className="w-full resize-none bg-transparent p-0 text-xs text-slate-800 focus:outline-none min-h-[120px] leading-relaxed"
              placeholder="답글 내용을 확인하고 필요에 따라 수정하세요..."
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{String(draft || '').length}/1000자</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onCancel(review.id)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition px-2 py-1"
              >
                ✕ 취소
              </button>
              <button
                type="button"
                onClick={() => onSave(review.id)}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition shadow-xs"
              >
                💾 저장 및 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 사장님 답글 등록 완료 영역 */}
      {hasReply && !isEditing && (
        <div className="mt-2 w-full rounded-2xl bg-slate-50/80 p-4 border border-slate-200">
          <div className="mb-2 flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
              <MessageSquare className="size-3.5" /> 사장님 답글
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => onEdit(review.id)}
                className="flex items-center gap-1 hover:text-slate-800 transition"
              >
                <Pencil className="size-3" /> 수정
              </button>
              <button
                type="button"
                onClick={() => onDelete(review.id)}
                className="flex items-center gap-1 hover:text-rose-600 transition"
              >
                <Trash2 className="size-3" /> 삭제
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">{review.reply}</p>
        </div>
      )}
    </div>
  )
}

export default ReviewCard