'use client'

import { useState, useEffect, useMemo } from 'react'
import { Sparkles, MessageSquare, Star, Search, CheckCircle2 } from 'lucide-react'
import ReviewCard from '@/components/reviews/card'
import { CAFE_REVIEWS, CHICKEN_REVIEWS, type Review } from '@/lib/mock-data'

// 금지어 감지 시 자연스럽게 치환할 대체어 사전
const FORBIDDEN_REPLACEMENTS: Record<string, string> = {
  '비싸다': '가격 대비 아쉬우셨던 부분',
  '양적다': '푸짐함이 다소 부족했던 점',
  '배달지연': '배송 소요 시간 지체',
  '맛없다': '입맛에 조금 아쉬우셨던 부분',
  '식었다': '온도가 다소 내려간 상태',
  '라이더': '전문 배송 기사님',
  '환불': '신속한 고객 지원'
}

export function ReviewsView() {
  const [selectedStoreId, setSelectedStoreId] = useState('cafe')
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'negative'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [bulkSuccess, setBulkSuccess] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

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

  const saveAndSetReviews = (newReviews: Review[]) => {
    setReviews(newReviews)
    const storageKey = `localmate_reviews_${selectedStoreId}`
    localStorage.setItem(storageKey, JSON.stringify(newReviews))

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

  // 🎯 금지어 필터링 함수
  const applyForbiddenWordsFilter = (text: string, storeId: string): string => {
    const savedSettingsRaw = localStorage.getItem(`localmate_settings_${storeId}`)
    if (!savedSettingsRaw) return text

    try {
      const parsed = JSON.parse(savedSettingsRaw)
      if (!parsed.forbiddenWords) return text

      const forbiddenList: string[] = parsed.forbiddenWords.split(',').map((w: string) => w.trim()).filter(Boolean)
      let cleanedText = text

      forbiddenList.forEach(word => {
        if (word && cleanedText.includes(word)) {
          const replacement = FORBIDDEN_REPLACEMENTS[word] || '정제된 표현'
          cleanedText = cleanedText.split(word).join(replacement)
        }
      })
      return cleanedText
    } catch (e) {
      return text
    }
  }

  // 🎯 설정된 어조, 보상 정책, 금지어를 전부 결합한 동적 초안 엔진
  const buildDynamicDraft = (review: Review): string => {
    const isChicken = selectedStoreId === 'chicken'
    const savedSettingsRaw = localStorage.getItem(`localmate_settings_${selectedStoreId}`)
    let tone = isChicken ? 'friendly' : 'polite'
    let compensation = isChicken ? 'redelivery' : 'service'

    if (savedSettingsRaw) {
      try {
        const parsed = JSON.parse(savedSettingsRaw)
        if (parsed.tone) tone = parsed.tone
        if (parsed.compensationPolicy) compensation = parsed.compensationPolicy
      } catch (e) {}
    }

    const isNegative = review.rating <= 3 || review.tags.some(t => t.includes('불만') || t.includes('요청'))
    const tagsStr = review.tags.join(', ')

    let generatedDraft = ''

    // 1. 간결 모드
    if (tone === 'concise') {
      if (isNegative) {
        generatedDraft = `안녕하세요, ${review.customerId}님. 소중한 피드백 감사드립니다. 전달해주신 ${tagsStr ? `'${tagsStr}'` : '의견'} 즉시 조치하여 불편함 없도록 개선하겠습니다.`
        if (compensation === 'redelivery') generatedDraft += ' 누락/식음 메뉴는 연락 주시면 즉시 재배달 도와드리겠습니다.'
        if (compensation === 'refund_guide') generatedDraft += ' 고객센터를 통한 부분 환불 처리를 신속히 지원해 드립니다.'
        if (compensation === 'service') generatedDraft += ' 다음 주문 시 요청사항 주시면 서비스 챙겨드리겠습니다.'
      } else {
        generatedDraft = `주문해 주셔서 진심으로 감사합니다, ${review.customerId}님! 앞으로도 빠르고 정확하게 정성을 다해 모시겠습니다. 좋은 하루 보내세요!`
      }
    }
    // 2. 친근 모드
    else if (tone === 'friendly') {
      if (isNegative) {
        generatedDraft = `아이구 ${review.customerId}님, 사장입니다! 😭\n맛있게 드셔야 할 식사 시간에 ${tagsStr ? `'${tagsStr}'` : '아쉬운 점'}으로 불편을 드려 정말 속상하고 죄송해요.`
        if (review.tags.some(t => t.includes('대기') || t.includes('지연'))) {
          generatedDraft += '\n배달지연으로 라이더 배차가 늦어져 조금 식었다 느끼셨을까 봐 마음이 쓰여요. 보온 패키징 두 배로 신경 쓰겠습니다!'
        }
        if (compensation === 'redelivery') {
          generatedDraft += '\n\n혹시 아직 식사 중이시라면 매장으로 바로 전화 한 통만 주세요! 따끈따끈하게 즉시 새로 튀겨서 다시 보내드릴게요!'
        } else if (compensation === 'refund_guide') {
          generatedDraft += '\n\n불편하셨던 부분은 고객센터 통해 말씀해 주시면 신속하게 부분 취소 도와드리겠습니다. 마음 상하지 않으셨으면 좋겠어요.'
        } else {
          generatedDraft += '\n\n다음 주문 때 요청사항에 [단골 이모 찬스] 꼭 적어주세요! 치즈볼이랑 따뜻한 사이드 메뉴 곱배기로 챙겨드릴게요 약속!'
        }
      } else {
        generatedDraft = `사장입니다! ${review.customerId}님, 이렇게 따뜻한 칭찬 리뷰 남겨주셔서 오늘 하루 피로가 싹 풀리네요 🍗❤️ 맛있게 드셔주셔서 정말 감사드려요! 다음 주문 때도 정성 가득 담아 맛있게 보답할 테니 자주 들러주세요!`
      }
    }
    // 3. 정중 모드
    else {
      if (isNegative) {
        generatedDraft = `고객님, 안녕하세요. ${selectedStoreId === 'cafe' ? '카페 본점' : '매장'} 책임자입니다.\n저희 매장을 믿고 주문해 주셨는데, ${tagsStr ? `'${tagsStr}'` : '이용 과정'}에서 기대에 미치지 못해 진심으로 사과드립니다.`
        if (review.tags.some(t => t.includes('대기') || t.includes('지연'))) {
          generatedDraft += '\n배달지연으로 인해 라이더 배차가 늦어져 불편을 드린 점 뼈아프게 반성하며, 배차 시스템과 보온 상태를 철저히 점검하였습니다.'
        }
        if (compensation === 'redelivery') {
          generatedDraft += '\n\n불편을 겪으신 사항은 매장으로 연락 주시면 확인 후 즉각 재배달 조치를 도와드리겠습니다.'
        } else if (compensation === 'refund_guide') {
          generatedDraft += '\n\n고객센터 접수 시 신속한 규정 확인 및 부분 환불 처리가 정상 진행될 수 있도록 적극 협조하겠습니다.'
        } else {
          generatedDraft += '\n\n재방문해 주실 때 요청사항에 남겨주시면 지난번의 미흡함을 만회할 수 있도록 더욱 정성을 다한 서비스로 보답하겠습니다.'
        }
      } else {
        generatedDraft = `고객님, 소중한 리뷰를 남겨주셔서 진심으로 감사드립니다.\n정성껏 준비한 메뉴가 고객님께 큰 만족을 드린 것 같아 전 직원이 보람을 느낍니다. 앞으로도 변함없는 맛과 정직한 서비스로 늘 최선을 다하겠습니다. 행복한 하루 보내세요!`
      }
    }

    // 🎯 생성된 초안에 등록된 금지어가 있다면 안전한 정제 표현으로 최종 필터링!
    return applyForbiddenWordsFilter(generatedDraft, selectedStoreId)
  }

  const handleGenerate = (id: string) => {
    const target = reviews.find(r => r.id === id)
    if (!target) return
    const aiText = buildDynamicDraft(target)
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
      const newDrafts: Record<string, string> = { ...drafts }
      reviews.forEach(r => {
        if (!r.reply) {
          newDrafts[r.id] = buildDynamicDraft(r)
        }
      })
      setDrafts(newDrafts)
      setIsBulkGenerating(false)
      setBulkSuccess(true)
      setTimeout(() => setBulkSuccess(false), 3000)
    }, 800)
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
                  <span className="text-emerald-600">초안 일괄 완료!</span>
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