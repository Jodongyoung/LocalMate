'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Lightbulb, Sparkles, CloudRain } from 'lucide-react'
import { STORE_DASHBOARD_DATA } from '@/lib/mock-data'

const actions = [
  '금·토 19~21시 조리 인력 1명 추가 배치',
  '출고 전 사이드·음료 포장 체크리스트 도입',
  '배민 예상 배달시간 +10분 조정 (우천 시)',
]

export function AiSummary() {
  const [storeId, setStoreId] = useState('cafe')
  const [complaintData, setComplaintData] = useState(STORE_DASHBOARD_DATA.cafe.complaintKeywords)
  const [applied, setApplied] = useState<string[]>([])
  const [weather] = useState({
    text: '대구 지역 비 소식이 있어요 (강수 확률 80%)',
    icon: CloudRain,
    tip: '비 오는 날은 배달 주문이 평소보다 30% 이상 늘어납니다!'
  })

  // 🎯 사이드바에서 매장을 바꿀 때 발생하는 'storeChange' 이벤트를 즉각 감지하여 수치 갱신
  useEffect(() => {
    const updateStoreData = () => {
      const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
      setStoreId(savedStore)
      const data = STORE_DASHBOARD_DATA[savedStore as keyof typeof STORE_DASHBOARD_DATA] || STORE_DASHBOARD_DATA.cafe
      setComplaintData(data.complaintKeywords)
    }

    updateStoreData()

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        const newStore = customEvent.detail
        setStoreId(newStore)
        const data = STORE_DASHBOARD_DATA[newStore as keyof typeof STORE_DASHBOARD_DATA] || STORE_DASHBOARD_DATA.cafe
        setComplaintData(data.complaintKeywords)
      } else {
        updateStoreData()
      }
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('storage', updateStoreData)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('storage', updateStoreData)
    }
  }, [])

  const maxPercent = Math.max(...complaintData.map((k) => k.percent))
  const WeatherIcon = weather.icon
  const totalAnalyzedCount = storeId === 'cafe' ? 186 : 283

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm border-blue-100 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <WeatherIcon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1">
            <span>실시간 날씨 맞춤 브리핑</span>
            <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h3>
          <p className="text-xs font-medium text-slate-800 mt-0.5">{weather.text}</p>
          <p className="text-[11px] text-blue-700 mt-1 bg-white/60 px-2 py-0.5 rounded-md inline-block font-medium">
            💡 {weather.tip}
          </p>
        </div>
      </div>

      {/* 📊 사진 속 양식과 100% 일치하며 지점별로 수치가 다르게 렌더링되는 불만 키워드 카드 */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          <h2 className="font-semibold">AI 추출 주요 불만 키워드</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">11월 불만·개선요청 리뷰 {totalAnalyzedCount}건 분석</p>

        <ul className="mt-4 flex flex-col gap-3.5">
          {complaintData.map((k, i) => (
            <li key={k.keyword}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-muted-foreground w-4 tabular-nums">{i + 1}</span>
                  <span className="font-medium text-slate-900">{k.keyword}</span>
                </span>
                <span className="tabular-nums font-bold text-slate-900">
                  <span>{k.percent}%</span>
                  <span className="text-xs font-normal text-muted-foreground ml-1">({k.count}건)</span>
                </span>
              </div>
              <div className="mt-1.5 ml-6 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-400 transition-all duration-500"
                  style={{ width: `${(k.percent / maxPercent) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-primary text-primary-foreground p-5 shadow-sm flex-1">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4" aria-hidden="true" />
          <h2 className="font-semibold">AI 액션 추천</h2>
        </div>
        <p className="mt-2 text-sm text-primary-foreground/85 leading-relaxed text-pretty">
          대기시간 불만의 72%가 주말 저녁 피크타임에 집중돼요. 아래 조치로 불만 리뷰를 약 30% 줄일 수 있어요.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {actions.map((a) => {
            const done = applied.includes(a)
            return (
              <li key={a}>
                <button
                  type="button"
                  aria-pressed={done}
                  onClick={() =>
                    setApplied((prev) => (done ? prev.filter((x) => x !== a) : [...prev, a]))
                  }
                  className="w-full flex items-center gap-2.5 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2.5 text-left text-sm transition"
                >
                  <CheckCircle2
                    className={`size-4 shrink-0 ${done ? 'opacity-100' : 'opacity-40'}`}
                    aria-hidden="true"
                  />
                  <span className={done ? 'line-through opacity-70' : ''}>{a}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs text-primary-foreground/70">
          {applied.length}/{actions.length}개 실행 완료
        </p>
      </div>
    </div>
  )
}