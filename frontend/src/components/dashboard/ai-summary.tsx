'use client'

import { useEffect, useState } from 'react'
import { CloudRain, Sparkles, Flame, Snowflake } from 'lucide-react'
import { getCurrentWeatherScenario, type WeatherCondition } from '@/lib/weather-scenarios'

interface KeywordStat {
  rank: number
  label: string
  count: number
  percent: number
}

const COMPLAINT_KEYWORD_RULES = [
  { label: '대기시간 지연', keywords: ['늦', '지연', '대기', '시간', '안내'] },
  { label: '포장 누락', keywords: ['누락', '안 왔', '덜 왔', '빠져', '요청사항'] },
  { label: '음식 온도 (식음)', keywords: ['식어', '식음', '차갑', '온도', '미지근'] },
  { label: '양 대비 가격', keywords: ['비싸', '양적', '양 대비', '가성비', '적다'] },
  { label: '소스·포장 누수', keywords: ['새', '누수', '흘러', '뚜껑', '포장불만', '기름'] },
]

const getInitialStore = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

const computeComplaintKeywords = (storeId: string): KeywordStat[] => {
  if (typeof window === 'undefined') {
    return [
      { rank: 1, label: '대기시간 지연', count: 68, percent: 24 },
      { rank: 2, label: '포장 누락', count: 34, percent: 12 },
      { rank: 3, label: '음식 온도 (식음)', count: 25, percent: 9 },
      { rank: 4, label: '양 대비 가격', count: 20, percent: 7 },
      { rank: 5, label: '소스·포장 누수', count: 14, percent: 5 },
    ]
  }

  const saved = localStorage.getItem(`localmate_reviews_v12_${storeId}`)
  if (!saved) {
    return [
      { rank: 1, label: '대기시간 지연', count: 68, percent: 24 },
      { rank: 2, label: '포장 누락', count: 34, percent: 12 },
      { rank: 3, label: '음식 온도 (식음)', count: 25, percent: 9 },
      { rank: 4, label: '양 대비 가격', count: 20, percent: 7 },
      { rank: 5, label: '소스·포장 누수', count: 14, percent: 5 },
    ]
  }

  try {
    const list = JSON.parse(saved)
    if (!Array.isArray(list) || list.length === 0) {
      return [
        { rank: 1, label: '대기시간 지연', count: 68, percent: 24 },
        { rank: 2, label: '포장 누락', count: 34, percent: 12 },
        { rank: 3, label: '음식 온도 (식음)', count: 25, percent: 9 },
        { rank: 4, label: '양 대비 가격', count: 20, percent: 7 },
        { rank: 5, label: '소스·포장 누수', count: 14, percent: 5 },
      ]
    }

    const targetReviews = list.filter((r: any) => (Number(r.rating) || 5) <= 3)
    const totalReviewsCount = list.length

    const counts = COMPLAINT_KEYWORD_RULES.map((rule) => {
      let matchCount = 0
      targetReviews.forEach((r: any) => {
        const text = `${r.text || ''} ${(r.tags || []).join(' ')}`
        const isMatched = rule.keywords.some((kw) => text.includes(kw))
        if (isMatched) matchCount++
      })
      return {
        label: rule.label,
        count: matchCount,
      }
    })

    counts.sort((a, b) => b.count - a.count)

    return counts.map((item, index) => {
      const percent = totalReviewsCount > 0 ? Math.round((item.count / totalReviewsCount) * 100) : 0
      return {
        rank: index + 1,
        label: item.label,
        count: item.count,
        percent,
      }
    })
  } catch (e) {
    return [
      { rank: 1, label: '대기시간 지연', count: 68, percent: 24 },
      { rank: 2, label: '포장 누락', count: 34, percent: 12 },
      { rank: 3, label: '음식 온도 (식음)', count: 25, percent: 9 },
      { rank: 4, label: '양 대비 가격', count: 20, percent: 7 },
      { rank: 5, label: '소스·포장 누수', count: 14, percent: 5 },
    ]
  }
}

export function AiSummary() {
  const [storeId, setStoreId] = useState(getInitialStore)
  const [weatherInfo, setWeatherInfo] = useState<WeatherCondition>(() => getCurrentWeatherScenario(getInitialStore()))
  const [keywordStats, setKeywordStats] = useState<KeywordStat[]>(() => computeComplaintKeywords(getInitialStore()))

  const refreshAll = (currentStore: string) => {
    setStoreId(currentStore)
    const baseScenario = getCurrentWeatherScenario(currentStore)
    setWeatherInfo(baseScenario)
    setKeywordStats(computeComplaintKeywords(currentStore))
  }

  useEffect(() => {
    const cur = localStorage.getItem('localmate_store_id') || 'cafe'
    refreshAll(cur)

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const target = customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      refreshAll(target)
    }

    const handleReviewsSync = () => {
      const target = localStorage.getItem('localmate_store_id') || 'cafe'
      setKeywordStats(computeComplaintKeywords(target))
    }

    const handleWeatherSync = () => {
      const target = localStorage.getItem('localmate_store_id') || 'cafe'
      refreshAll(target)
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('weatherChange', handleWeatherSync)
    window.addEventListener('reviewsUpdated', handleReviewsSync)
    window.addEventListener('settingsChange', handleStoreSync)
    window.addEventListener('storage', handleStoreSync)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('weatherChange', handleWeatherSync)
      window.removeEventListener('reviewsUpdated', handleReviewsSync)
      window.removeEventListener('settingsChange', handleStoreSync)
      window.removeEventListener('storage', handleStoreSync)
    }
  }, [])

  const isHeat = weatherInfo.weather === 'heat'
  const isRain = weatherInfo.weather === 'rain'

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* 실시간 날씨 맞춤 브리핑 박스 */}
      <div className={`rounded-2xl border p-4 shadow-sm ${
        isHeat 
          ? 'bg-amber-50/50 border-amber-200' 
          : isRain 
            ? 'bg-blue-50/50 border-blue-100' 
            : 'bg-sky-50/50 border-sky-100'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
            isHeat 
              ? 'bg-amber-500/10 text-amber-600' 
              : isRain 
                ? 'bg-blue-500/10 text-blue-600' 
                : 'bg-sky-500/10 text-sky-600'
          }`}>
            {isHeat && <Flame className="size-4" />}
            {isRain && <CloudRain className="size-4" />}
            {!isHeat && !isRain && <Snowflake className="size-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold ${
                isHeat ? 'text-amber-700' : isRain ? 'text-blue-700' : 'text-sky-700'
              }`}>
                실시간 날씨 맞춤 브리핑 ({weatherInfo.badgeText})
              </span>
              <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="mt-1 text-xs font-bold text-slate-900">
              {weatherInfo.conditionText}
            </p>
            <p className={`mt-1 text-xs leading-relaxed font-medium ${
              isHeat ? 'text-amber-800' : isRain ? 'text-blue-700' : 'text-sky-800'
            }`}>
              💡 {weatherInfo.actionAdvice}
            </p>
          </div>
        </div>
      </div>

      {/* AI 추출 주요 불만 키워드 박스 */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="font-semibold text-sm">AI 추출 주요 불만 키워드</h3>
          </div>
          <span className="text-xs text-muted-foreground">11월 불만·개선요청 분석</span>
        </div>

        <div className="space-y-3">
          {keywordStats.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>{item.rank}. {item.label}</span>
                <span className="text-rose-500 font-semibold">
                  {item.percent}% ({item.count}건)
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(item.percent > 0 ? item.percent : 4, item.count > 0 ? 8 : 0))}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AiSummary