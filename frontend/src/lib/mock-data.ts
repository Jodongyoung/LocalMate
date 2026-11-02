export type SentimentTag = '긍정' | '대기불만' | '포장불만' | '맛불만' | '개선요청' | '위생불만' | '기타'

export interface Review {
  id: string
  platform: '배달의민족' | '쿠팡이츠' | '요기요'
  customerId: string
  rating: number
  date: string
  menu: string
  text: string
  photo?: string
  tags: SentimentTag[]
  eventParticipant: boolean
  reply?: string
  replyDate?: string
}

export const CHICKEN_REVIEWS: Review[] = [
  {
    id: 'c1',
    platform: '배달의민족',
    customerId: '치킨러버92',
    rating: 5,
    date: '오늘 오후 7:42',
    menu: '후라이드 치킨 1마리 + 치즈볼',
    text: '리뷰이벤트로 치즈볼 받았는데 너무 맛있어요!',
    tags: ['긍정'],
    eventParticipant: true,
  },
  {
    id: 'c2',
    platform: '배달의민족',
    customerId: '수성못직장인',
    rating: 2,
    date: '오늘 오후 6:15',
    menu: '양념 치킨 1마리',
    text: '맛은 괜찮은데 예상 시간보다 40분이나 늦게 왔어요.',
    tags: ['대기불만'],
    eventParticipant: false,
  }
]

export const CAFE_REVIEWS: Review[] = [
  {
    id: 'caf1',
    platform: '배달의민족',
    customerId: '커피마스터',
    rating: 5,
    date: '오늘 오후 1:30',
    menu: '아메리카노 + 크로플',
    text: '크로플 겉바속촉 제대로네요!',
    tags: ['긍정'],
    eventParticipant: true,
  }
]

// ✅ 매장별 독립 대시보드 데이터 (카페 vs 치킨 불만 키워드 수치 완벽 분리)
export const STORE_DASHBOARD_DATA = {
  cafe: {
    salesTarget: { target: 20000000, current: 15200000, percentage: 76 },
    kpis: {
      todaySales: 980000,
      todayDelta: 8.5,
      monthlySales: 15200000,
      monthlyDelta: 6.2,
      reviewEventCount: 24,
      reviewEventDelta: 5,
    },
    positiveRate: '94%',
    sentimentTrend: [
      { month: '6월', positive: 18, complaint: 2, improvement: 1 },
      { month: '7월', positive: 22, complaint: 1, improvement: 2 },
      { month: '8월', positive: 20, complaint: 3, improvement: 1 },
      { month: '9월', positive: 25, complaint: 2, improvement: 2 },
      { month: '10월', positive: 30, complaint: 1, improvement: 1 },
      { month: '11월', positive: 35, complaint: 2, improvement: 2 },
    ],
    // ☕ 카페 전용 불만 키워드 5개 (치킨과 수치가 다름)
    complaintKeywords: [
      { keyword: '음료 온도 (식음)', count: 32, percent: 28 },
      { keyword: '빨대·시럽 누락', count: 18, percent: 15 },
      { keyword: '얼음 양 과다', count: 11, percent: 10 },
      { keyword: '디저트 당도', count: 7, percent: 6 },
      { keyword: '컵 쏟아짐', count: 4, percent: 3 },
    ]
  },
  chicken: {
    salesTarget: { target: 25000000, current: 18500000, percentage: 74 },
    kpis: {
      todaySales: 1284000,
      todayDelta: 12.4,
      monthlySales: 18500000,
      monthlyDelta: 8.1,
      reviewEventCount: 32,
      reviewEventDelta: 8,
    },
    positiveRate: '88%',
    sentimentTrend: [
      { month: '6월', positive: 15, complaint: 4, improvement: 3 },
      { month: '7월', positive: 18, complaint: 5, improvement: 2 },
      { month: '8월', positive: 20, complaint: 3, improvement: 4 },
      { month: '9월', positive: 24, complaint: 4, improvement: 2 },
      { month: '10월', positive: 28, complaint: 3, improvement: 3 },
      { month: '11월', positive: 32, complaint: 4, improvement: 2 },
    ],
    // 🍗 치킨집 전용 불만 키워드 5개 (사진 속 양식과 100% 일치)
    complaintKeywords: [
      { keyword: '대기시간 지연', count: 68, percent: 24 },
      { keyword: '포장 누락', count: 34, percent: 12 },
      { keyword: '음식 온도 (식음)', count: 25, percent: 9 },
      { keyword: '양 대비 가격', count: 20, percent: 7 },
      { keyword: '소스 누수', count: 14, percent: 5 },
    ]
  }
}

export const initialReviews = [...CAFE_REVIEWS, ...CHICKEN_REVIEWS]
export const salesTarget = STORE_DASHBOARD_DATA.chicken.salesTarget
export const kpis = STORE_DASHBOARD_DATA.chicken.kpis
export const positiveRate = STORE_DASHBOARD_DATA.chicken.positiveRate
export const sentimentTrend = STORE_DASHBOARD_DATA.chicken.sentimentTrend
export const complaintKeywords = STORE_DASHBOARD_DATA.chicken.complaintKeywords

export const initialChat = [
  { role: 'assistant', content: '사장님, 안녕하세요! LocalMate AI 업무 비서입니다. 오늘 매장 상황을 완벽하게 분석해 드릴게요. 무엇을 도와드릴까요?' }
]

export const quickActions = [
  '✨ 리뷰 답글 일괄 초안',
  '이번 주 매출 요약해줘',
  '불만 리뷰 원인 분석',
  '단골 고객 통계'
]

export const assistantResponses: Record<string, string> = {
  '✨ 리뷰 답글 일괄 초안': '미답변 리뷰에 대한 답글 초안을 작성했습니다. 우측 제안 카드에서 확인 후 승인해주세요.',
  '이번 주 매출 요약해줘': '이번 주 총 매출은 목표 대비 순항 중입니다. 주말 피크 타임 주문 집중 현상을 대비해 주세요.',
  '불만 리뷰 원인 분석': '분석 결과 배달 지연과 포장 누락이 주요 원인입니다. 우천 시 배달 팁 조정을 권장합니다.',
  '단골 고객 통계': '3회 이상 재주문 고객 비율이 높으며 객단가 상승에 기여하고 있습니다.'
}

export const generateReplyDraft = (review: Review, tone: string = 'friendly', refundPolicy: string = '') => {
  return `안녕하세요, ${review.customerId}님! 소중한 리뷰 감사합니다. 앞으로도 최선을 다하겠습니다!`
}

export const formatKRW = (value: number) => {
  return new Intl.NumberFormat('ko-KR').format(value);
};