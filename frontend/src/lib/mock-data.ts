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

// 🍗 치킨집 리뷰 데이터 (6개)
export const CHICKEN_REVIEWS: Review[] = [
  {
    id: 'c1',
    platform: '배달의민족',
    customerId: '치킨러버92',
    rating: 5,
    date: '오늘 오후 7:42',
    menu: '후라이드 치킨 1마리 + 치즈볼',
    text: '리뷰이벤트로 치즈볼 받았는데 너무 맛있어요! 튀김옷이 진짜 바삭하고 속은 촉촉해서 아이들이 순식간에 다 먹었어요. 수성구에서 제일 맛있는 집인 듯합니다.',
    photo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
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
    text: '맛은 괜찮은데 예상 시간보다 40분이나 늦게 왔어요. 비가 와서 그런 건 이해하지만 중간에 안내라도 해주셨으면 좋겠습니다. 치킨도 좀 식어서 왔네요.',
    photo: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&q=80',
    tags: ['대기불만'],
    eventParticipant: false,
  },
  {
    id: 'c3',
    platform: '배달의민족',
    customerId: '반반무많이',
    rating: 3,
    date: '어제 오후 9:03',
    menu: '반반 치킨 + 치즈볼 + 콜라 1.25L',
    text: '치킨은 맛있었는데 주문한 콜라가 안 왔어요. 요청사항에 무 많이 달라고 적었는데 그것도 반영이 안 됐네요. 포장 확인 한 번만 더 부탁드려요.',
    photo: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
    tags: ['포장불만', '개선요청'],
    eventParticipant: true,
  },
  {
    id: 'c4',
    platform: '배달의민족',
    customerId: '경대생민지',
    rating: 5,
    date: '어제 오후 8:21',
    menu: '간장마늘 치킨 1마리',
    text: '간장마늘 맛집 인정합니다. 단짠 조화가 완벽해요. 사장님 손글씨 메모도 감동이었어요. 자주 시켜먹을게요!',
    photo: undefined,
    tags: ['긍정'],
    eventParticipant: true,
    reply: '민지님! 소중한 리뷰 감사합니다. 간장마늘 치킨은 저희 매장 최고 인기 메뉴랍니다🥰 손글씨 메모까지 알아봐 주셔서 정말 기뻐요. 앞으로도 변함없는 맛으로 보답하겠습니다!',
    replyDate: '어제 오후 8:45'
  },
  {
    id: 'c5',
    platform: '배달의민족',
    customerId: '주말엔치맥',
    rating: 4,
    date: '2일 전',
    menu: '순살 파닭',
    text: '파가 조금 매웠지만 고기는 부드럽고 좋았습니다. 양도 꽤 많네요.',
    photo: undefined,
    tags: ['개선요청'],
    eventParticipant: false,
  },
  {
    id: 'c6',
    platform: '배달의민족',
    customerId: '야식킬러',
    rating: 5,
    date: '3일 전',
    menu: '똥집튀김 + 매운소스',
    text: '잡내 하나도 없고 바삭 쫄깃해서 술안주로 최고입니다. 앞으로 야식은 무조건여기입니다!',
    photo: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&q=80',
    tags: ['긍정'],
    eventParticipant: true,
  }
]

// ☕ 카페 리뷰 데이터 (기존 3개에서 든든하게 6개로 확장!)
export const CAFE_REVIEWS: Review[] = [
  {
    id: 'caf1',
    platform: '배달의민족',
    customerId: '커피마스터',
    rating: 5,
    date: '오늘 오후 1:30',
    menu: '아이스 아메리카노 2잔 + 크로플 세트',
    text: '크로플 겉바속촉 제대로네요! 아메리카노 산미도 딱 제가 좋아하는 스타일이에요. 포장도 안 새고 깔끔하게 잘 왔습니다.',
    photo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80',
    tags: ['긍정'],
    eventParticipant: true,
  },
  {
    id: 'caf2',
    platform: '배달의민족',
    customerId: '동성로피플',
    rating: 2,
    date: '오늘 오전 11:20',
    menu: '따뜻한 카페라떼',
    text: '라떼 시켰는데 다 식어서 왔어요... 그리고 컵 뚜껑이 살짝 열려있어서 쟁반에 조금 샜네요. 배달 기사님 문제인지 매장 포장 문제인지 모르겠지만 실망입니다.',
    photo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80',
    tags: ['포장불만', '맛불만'],
    eventParticipant: false,
  },
  {
    id: 'caf3',
    platform: '배달의민족',
    customerId: '단거최고',
    rating: 5,
    date: '어제 오후 4:15',
    menu: '초코쿠키 3개 + 딸기 스무디',
    text: '당 떨어져서 시켰는데 스무디 양 진짜 많아요!! 쿠키도 꾸덕하고 너무 달지 않아서 순삭했습니다. 서비스로 주신 마들렌도 감사합니다.',
    photo: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=500&q=80',
    tags: ['긍정'],
    eventParticipant: true,
    reply: '안녕하세요! 당 충전 제대로 하셨다니 다행이네요😊 스무디는 항상 꽉꽉 채워드리고 있답니다. 다음에도 달콤한 디저트 생각나실 때 찾아주세요!',
    replyDate: '어제 오후 4:30'
  },
  {
    id: 'caf4',
    platform: '배달의민족',
    customerId: '반월당주민',
    rating: 5,
    date: '2일 전',
    menu: '바닐라 빈 라떼 + 말레이크레페',
    text: '배달 시킬 때마다 카페에 직접 가서 먹는 것만큼 퀄리티가 유지돼서 너무 좋아요. 크레페 겹겹이 부드럽고 커피 향도 진해서 대만족입니다.',
    photo: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&q=80',
    tags: ['긍정'],
    eventParticipant: true,
  },
  {
    id: 'caf5',
    platform: '배달의민족',
    customerId: '카페투어러',
    rating: 3,
    date: '3일 전',
    menu: '자몽 에이드',
    text: '에이드 탄산이 조금 더 강했으면 좋겠어요. 시럽은 상큼하고 맛있는데 얼음이 너무 많아서 금방 싱거워졌네요.',
    photo: undefined,
    tags: ['개선요청'],
    eventParticipant: false,
  },
  {
    id: 'caf6',
    platform: '배달의민족',
    customerId: '디저트덕후',
    rating: 5,
    date: '4일 전',
    menu: '생크림 카스텔라 + 밀크티',
    text: '밀크티 부드럽고 카스텔라 속 크림이 아주 꽉 차 있어요! 포장도 찌그러짐 없이 안전하게 잘 도착했습니다.',
    photo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
    tags: ['긍정'],
    eventParticipant: true,
  }
]

// ✅ 매장별 대시보드 데이터 (리뷰 6개 구성과 완벽히 연동)
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
    complaintKeywords: [
      { keyword: '배달 지연', count: 5, trend: '+1' },
      { keyword: '포장 누락', count: 3, trend: '0' },
      { keyword: '커피 쏟아짐', count: 2, trend: '-1' },
      { keyword: '음료 온도', count: 1, trend: '0' },
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
    complaintKeywords: [
      { keyword: '배달 지연', count: 12, trend: '+3' },
      { keyword: '포장 누락', count: 7, trend: '-1' },
      { keyword: '맛 변동', count: 4, trend: '0' },
      { keyword: '온도 불만', count: 3, trend: '+1' },
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