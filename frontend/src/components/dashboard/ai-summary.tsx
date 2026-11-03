'use client'

import { useEffect, useState } from 'react'
import { CloudRain, Sparkles, AlertCircle } from 'lucide-react'
import { getCurrentWeatherScenario, type WeatherCondition } from '@/lib/weather-scenarios'

export function AiSummary() {
  const [storeId, setStoreId] = useState('cafe')
  const [weatherInfo, setWeatherInfo] = useState<WeatherCondition>(() => getCurrentWeatherScenario('cafe'))

  useEffect(() => {
    const updateWeather = () => {
      const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
      setStoreId(currentStore)
      setWeatherInfo(getCurrentWeatherScenario(currentStore))
    }

    updateWeather()

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setStoreId(customEvent.detail)
        setWeatherInfo(getCurrentWeatherScenario(customEvent.detail))
      }
    }

    const handleSettingsSync = () => {
      updateWeather()
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('settingsChange', handleSettingsSync)
    const timer = setInterval(updateWeather, 60 * 1000)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('settingsChange', handleSettingsSync)
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* 🎯 실시간 날씨 맞춤 브리핑 박스 */}
      <div className="rounded-2xl border bg-blue-50/50 border-blue-100 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <CloudRain className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-blue-700">실시간 날씨 맞춤 브리핑</span>
              <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1 text-xs font-medium text-slate-800">
              {weatherInfo.conditionText}
            </p>
            <p className="mt-1 text-xs text-blue-600 leading-relaxed font-medium">
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
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>1. 대기시간 지연</span>
              <span className="text-rose-500 font-semibold">24% (68건)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-[24%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>2. 포장 누락</span>
              <span className="text-rose-500 font-semibold">12% (34건)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-[12%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>3. 음식 온도 (식음)</span>
              <span className="text-rose-500 font-semibold">9% (25건)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-[9%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>4. 양 대비 가격</span>
              <span className="text-rose-500 font-semibold">7% (20건)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-[7%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>5. 소스 누수</span>
              <span className="text-rose-500 font-semibold">5% (14건)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-[5%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}