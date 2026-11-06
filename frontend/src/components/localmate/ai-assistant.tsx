'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { STORE_DASHBOARD_DATA, CAFE_REVIEWS, CHICKEN_REVIEWS, assistantResponses, type Review } from '@/lib/mock-data'
import { getCurrentWeatherScenario, getSavedStoreLocation } from '@/lib/weather-scenarios'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'assistant'; content: string }

type Point = { x: number; y: number }

const FAB_SIZE = 64
const EDGE_GAP = 24
const PANEL_GAP = 12
const PANEL_MAX_HEIGHT = 600
const DRAG_THRESHOLD = 5
const KEY_STEP = 24

// 기본 시작 매출 및 목표
const BASE_FINANCIALS = {
  cafe: { today: 980000, month: 15200000, target: 20000000, delta: '+8.5%' },
  chicken: { today: 1284000, month: 18500000, target: 25000000, delta: '+12.4%' }
}

function clampToViewport({ x, y }: Point): Point {
  return {
    x: Math.min(Math.max(x, EDGE_GAP), window.innerWidth - FAB_SIZE - EDGE_GAP),
    y: Math.min(Math.max(y, EDGE_GAP), window.innerHeight - FAB_SIZE - EDGE_GAP),
  }
}

function getPanelLayout({ x, y }: Point) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const alignLeft = x + FAB_SIZE / 2 < vw / 2
  const openAbove = y + FAB_SIZE / 2 > vh / 2
  const available = openAbove ? y - PANEL_GAP - EDGE_GAP : vh - (y + FAB_SIZE + PANEL_GAP) - EDGE_GAP
  const style: React.CSSProperties = {
    ...(alignLeft ? { left: Math.max(x, 16) } : { right: Math.max(vw - (x + FAB_SIZE), 16) }),
    ...(openAbove ? { bottom: vh - y + PANEL_GAP } : { top: y + FAB_SIZE + PANEL_GAP }),
  }
  const origin = `${openAbove ? 'bottom' : 'top'} ${alignLeft ? 'left' : 'right'}`
  return { style: { ...style, transformOrigin: origin }, height: Math.min(PANEL_MAX_HEIGHT, Math.max(available, 280)) }
}

export function AiAssistant({
  reviews: initialReviews,
  onGenerateAllDrafts,
}: {
  reviews?: Review[]
  onGenerateAllDrafts?: () => Review[]
}) {
  const [open, setOpen] = useState(false)
  const [storeId, setStoreId] = useState('cafe')
  const [currentReviews, setCurrentReviews] = useState<Review[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 🎯 실시간 저장된 리뷰 데이터 로드
  const loadStoreReviews = (sId: string): Review[] => {
    if (typeof window === 'undefined') return sId === 'chicken' ? CHICKEN_REVIEWS : CAFE_REVIEWS
    const storageKey = `localmate_reviews_v12_${sId}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) {}
    }
    return sId === 'chicken' ? CHICKEN_REVIEWS : CAFE_REVIEWS
  }

  // 🎯 실시간 누적 매출 데이터 로드 (오늘 매출, 이번 달 누적 매출, 목표 달성률)
  const getLiveFinancials = (sId: string) => {
    const isChicken = sId.includes('치킨') || sId.includes('chicken')
    const base = isChicken ? BASE_FINANCIALS.chicken : BASE_FINANCIALS.cafe

    if (typeof window === 'undefined') {
      return {
        todaySales: base.today,
        monthSales: base.month,
        targetSales: base.target,
        percentage: Math.round((base.month / base.target) * 100),
        delta: base.delta
      }
    }

    const savedToday = localStorage.getItem(`localmate_today_sales_${sId}`)
    const savedMonth = localStorage.getItem(`localmate_month_sales_${sId}`)

    const todaySales = savedToday ? Number(savedToday) : base.today
    const monthSales = savedMonth ? Number(savedMonth) : base.month
    const targetSales = base.target
    const percentage = Math.min(100, Math.round((monthSales / targetSales) * 100))

    return {
      todaySales,
      monthSales,
      targetSales,
      percentage,
      delta: base.delta
    }
  }

  // 🎯 지점명, 실시간 오늘 매출, 미답변 건수를 반영한 첫 인사말
  const generateGreeting = (sId: string, revs: Review[]) => {
    const isChicken = sId.includes('치킨') || sId.includes('chicken')
    const storeKey = isChicken ? 'chicken' : 'cafe'
    const { branchName } = getSavedStoreLocation(storeKey)
    const fin = getLiveFinancials(sId)
    const unansweredCount = revs.filter((r) => !r.reply).length

    let greeting = `사장님, 안녕하세요! LocalMate AI 업무 비서입니다. 오늘 ${branchName} 매출은 ${fin.todaySales.toLocaleString()}원으로 어제보다 ${fin.delta} 높아요.`
    if (unansweredCount > 0) {
      greeting += ` 현재 확인이 필요한 미답변 리뷰가 ${unansweredCount}건 있어요.`
    } else {
      greeting += ` 모든 고객 리뷰에 답변이 완료되었습니다 완벽해요!`
    }
    greeting += ` 무엇을 도와드릴까요?`
    return greeting
  }

  // 🎯 1. 리뷰 분석 요약 핸들러 (실시간 통계 반영)
  const buildReviewSummaryResponse = (revs: Review[]) => {
    const total = revs.length
    const unanswered = revs.filter((r) => !r.reply).length
    const positive = revs.filter((r) => (Number(r.rating) || 5) >= 4).length
    const neutral = revs.filter((r) => (Number(r.rating) || 5) === 3).length
    const negative = revs.filter((r) => (Number(r.rating) || 5) <= 2).length

    const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0
    const avgRating = total > 0 ? (revs.reduce((acc, c) => acc + (Number(c.rating) || 5), 0) / total).toFixed(1) : '0.0'

    const isChicken = storeId.includes('치킨') || storeId.includes('chicken')
    const posPoint = isChicken ? '바삭한 튀김 식감, 깨끗한 기름, 치즈볼 맛' : '원두 산미 밸런스, 버터 크로플, 꼼꼼한 포장'
    const negPoint = isChicken ? '피크시간 배달 지연, 치킨 식음, 소스/치킨무 누락' : '식은 음료 온도, 배달 지연, 포장 누락'

    return `📊 [실시간 고객 리뷰 분석 요약]

• 총 리뷰 수: ${total}건 (평균 별점 ★ ${avgRating})
• 감성 분포: 긍정 ${positive}건 (${positiveRate}%), 일반 ${neutral}건, 불만 ${negative}건
• 미답변 리뷰: ${unanswered}건

✨ 주요 호평 포인트:
- "${posPoint}"에 대한 칭찬이 집중되고 있습니다.

⚠️ 주요 불만 및 개선 요청:
- "${negPoint}" 관련 지적이 접수되었습니다.

💡 비서 추천 조치:
현재 미답변 리뷰 ${unanswered}건 중 평점 1~2점 불만 리뷰를 우선 검토하여 사과 및 재방문 보상 답글을 남겨주세요.`
  }

  // 🎯 2. 단골 고객 통계 핸들러 (실제 orderCount 집계)
  const buildLoyaltySummaryResponse = (revs: Review[]) => {
    const total = revs.length
    let regularCount = 0
    let repeatCount = 0
    let newCount = 0

    revs.forEach((r: any) => {
      const count = Number(r.orderCount) || 1
      if (count >= 5) regularCount++
      else if (count >= 2) repeatCount++
      else newCount++
    })

    const regularRate = total > 0 ? Math.round((regularCount / total) * 100) : 0
    const repeatRate = total > 0 ? Math.round((repeatCount / total) * 100) : 0
    const newRate = total > 0 ? Math.round((newCount / total) * 100) : 0

    return `👥 [실시간 단골 고객 통계 분석]

• 분석 대상 고객: 총 ${total}명
• 5회 이상 VIP 단골손님: ${regularCount}명 (${regularRate}%)
• 2~4회 재주문 고객: ${repeatCount}명 (${repeatRate}%)
• 신규 유입 고객: ${newCount}명 (${newRate}%)

📈 AI 인사이트:
전체 고객의 ${regularRate + repeatRate}%가 2회 이상 재주문 고객으로 충성도가 매우 높습니다! VIP 단골 고객 리뷰에 맞춤형 감사의 답글을 남기면 객단가 유지에 큰 도움이 됩니다.`
  }

  // 🎯 3. 이번 달 주요 불만 요약
  const getMonthlyComplaintSummary = (revs: Review[]) => {
    const totalCount = revs.length
    const negativeCount = revs.filter((r) => (Number(r.rating) || 5) <= 3).length

    return `🚨 이번 달 총 ${totalCount}건의 리뷰 중 불만·개선요청 ${negativeCount}건을 분석했어요.

1. 대기시간 지연 — 피크타임 배송 지연 집중
2. 포장 누락 — 요청사항(소스, 사이드 등) 누락
3. 음식 온도 — 배달 중 온도 저하 불만

💡 피크타임 조리 예상시간 +10분 연장과 포장 체크리스트 점검을 추천드려요.`
  }

  // 🎯 4. 이번 주 매출 요약 (실시간 누적 매출 연동)
  const getLiveSalesSummary = (sId: string) => {
    const fin = getLiveFinancials(sId)
    const diff = Math.max(0, fin.targetSales - fin.monthSales)

    return `💰 [실시간 매출 및 목표 달성 현황]

• 오늘 발생 매출: ${fin.todaySales.toLocaleString()}원
• 이번 달 누적 매출: ${fin.monthSales.toLocaleString()}원 (목표: ${fin.targetSales.toLocaleString()}원)
• 목표 달성률: ${fin.percentage}% 달성 (남은 금액: ${diff.toLocaleString()}원)

현재 주문 유입 추세로 볼 때 이번 달 매출 목표 달성률은 매우 안정적으로 순항 중입니다!`
  }

  // 실시간 동기화 리스너
  useEffect(() => {
    const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
    setStoreId(savedStore)
    const revs = loadStoreReviews(savedStore)
    setCurrentReviews(revs)
    setMessages([{ role: 'assistant', content: generateGreeting(savedStore, revs) }])

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const newStore = customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      setStoreId(newStore)
      const freshRevs = loadStoreReviews(newStore)
      setCurrentReviews(freshRevs)
      setMessages([{ role: 'assistant', content: generateGreeting(newStore, freshRevs) }])
    }

    const handleReviewSync = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      const freshRevs = loadStoreReviews(currentStore)
      setCurrentReviews(freshRevs)
    }

    const handleSalesSync = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      const freshRevs = loadStoreReviews(currentStore)
      setCurrentReviews(freshRevs)
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('reviewsUpdated', handleReviewSync)
    window.addEventListener('localmate_sales_updated', handleSalesSync)
    window.addEventListener('localmate_sales_reset', handleSalesSync)
    window.addEventListener('settingsChange', handleStoreSync)
    window.addEventListener('storage', handleSalesSync)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('reviewsUpdated', handleReviewSync)
      window.removeEventListener('localmate_sales_updated', handleSalesSync)
      window.removeEventListener('localmate_sales_reset', handleSalesSync)
      window.removeEventListener('settingsChange', handleStoreSync)
      window.removeEventListener('storage', handleSalesSync)
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  const scrollQuickActions = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -150 : 150
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const currentWeather = getCurrentWeatherScenario(storeId)

  const unifiedQuickActions = [
    currentWeather.quickChipText,
    '✨ 리뷰 분석 요약',
    '✨ 이번 달 주요 불만 요약',
    '✨ 이번 주 매출 요약해줘',
    '✨ 단골 고객 통계'
  ]

  function send(text: string) {
    const cleanText = text.replace('✨ ', '').trim()
    const content = cleanText
    if (!content || typing) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      let reply = ''
      const cleanChipWeather = currentWeather.quickChipText.replace('✨ ', '').trim()
      const freshReviews = loadStoreReviews(storeId)

      if (content.includes('리뷰 분석') || content.includes('리뷰 요약') || content.includes('리뷰 분석 요약')) {
        reply = buildReviewSummaryResponse(freshReviews)
      } else if (content.includes('단골') || content.includes('고객 통계')) {
        reply = buildLoyaltySummaryResponse(freshReviews)
      } else if (content.includes('불만 요약') || content.includes('불만')) {
        reply = getMonthlyComplaintSummary(freshReviews)
      } else if (content.includes('매출')) {
        // 🎯 실시간 누적 매출 반영 응답
        reply = getLiveSalesSummary(storeId)
      } else if (
        content === cleanChipWeather ||
        content.includes('날씨') ||
        content.includes('비 오는 날') ||
        content.includes('폭설') ||
        content.includes('폭염') ||
        content.includes('한파')
      ) {
        reply = currentWeather.botAnswer
      } else {
        reply = assistantResponses[text] ?? assistantResponses[`✨ ${text}`] ?? buildReviewSummaryResponse(freshReviews)
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      setTyping(false)
    }, 600)
  }

  const [fabPos, setFabPos] = useState<Point | null>(() => {
    if (typeof window !== 'undefined') {
      return { x: window.innerWidth - FAB_SIZE - 24, y: window.innerHeight - FAB_SIZE - 24 }
    }
    return null
  })

  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null)
  const suppressClickRef = useRef(false)

  useEffect(() => {
    const onResize = () => setFabPos((p) => (p ? clampToViewport(p) : { x: window.innerWidth - FAB_SIZE - 24, y: window.innerHeight - FAB_SIZE - 24 }))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: rect.left, originY: rect.top, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    if (!d.moved) {
      d.moved = true
      setDragging(true)
    }
    setFabPos(clampToViewport({ x: d.originX + dx, y: d.originY + dy }))
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragRef.current
    if (!d) return
    if (d.moved) suppressClickRef.current = true
    dragRef.current = null
    setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  function handleFabClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    setOpen((o) => !o)
  }

  function handleFabKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const delta = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key]
    if (!delta) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP
    setFabPos(clampToViewport({ x: rect.left + delta[0] * step, y: rect.top + delta[1] * step }))
  }

  const panelLayout = fabPos ? getPanelLayout(fabPos) : null
  const unansweredCount = currentReviews.filter((r) => !r.reply).length

  return (
    <>
      <div
        className={cn(
          'fixed z-50 w-[calc(100vw-2rem)] max-w-sm transition-[opacity,transform] duration-300 ease-out font-sans',
          !panelLayout && 'bottom-24 right-6 origin-bottom-right',
          open ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'
        )}
        style={panelLayout?.style}
        role="dialog"
        aria-label="LocalMate AI 업무 비서"
        aria-hidden={!open}
      >
        <div
          className="flex flex-col h-[min(600px,calc(100vh-8rem))] rounded-3xl border bg-card shadow-2xl overflow-hidden"
          style={panelLayout ? { height: panelLayout.height } : undefined}
        >
          {/* 헤더 (실시간 미답변 건수 뱃지) */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-primary text-primary-foreground">
            <div className="size-9 rounded-full bg-white/15 flex items-center justify-center">
              <Bot className="size-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">LocalMate AI 업무 비서</p>
              <p className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
                </span>
                온라인 · 실시간 분석 중
              </p>
            </div>
            <span
              className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium tabular-nums"
              aria-live="polite"
            >
              미답변 {unansweredCount}건
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="size-8 rounded-full hover:bg-white/15 flex items-center justify-center transition"
              aria-label="AI 비서 닫기"
              tabIndex={open ? 0 : -1}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* 대화 메시지 목록 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-background" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'assistant' && (
                  <div className="size-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border rounded-bl-md shadow-sm'
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="size-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                </div>
                <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3 flex gap-1" aria-label="AI가 답변을 작성 중입니다">
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* 하단 퀵 액션 칩 바 */}
          <div className="border-t bg-card p-2 flex items-center gap-1 relative shrink-0">
            <button
              type="button"
              onClick={() => scrollQuickActions('left')}
              className="size-7 rounded-full border bg-secondary flex items-center justify-center text-muted-foreground hover:bg-muted shrink-0 z-10 transition"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1 [scrollbar-width:none]"
            >
              {unifiedQuickActions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={typing}
                  tabIndex={open ? 0 : -1}
                  className="shrink-0 rounded-full border border-primary/20 bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-primary/15 disabled:opacity-50 transition whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollQuickActions('right')}
              className="size-7 rounded-full border bg-secondary flex items-center justify-center text-muted-foreground hover:bg-muted shrink-0 z-10 transition"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* 메시지 입력창 */}
          <div className="border-t bg-card p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-end gap-2"
            >
              <label htmlFor="assistant-input" className="sr-only">
                AI 비서에게 메시지 보내기
              </label>
              <textarea
                id="assistant-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    if (e.nativeEvent.isComposing || e.keyCode === 229) return
                    e.preventDefault()
                    send(input)
                  }
                }}
                rows={1}
                tabIndex={open ? 0 : -1}
                placeholder="무엇이든 물어보세요 (예: 이번 주 매출 요약해줘)"
                className="flex-1 resize-none max-h-28 rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                tabIndex={open ? 0 : -1}
                className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition shrink-0"
                aria-label="메시지 보내기"
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 우측 하단 플로팅 FAB 버튼 */}
      <button
        type="button"
        onClick={handleFabClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleFabKeyDown}
        aria-expanded={open}
        aria-label={open ? 'AI 비서 닫기' : 'AI 비서 열기'}
        aria-description="드래그하거나 방향키로 위치를 옮길 수 있어요"
        title="드래그하여 위치 이동"
        style={fabPos ? { left: fabPos.x, top: fabPos.y } : undefined}
        className={cn(
          'fixed z-50 size-16 flex flex-col items-center justify-center gap-0.5 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 ring-4 ring-primary/15 touch-none select-none transition-[transform,background-color,box-shadow]',
          !fabPos && 'bottom-6 right-6',
          dragging
            ? 'cursor-grabbing scale-110 shadow-2xl shadow-primary/40'
            : 'cursor-grab hover:bg-primary/90 hover:scale-105 active:scale-95'
        )}
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Sparkles className="size-5" aria-hidden="true" />}
        <span className="text-[11px] font-semibold leading-none">AI 비서</span>
      </button>
    </>
  )
}

export default AiAssistant