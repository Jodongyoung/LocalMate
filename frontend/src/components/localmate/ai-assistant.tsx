'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { STORE_DASHBOARD_DATA, CAFE_REVIEWS, CHICKEN_REVIEWS, assistantResponses, quickActions, type Review, type SentimentTag } from '@/lib/mock-data'
import { getCurrentWeatherScenario, getSavedStoreLocation } from '@/lib/weather-scenarios'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'assistant'; content: string }

const BULK_DRAFT_ACTION = '✨ 리뷰 답글 일괄 초안'

type Point = { x: number; y: number }

const FAB_SIZE = 64
const EDGE_GAP = 24
const PANEL_GAP = 12
const PANEL_MAX_HEIGHT = 600
const DRAG_THRESHOLD = 5
const KEY_STEP = 24

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

const replyStrategies: [SentimentTag, string][] = [
  ['대기불만', '지연 사과 + 다음 주문 쿠폰 안내'],
  ['포장불만', '누락 사과 + 포장 재확인 약속'],
  ['맛불만', '맛 피드백 감사 + 레시피 점검 약속'],
  ['개선요청', '개선 제안 감사 + 반영 약속'],
]

function getReplyStrategy(review: Review) {
  return replyStrategies.find(([tag]) => review.tags.includes(tag))?.[1] ?? '감사 인사 + 재방문 유도'
}

function countTags(reviews: Review[]) {
  const counts = new Map<SentimentTag, number>()
  for (const r of reviews) for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts].map(([tag, n]) => `${tag} ${n}건`).join(', ')
}

function buildBulkDraftResponse(targets: Review[], totalCount: number) {
  if (targets.length === 0)
    return `모든 리뷰(${totalCount}건)에 이미 답글이 등록되어 있어요. 새로 작성할 초안이 없습니다. 훌륭해요, 사장님!`
  const lines = targets.map((r) => `• ${r.customerId}님 (★${r.rating}) — ${getReplyStrategy(r)}`).join('\n')
  const skipped = totalCount - targets.length
  const skippedNote = skipped > 0 ? `\n\n이미 답글이 등록된 ${skipped}건은 제외했어요.` : ''
  return `미답변 리뷰 ${targets.length}건에 대한 답글 초안을 준비했어요.\n\n${lines}${skippedNote}\n\n하단 "고객 리뷰 관리"에서 초안을 확인·수정한 뒤 저장하면 바로 등록돼요.`
}

function buildUnansweredSummary(reviews: Review[]) {
  const unanswered = reviews.filter((r) => !r.reply)
  if (unanswered.length === 0) return '현재 미답변 리뷰가 없어요. 모든 고객 리뷰에 답글이 등록되어 있습니다!'
  const tags = countTags(unanswered)
  return `현재 미답변 리뷰는 ${unanswered.length}건이에요${tags ? ` (${tags})` : ''}. 불만 리뷰는 24시간 내 답변 시 재주문율이 평균 2.3배 높아요. "리뷰 답글 일괄 초안"을 눌러보세요!`
}

export function AiAssistant({
  reviews: initialReviews,
  onGenerateAllDrafts,
}: {
  reviews: Review[]
  onGenerateAllDrafts: () => Review[]
}) {
  const [open, setOpen] = useState(false)
  const [storeId, setStoreId] = useState('cafe')
  const [currentReviews, setCurrentReviews] = useState<Review[]>(initialReviews)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const loadStoreReviews = (sId: string) => {
    const storageKey = `localmate_reviews_${sId}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        return JSON.parse(saved) as Review[]
      } catch (e) {}
    }
    return sId === 'cafe' ? CAFE_REVIEWS : CHICKEN_REVIEWS
  }

  // 🎯 설정된 주소에서 정확한 지역 지점명(예: "서울 강남점", "포항 북구점")을 가져와 인사말 생성
  const generateGreeting = (sId: string, revs: Review[]) => {
    const isChicken = sId.includes('치킨') || sId.includes('chicken')
    const storeKey = isChicken ? 'chicken' : 'cafe'
    const storeInfo = isChicken ? STORE_DASHBOARD_DATA.chicken : STORE_DASHBOARD_DATA.cafe
    
    const { branchName } = getSavedStoreLocation(storeKey)
    
    const unansweredCount = revs.filter(r => !r.reply).length
    const salesFormatted = new Intl.NumberFormat('ko-KR').format(storeInfo.kpis.todaySales)
    const delta = storeInfo.kpis.todayDelta

    let greeting = `사장님, 안녕하세요! LocalMate AI 업무 비서입니다. 오늘 ${branchName} 매출은 ${salesFormatted}원으로 어제보다 ${delta}% 높아요.`
    if (unansweredCount > 0) {
      greeting += ` 현재 확인이 필요한 미답변 리뷰가 ${unansweredCount}건 있어요.`
    } else {
      greeting += ` 모든 고객 리뷰에 답변이 완료되었습니다 완벽해요!`
    }
    greeting += ` 무엇을 도와드릴까요?`
    return greeting
  }

  useEffect(() => {
    const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
    setStoreId(savedStore)
    const revs = loadStoreReviews(savedStore)
    setCurrentReviews(revs)
    setMessages([{ role: 'assistant', content: generateGreeting(savedStore, revs) }])

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        const newStore = customEvent.detail
        setStoreId(newStore)
        const revs = loadStoreReviews(newStore)
        setCurrentReviews(revs)
        setMessages([{ role: 'assistant', content: generateGreeting(newStore, revs) }])
      }
    }

    const handleReviewSync = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      const revs = loadStoreReviews(currentStore)
      setCurrentReviews(revs)
      setMessages([{ role: 'assistant', content: generateGreeting(currentStore, revs) }])
    }

    // 🎯 설정 저장 시 지점명과 날씨 반영하여 인사말 즉각 갱신
    const handleSettingsSync = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      setStoreId(currentStore)
      const revs = loadStoreReviews(currentStore)
      setCurrentReviews(revs)
      setMessages([{ role: 'assistant', content: generateGreeting(currentStore, revs) }])
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('reviewsUpdated', handleReviewSync)
    window.addEventListener('settingsChange', handleSettingsSync)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('reviewsUpdated', handleReviewSync)
      window.removeEventListener('settingsChange', handleSettingsSync)
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

  const getMonthlyComplaintSummary = () => {
    const totalCount = currentReviews.length
    return `이번 달 총 ${totalCount}건의 리뷰 중 불만·개선요청 데이터를 분석했어요.\n\n1. 대기시간 지연 (24%) — 금·토 저녁 7~9시에 집중돼요.\n2. 포장 누락 (12%) — 음료·치즈볼 등 사이드 메뉴 누락이 대부분이에요.\n3. 음식 온도 (9%) — 대부분 배달 지연과 함께 발생했어요.\n\n💡 피크타임 조리 인력 1명 보강과 포장 체크리스트 도입을 추천드려요.`
  }

  const currentWeather = getCurrentWeatherScenario(storeId)

  const unifiedQuickActions = [
    currentWeather.quickChipText,
    '✨ 리뷰 답글 일괄 초안',
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

      if (content.includes('리뷰 답글 일괄 초안')) {
        reply = buildBulkDraftResponse(onGenerateAllDrafts(), currentReviews.length)
      } else if (content.includes('불만 요약')) {
        reply = getMonthlyComplaintSummary()
      } else if (
        content === cleanChipWeather ||
        content.includes('날씨') ||
        content.includes('비 오는 날') ||
        content.includes('폭설') ||
        content.includes('폭염') ||
        content.includes('한파')
      ) {
        reply = currentWeather.botAnswer
      } else if (content.includes('매출')) {
        const storeInfo = storeId === 'cafe' ? STORE_DASHBOARD_DATA.cafe : STORE_DASHBOARD_DATA.chicken
        reply = `현재 이번 달 누적 매출은 ${new Intl.NumberFormat('ko-KR').format(storeInfo.salesTarget.current)}원으로 목표 대비 ${storeInfo.salesTarget.percentage}% 달성했어요. 남은 기간 순항 중입니다!`
      } else if (content.includes('단골')) {
        reply = `3회 이상 재주문 고객 비율이 높으며 객단가 상승에 기여하고 있습니다.`
      } else {
        reply = assistantResponses[text] ?? assistantResponses[`✨ ${text}`] ?? buildUnansweredSummary(currentReviews)
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      setTyping(false)
    }, 1000)
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
          'fixed z-50 w-[calc(100vw-2rem)] max-w-sm transition-[opacity,transform] duration-300 ease-out',
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
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line',
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
                placeholder="무엇이든 물어보세요 (예: 이번 달 불만 요약)"
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