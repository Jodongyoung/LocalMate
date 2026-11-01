export type SentimentTag = '긍정' | '대기불만' | '포장불만' | '맛불만' | '개선요청'

export type Review = {
  id: string
  customerId: string
  rating: number
  menu: string
  date: string
  text: string
  photo?: string
  tags: SentimentTag[]
  reply: string | null
  eventParticipant: boolean
}

export const stores = [
  { id: 'dsr', name: '대구 동성로점', platform: '배달의민족 연동 매장' },
  { id: 'smd', name: '대구 수성못점', platform: '쿠팡이츠 연동 매장' },
  { id: 'chs', name: '대구 칠성시장점', platform: '요기요 연동 매장' },
]

export const salesTarget = {
  goal: 25_000_000,
  current: 18_500_000,
}

export const kpis = {
  todaySales: 1_284_000,
  todayDelta: 12.4,
  monthlySales: 18_500_000,
  monthlyDelta: 8.1,
  reviewEventCount: 342,
  reviewEventDelta: 21,
}

export const sentimentTrend = [
  { month: '6월', positive: 182, complaint: 41, improvement: 22 },
  { month: '7월', positive: 205, complaint: 38, improvement: 27 },
  { month: '8월', positive: 231, complaint: 52, improvement: 30 },
  { month: '9월', positive: 214, complaint: 45, improvement: 24 },
  { month: '10월', positive: 248, complaint: 36, improvement: 29 },
  { month: '11월', positive: 263, complaint: 47, improvement: 33 },
]

export const complaintKeywords = [
  { keyword: '대기시간 지연', percent: 24, count: 68 },
  { keyword: '포장 누락', percent: 12, count: 34 },
  { keyword: '음식 온도 (식음)', percent: 9, count: 25 },
  { keyword: '양 대비 가격', percent: 7, count: 20 },
  { keyword: '소스 누수', percent: 5, count: 14 },
]

export const initialReviews: Review[] = [
  {
    id: 'r1',
    customerId: '치킨러버92',
    rating: 5,
    menu: '후라이드 치킨 1마리 + 치즈볼',
    date: '오늘 오후 7:42',
    text: '리뷰이벤트로 치즈볼 받았는데 너무 맛있어요! 튀김옷이 진짜 바삭하고 속은 촉촉해서 아이들이 순식간에 다 먹었어요. 동성로에서 제일 맛있는 집인 듯합니다.',
    photo: '/reviews/fried-chicken.png',
    tags: ['긍정'],
    reply: null,
    eventParticipant: true,
  },
  {
    id: 'r2',
    customerId: '동성로직장인',
    rating: 2,
    menu: '양념 치킨 1마리',
    date: '오늘 오후 6:15',
    text: '맛은 괜찮은데 예상 시간보다 40분이나 늦게 왔어요. 비가 와서 그런 건 이해하지만 중간에 안내라도 해주셨으면 좋겠습니다. 치킨도 좀 식어서 왔네요.',
    photo: '/reviews/yangnyeom.png',
    tags: ['대기불만'],
    reply: null,
    eventParticipant: false,
  },
  {
    id: 'r3',
    customerId: '반반무많이',
    rating: 3,
    menu: '반반 치킨 + 치즈볼 + 콜라 1.25L',
    date: '어제 오후 9:03',
    text: '치킨은 맛있었는데 주문한 콜라가 안 왔어요. 요청사항에 무 많이 달라고 적었는데 그것도 반영이 안 됐네요. 포장 확인 한 번만 더 부탁드려요.',
    photo: '/reviews/half-half.png',
    tags: ['포장불만', '개선요청'],
    reply: null,
    eventParticipant: true,
  },
  {
    id: 'r4',
    customerId: '경대생민지',
    rating: 5,
    menu: '간장마늘 치킨 1마리',
    date: '어제 오후 8:21',
    text: '간장마늘 맛집 인정합니다. 단짠 조화가 완벽해요. 사장님 손글씨 메모도 감동이었어요. 자주 시켜먹을게요!',
    tags: ['긍정'],
    reply:
      '민지 고객님, 따뜻한 리뷰 정말 감사합니다! 손글씨 메모까지 기억해주셔서 저희가 더 감동이에요. 다음 주문 때도 정성껏 준비하겠습니다. 시험 기간 화이팅하세요!',
    eventParticipant: true,
  },
  {
    id: 'r5',
    customerId: '야식요정',
    rating: 4,
    menu: '후라이드 치킨 1마리',
    date: '2일 전',
    text: '맛있게 먹었어요. 다만 배달이 조금 오래 걸렸고, 소스가 살짝 새어 있었어요. 그래도 맛은 최고!',
    tags: ['대기불만', '포장불만'],
    reply: null,
    eventParticipant: false,
  },
]

export const quickActions = [
  '✨ 이번 달 주요 불만 요약',
  '✨ 비 오는 날 매출 증대 팁',
  '✨ 리뷰 답글 일괄 초안',
] as const

export const assistantResponses: Record<string, string> = {
  '✨ 이번 달 주요 불만 요약':
    '11월 불만 리뷰 47건을 분석했어요.\n\n1. 대기시간 지연 (24%) — 금·토 저녁 7~9시에 집중돼요.\n2. 포장 누락 (12%) — 음료·치즈볼 등 사이드 메뉴 누락이 대부분이에요.\n3. 음식 온도 (9%) — 대부분 배달 지연과 함께 발생했어요.\n\n💡 피크타임 조리 인력 1명 보강과 포장 체크리스트 도입을 추천드려요.',
  '✨ 비 오는 날 매출 증대 팁':
    '지난 6개월 데이터를 보면, 비 오는 날 주문이 평균 31% 늘어요.\n\n• 오후 4시 전 "비 오는 날 2천원 할인" 쿠폰을 미리 발행하세요.\n• 세트 메뉴(치킨+치즈볼+음료) 노출을 상단으로 올리면 객단가가 약 18% 올라가요.\n• 예상 배달시간을 10분 넉넉하게 설정하면 대기불만 리뷰를 줄일 수 있어요.',
  '✨ 리뷰 답글 일괄 초안':
    '미답변 리뷰 4건에 대한 답글 초안을 준비했어요.\n\n• 치킨러버92님 (★5) — 감사 인사 + 재방문 유도\n• 동성로직장인님 (★2) — 지연 사과 + 다음 주문 쿠폰 안내\n• 반반무많이님 (★3) — 누락 사과 + 포장 재확인 약속\n• 야식요정님 (★4) — 소스 포장 개선 약속\n\n하단 "고객 리뷰 관리"에서 각 리뷰의 "AI 답글 추천 생성"을 눌러 바로 확인·수정할 수 있어요.',
}

export const initialChat = [
  {
    role: 'assistant' as const,
    content:
      '사장님, 안녕하세요! LocalMate AI 업무 비서입니다. 오늘 대구 동성로점 매출은 1,284,000원으로 어제보다 12.4% 높아요. 미답변 리뷰가 4건 있어요. 무엇을 도와드릴까요?',
  },
  { role: 'user' as const, content: '오늘 저녁 피크타임 준비할 거 알려줘' },
  {
    role: 'assistant' as const,
    content:
      '오늘 저녁 7시부터 비 예보가 있어 주문이 평소보다 약 30% 늘 것으로 예상돼요. 후라이드 재고를 20% 더 준비하시고, 배민 예상 배달시간을 50분으로 조정하시는 걸 추천드려요.',
  },
]

export function formatKRW(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export function generateReplyDraft(review: Review) {
  const name = review.customerId
  const mainMenu = review.menu.split('+')[0].trim()
  if (review.tags.includes('대기불만') && review.tags.includes('포장불만')) {
    return `${name}님, 맛있게 드셨다니 다행이지만 배달 지연과 소스 누수로 불편을 드려 정말 죄송합니다. 소스 용기를 밀봉형으로 교체하고 피크타임 조리 인력을 보강하겠습니다. 다음에는 더 빠르고 깔끔하게 보내드릴게요!`
  }
  if (review.tags.includes('대기불만')) {
    return `${name}님, 소중한 리뷰 감사합니다. 비 오는 날 주문이 몰려 예상보다 많이 늦어졌고, 중간 안내도 드리지 못해 정말 죄송합니다. 따뜻할 때 드셨어야 할 ${mainMenu}이(가) 식어서 더 아쉬우셨을 것 같아요. 앞으로 지연 시 바로 안내드리도록 개선하겠습니다. 다음 주문 시 요청사항에 리뷰 닉네임을 남겨주시면 사이드 메뉴로 보답드릴게요.`
  }
  if (review.tags.includes('포장불만')) {
    return `${name}님, 주문하신 메뉴 중 일부가 누락되어 정말 죄송합니다. 요청사항까지 놓친 점 깊이 반성하고 있어요. 앞으로 포장 체크리스트로 출고 전 이중 확인하겠습니다. 누락된 메뉴는 배민 고객센터 또는 매장(053-123-4567)으로 연락 주시면 바로 보상해 드릴게요.`
  }
  return `${name}님, 맛있게 드셔주셔서 정말 감사합니다! ${mainMenu}을(를) 좋아해 주셔서 저희 주방 식구들 모두 힘이 납니다. 리뷰 이벤트 참여도 감사드리고, 다음에도 바삭하고 따뜻하게 준비해 드릴게요. 늘 건강하세요!`
}
