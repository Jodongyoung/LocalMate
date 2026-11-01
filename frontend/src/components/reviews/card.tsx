import { useState } from 'react'
import { Star, MessageCircle, ThumbsUp } from 'lucide-react'
import type { Review } from '@/lib/mock-data'

export function ReviewCard({
  review,
  draft,
  onGenerate
}: {
  review: Review
  draft?: string
  onGenerate: (id: string) => void
}) {
  return (
    <div className="p-5 hover:bg-muted/50 transition">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">고</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">고객님</h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      size={16}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {review.date} · {review.menu}
              </p>
            </div>
            
            {review.reply ? (
              <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                <MessageCircle size={12} />
                답변완료
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                <MessageCircle size={12} />
                미답변
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <p className="text-sm text-foreground">{review.content}</p>
          </div>
          
          {/* AI 감정 태그 */}
          <div className="mt-3 flex flex-wrap gap-2">
            {review.tags.map((tag, index) => (
              <span 
                key={index} 
                className={
                  tag === '긍정' ? 'bg-green-100 text-green-800' :
                  tag === '불만' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }
                style={{ fontSize: '10px', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* AI 답글 추천 버튼 */}
          {!review.reply && (
            <div className="mt-4">
              <button
                onClick={() => onGenerate(review.id)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
              >
                <ThumbsUp size={14} />
                AI 답글 추천
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}