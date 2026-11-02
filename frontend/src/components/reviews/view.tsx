'use client'

import { useState, useEffect, useMemo } from 'react'
import { Sparkles, MessageSquare, Star, Search, CheckCircle2 } from 'lucide-react'
import ReviewCard from '@/components/reviews/card'
import { CAFE_REVIEWS, CHICKEN_REVIEWS, type Review } from '@/lib/mock-data'

export function ReviewsView() {
  const [selectedStoreId, setSelectedStoreId] = useState('cafe')
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'negative'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [bulkSuccess, setBulkSuccess] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  // 1. localStorage에서 저장된 리뷰 상태 불러오기
  const loadReviewsFromStorage = (storeId: string) => {
    const storageKey = `localmate_reviews_${storeId}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        return JSON.parse(saved) as Review[]
      } catch (e) {
        console.error(e)
      }
    }
    return storeId === 'cafe' ? CAFE_REVIEWS : CHICKEN_REVIEWS
  }

  const updateReviewsByStore = (storeId: string) => {
    const loaded = loadReviewsFromStorage(storeId)
    setReviews(loaded)
  }

  useEffect(() => {
    const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
    setSelectedStoreId(savedStore)
    updateReviewsByStore(savedStore)

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        const newStoreId = customEvent.detail
        setSelectedStoreId(newStoreId)
        updateReviewsByStore(newStoreId)
        setFilter('all')
        setSearchQuery('')
        setDrafts({})
      }
    }
    
    window.addEventListener('storeChange', handleSync)
    return () => window.removeEventListener('storeChange', handleSync)
  }, [])

  // 2. 리뷰 상태가 바뀔 때마다 localStorage 및 전역 동기화 이벤트 발생
  const saveAndSetReviews = (newReviews: Review[]) => {
    setReviews(newReviews)
    const storageKey = `localmate_reviews_${selectedStoreId}`
    localStorage.setItem(storageKey, JSON.stringify(newReviews))

    // 대시보드 등 다른 컴포넌트에 미답변 변경 사항 실시간 전파
    window.dispatchEvent(new CustomEvent('reviewsUpdated', { detail: newReviews }))
  }

  const filteredReviews = useMemo(() => {
    let result = [...reviews]
    
    if (filter === 'unanswered') {
      result = result.filter(r => !r.reply)
    } else if (filter === 'negative') {
      result = result.filter(r => r.rating <= 3)
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r => 
        (r.text && r.text.toLowerCase().includes(query)) || 
        (r.menu && r.menu.toLowerCase().includes(query)) ||
        (r.customerId && r.customerId.toLowerCase().includes(query))
      )
    }
    
    return result
  }, [reviews, filter, searchQuery])

  const stats = useMemo(() => {
    const total = reviews.length
    const unanswered = reviews.filter(r => !r.reply).length
    const negative = reviews.filter(r => r.rating <= 3).length
    const avgRating = total > 0 
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1)
      : '0.0'
    return { total, unanswered, negative, avgRating }
  }, [reviews])

  const handleGenerate = (id: string) => {
    const target = reviews.find(r => r.id === id)
    if (!target) return
    const aiText = `안녕하세요, ${target.customerId}님! 소중한 리뷰를 남겨주셔서 진심으로 감사드립니다. 앞으로도 더 좋은 맛과 서비스로 보답하겠습니다!`
    setDrafts(prev => ({ ...prev, [id]: aiText }))
  }

  const handleDraftChange = (id: string, value: string) => {
    setDrafts(prev => ({ ...prev, [id]: value }))
  }

  const handleCancel = (id: string) => {
    setDrafts(prev => {
      const newDrafts = { ...prev }
      delete newDrafts[id]
      return newDrafts
    })
  }

  // 3. 답글 저장 시 localStorage 반영
  const handleSave = (id: string) => {
    const replyContent = drafts[id]
    if (!replyContent) return

    const updated = reviews.map(r => {
      if (r.id === id) {
        return { ...r, reply: replyContent, replyDate: '방금 전' }
      }
      return r
    })
    saveAndSetReviews(updated)
    handleCancel(id)
  }

  const handleEdit = (id: string) => {
    const target = reviews.find(r => r.id === id)
    if (target?.reply) {
      setDrafts(prev => ({ ...prev, [id]: target.reply as string }))
    }
  }

  // 4. 답글 삭제 시 localStorage 반영
  const handleDelete = (id: string) => {
    if (confirm('등록된 답글을 삭제하시겠습니까?')) {
      const updated = reviews.map(r => {
        if (r.id === id) {
          return { ...r, reply: undefined, replyDate: undefined }
        }
        return r
      })
      saveAndSetReviews(updated)
    }
  }

  const handleGenerateAllDrafts = () => {
    setIsBulkGenerating(true)
    setTimeout(() => {
      setIsBulkGenerating(false)
      setBulkSuccess(true)
      setTimeout(() => setBulkSuccess(false), 3000)
    }, 1500)
  }

  const currentPlatform = selectedStoreId === 'cafe' ? '배달의민족' : '쿠팡이츠'
  const currentPlatformColor = selectedStoreId === 'cafe' ? 'bg-[#2ac1bc]' : 'bg-[#00a8ec]'

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-[10px] font-bold text-white ${currentPlatformColor}`}>
              {currentPlatform}
            </span>
            <h1 className="text-xl font-bold text-slate-900">고객 리뷰 관리</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              전체 {stats.total}
            </button>
            <button 
              onClick={() => setFilter('unanswered')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'unanswered' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              미답변 {stats.unanswered}
            </button>
            <button 
              onClick={() => setFilter('negative')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'negative' ? 'bg-red-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              불만 리뷰 {stats.negative}
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            <button 
              onClick={handleGenerateAllDrafts}
              disabled={isBulkGenerating || stats.unanswered === 0}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBulkGenerating ? (
                <>
                  <span className="size-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                  초안 생성 중...
                </>
              ) : bulkSuccess ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span className="text-emerald-600">생성 완료</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  미답변 일괄 초안
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>최근 리뷰 평균 별점</span>
              <span className="flex items-center text-slate-900 font-bold">
                <Star className="size-4 text-yellow-400 fill-yellow-400 mr-1" />
                {stats.avgRating}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Sparkles className="size-3.5 text-indigo-400" />
              AI 감성 태그 자동 분류
            </span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text"
              placeholder="리뷰 내용, 메뉴, 닉네임 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-4 shadow-sm border border-slate-200 rounded-2xl bg-white overflow-hidden p-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review}
                draft={drafts[review.id]}
                onGenerate={handleGenerate}
                onDraftChange={handleDraftChange}
                onCancel={handleCancel}
                onSave={handleSave}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="size-12 mb-3 opacity-20" />
              <p className="text-sm">조건에 맞는 리뷰가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}