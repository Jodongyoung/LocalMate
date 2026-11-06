'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Star, 
  Search, 
  CheckCircle2, 
  Zap, 
  RotateCcw, 
  PlusCircle, 
  ShieldCheck, 
  Edit3,
  Sparkles,
  MessageSquare
} from 'lucide-react'
import { ReviewCard } from '@/components/reviews/card'
import { type Review } from '@/lib/mock-data'

const FORBIDDEN_REPLACEMENTS: Record<string, string> = {
  '비싸다': '가격 대비 아쉬우셨던 부분',
  '양적다': '푸짐함이 다소 부족했던 점',
  '배달지연': '배송 소요 시간 지체',
  '맛없다': '입맛에 조금 아쉬우셨던 부분',
  '식었다': '온도가 다소 내려간 상태',
  '라이더': '전문 배송 기사님',
  '환불': '신속한 고객 지원'
}

const CHICKEN_PHOTOS = [
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527477378370-3549646c10b7?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80'
]

const CAFE_PHOTOS = [
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80'
]

const DEFAULT_CHICKEN_REVIEWS: any[] = [
  {
    id: 'chk-def-1',
    customerId: '치킨러버92',
    rating: 5,
    date: '오늘 오후 7:42',
    menu: '후라이드 치킨 1마리 + 치즈볼',
    text: '리뷰이벤트로 치즈볼 받았는데 너무 맛있어요! 튀김옷이 진짜 바삭하고 속은 촉촉해서 아이들이 순식간에 다 먹었어요. 수성구에서 제일 맛있는 집인 듯합니다.',
    tags: ['긍정', '추천', '바삭함'],
    photo: CHICKEN_PHOTOS[0],
    imageUrl: CHICKEN_PHOTOS[0],
    eventParticipant: true,
    orderCount: 5,
    reply: '주문해 주셔서 진심으로 감사합니다, 치킨러버92님! 튀김의 바삭바삭한 식감과 육즙을 알아봐 주셔서 주방장으로서 정말 보람을 느낍니다! 늘 정직하고 신선한 재료로 변함없는 맛을 대접하겠습니다. 행복한 하루 보내세요!'
  },
  {
    id: 'chk-def-2',
    customerId: '수성못직장인',
    rating: 2,
    date: '오늘 오후 6:15',
    menu: '양념 치킨 1마리',
    text: '맛은 괜찮은데 예상 시간보다 40분이나 늦게 왔어요. 비가 와서 그런 건 이해하지만 중간에 안내라도 해주셨으면 좋겠습니다. 치킨도 좀 식어서 왔네요.',
    tags: ['대기지연', '식음'],
    photo: CHICKEN_PHOTOS[1],
    imageUrl: CHICKEN_PHOTOS[1],
    orderCount: 1,
    eventParticipant: false
  },
  {
    id: 'chk-def-3',
    customerId: '반반무많이',
    rating: 3,
    date: '어제 오후 9:03',
    menu: '반반 치킨 + 치즈볼 + 콜라 1.25L',
    text: '치킨은 맛있었는데 주문한 콜라가 안 왔어요. 요청사항에 무 많이 달라고 적었는데 그것도 반영이 안 됐네요. 포장 확인 한 번만 더 부탁드려요.',
    tags: ['일반', '포장누락', '개선요청'],
    photo: CHICKEN_PHOTOS[2],
    imageUrl: CHICKEN_PHOTOS[2],
    orderCount: 2,
    eventParticipant: true
  },
  {
    id: 'chk-def-4',
    customerId: '치맥조아',
    rating: 5,
    date: '어제 오후 6:40',
    menu: '순살 간장치킨 + 생맥주 1000cc',
    text: '양념이 짜지 않고 딱 적당하게 달달해서 맥주 안주로 최고예요. 튀김 상태도 훌륭합니다.',
    tags: ['긍정', '추천'],
    orderCount: 1,
    eventParticipant: false
  },
  {
    id: 'chk-def-5',
    customerId: '야식매니아',
    rating: 3,
    date: '2일 전',
    menu: '순살 후라이드 치킨',
    text: '무난하게 잘 먹었습니다. 그냥 평범한 치킨 맛이에요. 배달 속도는 보통이었습니다.',
    tags: ['일반', '무난함'],
    orderCount: 1,
    eventParticipant: false
  },
  {
    id: 'chk-def-6',
    customerId: '황금닭다리',
    rating: 5,
    date: '3일 전',
    menu: '황금 닭다리 콤보 세트',
    text: '닭다리가 정말 통통하고 육즙이 팡팡 터집니다. 튀김 기름도 아주 깨끗한 게 느껴져요!',
    tags: ['긍정', '육즙가득'],
    photo: CHICKEN_PHOTOS[3],
    imageUrl: CHICKEN_PHOTOS[3],
    orderCount: 3,
    eventParticipant: true
  }
]

const DEFAULT_CAFE_REVIEWS: any[] = [
  {
    id: 'cafe-def-1',
    customerId: '커피마스터',
    rating: 5,
    date: '오늘 오후 1:30',
    menu: '아이스 아메리카노 2잔 + 크로플 세트',
    text: '크로플 겉바속촉 제대로네요! 아메리카노 산미도 딱 제가 좋아하는 스타일이에요. 포장도 안 새고 깔끔하게 잘 왔습니다.',
    tags: ['긍정', '추천', '디저트맛집'],
    photo: CAFE_PHOTOS[0],
    imageUrl: CAFE_PHOTOS[0],
    eventParticipant: true,
    orderCount: 8,
    reply: '고객님, 소중한 리뷰를 남겨주셔서 진심으로 감사드립니다. 정성껏 준비한 사이드/디저트 메뉴를 달콤하고 맛있게 드셔주셔서 정말 뿌듯합니다! 늘 정직하고 신선한 재료로 변함없는 맛을 대접하겠습니다. 행복한 하루 보내세요!'
  },
  {
    id: 'cafe-def-2',
    customerId: '동성로피플',
    rating: 2,
    date: '오늘 오전 11:20',
    menu: '따뜻한 카페라떼',
    text: '라떼 시켰는데 다 식어서 왔어요... 그리고 컵 뚜껑이 살짝 열려있어서 쟁반에 조금 샜네요. 배달 기사님 문제인지 매장 포장 문제인지 모르겠지만 실망입니다.',
    tags: ['대기지연', '식음', '포장불만'],
    photo: CAFE_PHOTOS[1],
    imageUrl: CAFE_PHOTOS[1],
    orderCount: 1,
    eventParticipant: false
  },
  {
    id: 'cafe-def-3',
    customerId: '베이커리덕후',
    rating: 3,
    date: '어제 오후 3:15',
    menu: '아메리카노 ICED, 소금빵 2개',
    text: '커피 맛은 괜찮았는데 주문한 소금빵 하나가 누락되어 왔어요. 다음엔 포장할 때 체크 부탁드립니다.',
    tags: ['일반', '포장누락', '개선요청'],
    photo: CAFE_PHOTOS[2],
    imageUrl: CAFE_PHOTOS[2],
    orderCount: 2,
    eventParticipant: true
  },
  {
    id: 'cafe-def-4',
    customerId: '라떼사랑',
    rating: 5,
    date: '어제 오전 9:40',
    menu: '카페라떼 ICED',
    text: '사장님 항상 너무 친절하시고 포장도 꼼꼼하게 해주셔서 기분 좋게 마십니다.',
    tags: ['긍정', '친절응대'],
    orderCount: 4,
    eventParticipant: false
  },
  {
    id: 'cafe-def-5',
    customerId: '점심시간휴식',
    rating: 3,
    date: '2일 전',
    menu: '아메리카노 HOT',
    text: '점심 먹고 시켰는데 커피 맛 무난해요. 잘 마셨습니다.',
    tags: ['일반', '무난함'],
    orderCount: 1,
    eventParticipant: false
  },
  {
    id: 'cafe-def-6',
    customerId: '달콤한하루',
    rating: 5,
    date: '3일 전',
    menu: '딸기 라떼, 크로플',
    text: '딸기청 듬뿍 들어가서 달달하니 맛있네요! 크로플이랑 조합이 예술입니다.',
    tags: ['긍정', '추천', '달콤함'],
    photo: CAFE_PHOTOS[3],
    imageUrl: CAFE_PHOTOS[3],
    orderCount: 2,
    eventParticipant: true
  }
]

const MOCK_CUSTOMERS = [
  '수성구미식가', '동성로단골러', '치킨러버24', '퇴근길소확행', '치맥조아', 
  '라떼파', '배고픈다람쥐', '대구맛집헌터', '바삭킹', '커피향기'
]

// 🎯 가상 리뷰 생성 시 긍정 / 일반 / 불만 각각의 템플릿 풀
const MOCK_REVIEW_TEMPLATES = {
  positive: {
    cafe: [
      { text: '크로플 겉바속촉 제대로네요! 라떼 원두 향도 깊고 부드러워서 기분 좋게 충전 완료했습니다 :)', menu: '시그니처 바닐라빈 라떼, 크로플', tags: ['긍정', '추천', '디저트맛집'] },
      { text: '원두 향이 정말 향긋하고 산미 밸런스가 최고예요. 매일 아침 여기서 시킵니다!', menu: '아메리카노 (ICED) 2잔', tags: ['긍정', '커피맛집', '단골'] },
      { text: '디저트 포장도 너무 깔끔하고 음료 안 흘리게 꼼꼼히 보내주셔서 감동했습니다.', menu: '생딸기 조각케이크 + 콜드브루', tags: ['긍정', '포장꼼꼼', '추천'] }
    ],
    chicken: [
      { text: '오늘따라 튀김옷이 진짜 바삭하고 속은 촉촉해서 아이들이 순식간에 다 먹었어요!', menu: '황금 후라이드 치킨 + 치즈볼', tags: ['긍정', '추천', '바삭함'] },
      { text: '양념 치킨 소스가 과하게 달지 않고 감칠맛 폭발이네요. 맥주 안주로 최고입니다.', menu: '매콤달콤 양념 치킨', tags: ['긍정', '맛있음', '치맥'] },
      { text: '닭다리 살이 정말 실하고 부드러워요. 치즈볼도 치즈 꽉 차서 대만족입니다!', menu: '반반 치킨 + 특제 모짜렐라 치즈볼', tags: ['긍정', '육즙가득', '사이드최고'] }
    ]
  },
  neutral: {
    cafe: [
      { text: '커피 맛은 무난하고 괜찮은데 얼음이 조금 빨리 녹은 것 같아요. 그래도 잘 마셨습니다.', menu: '아이스 카페라떼', tags: ['일반', '무난함'] },
      { text: '배달 시간은 보통이었고 빵도 무난했어요. 가성비는 평범한 편입니다.', menu: '플레인 크로플 + 아메리카노', tags: ['일반', '가성비보통'] },
      { text: '음료 맛은 깔끔합니다. 다만 빨대가 하나 덜 왔는데 다음엔 챙겨주세요.', menu: '얼그레이 레몬티 2잔', tags: ['일반', '개선요청'] }
    ],
    chicken: [
      { text: '무난하게 잘 먹었습니다. 기름 냄새 안 나고 평범하게 괜찮은 치킨이에요.', menu: '황금 후라이드 치킨', tags: ['일반', '무난함'] },
      { text: '배달 속도는 적당했고 맛도 나쁘지 않았어요. 소스 양이 조금만 더 많았으면 좋겠네요.', menu: '순살 간장 치킨', tags: ['일반', '개선요청'] },
      { text: '치킨은 맛있었는데 요청사항에 무 많이 달라고 적은 게 누락되었네요. 확인 부탁드립니다.', menu: '반반 치킨 1마리', tags: ['일반', '요청사항누락'] }
    ]
  },
  negative: {
    cafe: [
      { text: '따뜻한 라떼를 시켰는데 다 식어서 미지근하게 왔어요. 뚜껑도 살짝 열려서 비닐에 샜네요.', menu: '카페라떼 (HOT)', tags: ['식음', '포장불만', '불만'] },
      { text: '예상 시간보다 35분이나 늦게 와서 점심시간 다 끝나고 마셨습니다. 안내도 없어서 답답했네요.', menu: '아메리카노 3잔', tags: ['배달지연', '불만'] },
      { text: '가격에 비해 양이 너무 적고 빵이 너무 딱딱하게 굳어있어서 아쉬웠습니다.', menu: '수제 에그타르트 세트', tags: ['양적다', '품질불만'] }
    ],
    chicken: [
      { text: '비가 와서 그런지 예상 시간보다 40분이나 늦었고 치킨이 다 식어서 껍질이 눅눅했어요.', menu: '황금 후라이드 치킨', tags: ['배달지연', '식음', '불만'] },
      { text: '치즈볼 세트를 분명 추가 결제했는데 누락되어 안 왔습니다. 전화도 안 받으시고 실망입니다.', menu: '양념 치킨 + 치즈볼 세트', tags: ['포장누락', '불만'] },
      { text: '튀김옷에 기름이 너무 많이 배어있어서 몇 조각 못 먹고 물렸네요. 기름 관리 신경 써주세요.', menu: '순살 후라이드 치킨', tags: ['품질불만', '기름짐'] }
    ]
  }
}

export function getCustomerLoyaltyBadge(orderCount?: number) {
  const count = orderCount ?? 1
  if (count <= 1) {
    return { text: '신규고객', className: 'bg-slate-100 text-slate-600 border-slate-200' }
  } else if (count >= 5) {
    return { text: `${count}회 단골손님`, className: 'bg-amber-50 text-amber-700 border-amber-200 font-bold' }
  } else {
    return { text: `재주문 ${count}회`, className: 'bg-blue-50 text-blue-600 border-blue-200' }
  }
}

const getStorageKey = (storeId: string) => `localmate_reviews_v12_${storeId}`

const getDefaultData = (storeId: string): Review[] => {
  const raw = storeId === 'chicken' ? DEFAULT_CHICKEN_REVIEWS : DEFAULT_CAFE_REVIEWS
  return JSON.parse(JSON.stringify(raw))
}

const loadReviewsFromStorage = (storeId: string): Review[] => {
  if (typeof window === 'undefined') return getDefaultData(storeId)
  const storageKey = getStorageKey(storeId)
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {}
  const defaults = getDefaultData(storeId)
  localStorage.setItem(storageKey, JSON.stringify(defaults))
  return defaults
}

const getInitialStoreId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

export function ReviewsView() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(getInitialStoreId)
  const [reviews, setReviews] = useState<Review[]>(() => loadReviewsFromStorage(getInitialStoreId()))
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'negative'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const updateReviewsByStore = (storeId: string) => {
    setSelectedStoreId(storeId)
    const loaded = loadReviewsFromStorage(storeId)
    setReviews(loaded)
  }

  useEffect(() => {
    const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
    updateReviewsByStore(savedStore)

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        const newStoreId = customEvent.detail
        updateReviewsByStore(newStoreId)
        setFilter('all')
        setSearchQuery('')
        setDrafts({})
        setInfoMessage(null)
      }
    }

    const handleSettingsUpdate = () => {
      const cur = localStorage.getItem('localmate_store_id') || 'cafe'
      updateReviewsByStore(cur)
    }
    
    window.addEventListener('storeChange', handleSync)
    window.addEventListener('settingsChange', handleSettingsUpdate)
    window.addEventListener('storage', handleSettingsUpdate)
    return () => {
      window.removeEventListener('storeChange', handleSync)
      window.removeEventListener('settingsChange', handleSettingsUpdate)
      window.removeEventListener('storage', handleSettingsUpdate)
    }
  }, [])

  const saveAndSetReviews = (newReviews: Review[]) => {
    setReviews(newReviews)
    localStorage.setItem(getStorageKey(selectedStoreId), JSON.stringify(newReviews))

    const unansweredCount = newReviews.filter(r => !r.reply).length
    window.dispatchEvent(new CustomEvent('reviewsUpdated', { detail: { count: unansweredCount, storeId: selectedStoreId } }))
  }

  const isStrictNegativeReview = (r: Review) => {
    if (!r) return false
    return (Number(r.rating) || 5) <= 2
  }

  const filteredReviews = useMemo(() => {
    let result = Array.isArray(reviews) ? [...reviews] : []
    if (filter === 'unanswered') {
      result = result.filter(r => !r.reply)
    } else if (filter === 'negative') {
      result = result.filter(r => isStrictNegativeReview(r))
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r => {
        const text = String(r.text || (r as any).content || '').toLowerCase()
        const menu = String(r.menu || '').toLowerCase()
        const name = String(r.customerId || (r as any).author || '').toLowerCase()
        return text.includes(query) || menu.includes(query) || name.includes(query)
      })
    }
    return result
  }, [reviews, filter, searchQuery])

  const stats = useMemo(() => {
    const list = Array.isArray(reviews) ? reviews : []
    const total = list.length
    const unanswered = list.filter(r => !r.reply).length
    const negative = list.filter(r => isStrictNegativeReview(r)).length
    const positiveOrNeutralPending = list.filter(r => !isStrictNegativeReview(r) && !r.reply).length
    const avgRating = total > 0 
      ? (list.reduce((acc, curr) => acc + (Number(curr?.rating) || 0), 0) / total).toFixed(1)
      : '0.0'
    return { total, unanswered, negative, positiveOrNeutralPending, avgRating }
  }, [reviews])

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

  const buildDynamicDraft = (review: Review): string => {
    const savedSettingsRaw = localStorage.getItem(`localmate_settings_${selectedStoreId}`)
    let tone = 'polite'
    let compensation = 'service'

    if (savedSettingsRaw) {
      try {
        const parsed = JSON.parse(savedSettingsRaw)
        if (parsed.tone) tone = parsed.tone
        if (parsed.compensationPolicy) compensation = parsed.compensationPolicy
      } catch (e) {}
    }

    const author = String(review.customerId || '고객')
    const storeLabel = selectedStoreId === 'cafe' ? '동성로 카페' : '수성 치킨'

    if (isStrictNegativeReview(review)) {
      let complaintDetails = [
        '예상보다 지연된 배달과 안내 부족으로 소중한 식사 흐름을 끊어버려 너무나 면목이 없습니다. 피크 시간대 배송 관제와 조리 과정을 철저히 재점검하겠습니다.',
        '음식의 온도를 지켜드리지 못하고 식은 상태로 전달되어 너무나 속상하고 죄송합니다. 보온 패키징 재질을 대폭 보강하겠습니다.'
      ]
      const selectedDetail = complaintDetails[Math.floor(Math.random() * complaintDetails.length)]

      if (tone === 'concise') {
        let text = `안녕하세요, ${author}님. ${selectedDetail}`
        if (compensation === 'redelivery') text += ' 매장 연락 시 신속한 재배달 처리를 도와드립니다.'
        return applyForbiddenWordsFilter(text, selectedStoreId)
      }
      if (tone === 'friendly') {
        let text = `아이구 ${author}님, 사장입니다! 😭\n맛있게 드셔야 할 식사 시간에 큰 실망을 안겨드려 정말 속상하고 죄송해요.\n\n${selectedDetail}`
        if (compensation === 'redelivery') text += '\n\n혹시 식사 중이시라면 매장으로 바로 전화 한 통만 주세요! 즉시 새로 조리해서 다시 보내드릴게요!'
        return applyForbiddenWordsFilter(text, selectedStoreId)
      }
      return applyForbiddenWordsFilter(`고객님, 안녕하십니까. ${storeLabel} 점주입니다.\n저희 매장을 믿고 주문해 주셨는데 불편을 드려 진심으로 사과드립니다.\n\n${selectedDetail}\n\n다시 한번 고개 숙여 사과드립니다.`, selectedStoreId)
    }

    let highlight = '정성껏 준비한 메뉴를 맛있게 즐겨주셔서 정말 뿌듯합니다!'
    return applyForbiddenWordsFilter(`고객님, 안녕하십니까. ${storeLabel}입니다.\n정성껏 준비한 메뉴가 큰 만족을 드린 것 같아 기쁩니다.\n${highlight}\n앞으로도 변함없는 맛으로 보답하겠습니다.`, selectedStoreId)
  }

  // 🎯 일반 / 불만 / 긍정 리뷰 1:1:1 동일 확률(각 33.3%) 생성 핸들러
  const handleCreateMockReview = () => {
    const isCafe = selectedStoreId === 'cafe'
    const photoPool = isCafe ? CAFE_PHOTOS : CHICKEN_PHOTOS
    const randomCustomer = MOCK_CUSTOMERS[Math.floor(Math.random() * MOCK_CUSTOMERS.length)] + Math.floor(10 + Math.random() * 89)

    const currentHour = new Date().getHours()
    const currentMin = new Date().getMinutes()
    const timeString = `오늘 ${currentHour < 12 ? '오전' : '오후'} ${currentHour % 12 || 12}:${currentMin < 10 ? '0' : ''}${currentMin}`

    // 🎯 1/3 (33.3%) 확률로 유형 결정: 긍정(0) / 일반(1) / 불만(2)
    const rand = Math.random()
    let reviewType: 'positive' | 'neutral' | 'negative'
    let rating: number
    let typeLabel: string

    if (rand < 0.333) {
      reviewType = 'positive'
      rating = 5
      typeLabel = '긍정 리뷰'
    } else if (rand < 0.666) {
      reviewType = 'neutral'
      rating = 3
      typeLabel = '일반 리뷰'
    } else {
      reviewType = 'negative'
      rating = Math.random() > 0.5 ? 2 : 1
      typeLabel = '불만 리뷰'
    }

    const storeKey = isCafe ? 'cafe' : 'chicken'
    const templates = MOCK_REVIEW_TEMPLATES[reviewType][storeKey]
    const chosenTemplate = templates[Math.floor(Math.random() * templates.length)]

    const hasPhoto = reviewType === 'positive' ? Math.random() > 0.3 : Math.random() > 0.6
    const selectedPhoto = hasPhoto ? photoPool[Math.floor(Math.random() * photoPool.length)] : undefined

    const newReview: Review = {
      id: `mock-${Date.now()}`,
      customerId: randomCustomer,
      rating,
      date: timeString,
      menu: chosenTemplate.menu,
      text: chosenTemplate.text,
      tags: chosenTemplate.tags,
      photo: selectedPhoto,
      imageUrl: selectedPhoto,
      eventParticipant: reviewType === 'positive',
      orderCount: reviewType === 'negative' ? 1 : Math.floor(Math.random() * 5) + 1
    } as any

    saveAndSetReviews([newReview, ...reviews])
    setInfoMessage(`🎲 [${typeLabel} (★ ${rating})] 가상 리뷰가 성공적으로 생성되었습니다!`)
    setTimeout(() => setInfoMessage(null), 3500)
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
    setInfoMessage('답변이 성공적으로 등록되었습니다.')
    setTimeout(() => setInfoMessage(null), 3000)
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

  const handleBulkRegisterPositives = () => {
    const targetList = reviews.filter(r => !isStrictNegativeReview(r) && !r.reply)
    if (targetList.length === 0) {
      alert('자동 등록할 미답변 긍정/일반 리뷰가 없습니다.')
      return
    }

    setIsBulkGenerating(true)
    setTimeout(() => {
      let registeredCount = 0
      const updated = reviews.map(r => {
        if (!r.reply && !isStrictNegativeReview(r)) {
          registeredCount++
          const aiText = buildDynamicDraft(r)
          return { ...r, reply: aiText, replyDate: '방금 전' }
        }
        return r
      })

      saveAndSetReviews(updated)
      setIsBulkGenerating(false)
      setInfoMessage(`✅ 일반·칭찬 리뷰 ${registeredCount}건이 사장님 맞춤 어조로 일괄 자동 등록되었습니다.`)
      setTimeout(() => setInfoMessage(null), 4000)
    }, 600)
  }

  const handleBulkDraftNegatives = () => {
    const negativeUnanswered = reviews.filter(r => isStrictNegativeReview(r) && !r.reply)
    if (negativeUnanswered.length === 0) {
      alert('초안을 작성할 미답변 불만 리뷰가 없습니다.')
      return
    }

    setIsBulkGenerating(true)
    setTimeout(() => {
      const newDrafts: Record<string, string> = { ...drafts }
      let draftCount = 0

      reviews.forEach(r => {
        if (isStrictNegativeReview(r) && !r.reply) {
          newDrafts[r.id] = buildDynamicDraft(r)
          draftCount++
        }
      })

      setDrafts(newDrafts)
      setIsBulkGenerating(false)
      setInfoMessage(`📝 불만 리뷰 ${draftCount}건의 AI 추천 사과문 초안이 생성되었습니다. 확인 후 [저장 및 등록]을 눌러주세요.`)
      setTimeout(() => setInfoMessage(null), 4000)
    }, 600)
  }

  const handleResetReviews = () => {
    if (confirm('현재 매장의 리뷰 데이터를 기본 6건으로 깨끗하게 초기화하시겠습니까?')) {
      const freshDefaults = getDefaultData(selectedStoreId)
      saveAndSetReviews(freshDefaults)
      
      setDrafts({})
      setFilter('all')
      setSearchQuery('')
      setInfoMessage(`✅ 리뷰 목록이 초기 기본 데이터(${freshDefaults.length}건)로 완벽히 복원되었습니다.`)
      setTimeout(() => setInfoMessage(null), 3000)
    }
  }

  const currentPlatform = selectedStoreId === 'cafe' ? '배달의민족' : '쿠팡이츠'
  const currentPlatformColor = selectedStoreId === 'cafe' ? 'bg-[#2ac1bc]' : 'bg-[#00a8ec]'

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 font-sans">
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
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              전체 {stats.total}
            </button>
            <button 
              onClick={() => setFilter('unanswered')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${filter === 'unanswered' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              미답변 {stats.unanswered}
              {stats.unanswered > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filter === 'unanswered' ? 'bg-white text-indigo-700' : 'bg-rose-500 text-white'}`}>
                  {stats.unanswered}
                </span>
              )}
            </button>
            <button 
              onClick={() => setFilter('negative')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'negative' ? 'bg-rose-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              불만 리뷰 {stats.negative}
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            <button
              onClick={handleCreateMockReview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
              title="긍정(5점), 일반(3점), 불만(1~2점) 리뷰가 동일 확률(33%)로 균등 생성됩니다"
            >
              <PlusCircle className="size-4 text-emerald-600" />
              <span>가상 리뷰 생성</span>
            </button>

            {filter === 'negative' ? (
              <button 
                onClick={handleBulkDraftNegatives}
                disabled={isBulkGenerating || stats.negative === 0}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
              >
                {isBulkGenerating ? (
                  <>
                    <span className="size-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></span>
                    사과문 초안 작성 중...
                  </>
                ) : (
                  <>
                    <Edit3 className="size-4 text-rose-600" />
                    <span>불만 리뷰 초안 일괄 작성 ({stats.negative}건)</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleBulkRegisterPositives}
                disabled={isBulkGenerating || stats.positiveOrNeutralPending === 0}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
              >
                {isBulkGenerating ? (
                  <>
                    <span className="size-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                    일반 리뷰 등록 중...
                  </>
                ) : stats.positiveOrNeutralPending === 0 ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span className="text-emerald-600 font-semibold">일반·긍정 등록 완료</span>
                  </>
                ) : (
                  <>
                    <Zap className="size-4 fill-indigo-600 text-indigo-600" />
                    <span>일반·칭찬 리뷰 일괄 자동 등록 ({stats.positiveOrNeutralPending}건)</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleResetReviews}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-xs"
              title="리뷰 데이터 초기화 (기본 6건 복원)"
            >
              <RotateCcw className="size-3.5 text-slate-500" />
              <span>초기화</span>
            </button>
          </div>
        </div>
        
        {infoMessage && (
          <div className="mt-3 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="size-4 text-indigo-600 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

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
              불만 리뷰는 자동 등록되지 않으며, 사장님 검토 후 승인됩니다
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
        <div className="max-w-4xl mx-auto shadow-sm border border-slate-200 rounded-2xl bg-white overflow-hidden divide-y divide-border">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => {
              const loyalty = getCustomerLoyaltyBadge((review as any).orderCount)
              const enhancedReview = { ...review, loyaltyBadge: loyalty }

              return (
                <ReviewCard 
                  key={review.id} 
                  review={enhancedReview} 
                  draft={drafts[review.id]}
                  onGenerate={handleGenerate}
                  onDraftChange={handleDraftChange}
                  onCancel={handleCancel}
                  onSave={handleSave}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )
            })
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

export default ReviewsView