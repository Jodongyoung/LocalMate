'use client'

import { useEffect, useState } from 'react'
import { CloudRain, Sparkles, Flame } from 'lucide-react'
import { getCurrentWeatherScenario, type WeatherCondition } from '@/lib/weather-scenarios'

const parseRegionName = (address: string): string => {
  if (!address || address.trim() === '') return '우리동네'
  const tokens = address.trim().split(/\s+/)
  if (tokens.length >= 2) {
    const city = tokens[0].replace(/(특별시|광역시|특별자치시)/, '')
    const district = tokens[1]
    return `${city} ${district}`
  }
  return tokens[0]
}

const getInitialStore = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

export function AiSummary() {
  const [storeId, setStoreId] = useState(getInitialStore)
  const [weatherInfo, setWeatherInfo] = useState<WeatherCondition>(() => getCurrentWeatherScenario(getInitialStore()))
  
  const [dynamicDisplay, setDynamicDisplay] = useState(() => {
    const initialStore = getInitialStore()
    const baseScenario = getCurrentWeatherScenario(initialStore)
    const savedSettings = typeof window !== 'undefined' ? localStorage.getItem(`localmate_settings_${initialStore}`) : null
    let address = initialStore === 'cafe' ? '대구광역시 중구 동성로 123' : '부산광역시 남구 대연동 45'
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (parsed.address) address = parsed.address
      } catch (e) {}
    }
    const region = parseRegionName(address)
    const isHeatwave = baseScenario.badgeText.includes('폭염') || initialStore === 'chicken'
    return {
      region,
      conditionText: isHeatwave ? `${region} 기온 34℃ 폭염 경보 발령` : `${region} 잔잔한 비 (강수 확률 70%)`,
      actionAdvice: isHeatwave 
        ? '무더운 날씨로 시원한 생맥주와 야식 배달 주문이 급증합니다. 냉장고 재고를 확보하세요.' 
        : '매장 내 체류 시간이 길어집니다. 따뜻한 드립 커피와 디저트 세트를 추천하세요.',
      isHeatwave
    }
  })

  const updateWeather = () => {
    const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
    setStoreId(currentStore)
    
    const baseScenario = getCurrentWeatherScenario(currentStore)
    setWeatherInfo(baseScenario)

    const savedSettings = localStorage.getItem(`localmate_settings_${currentStore}`)
    let address = currentStore === 'cafe' ? '대구광역시 중구 동성로 123' : '부산광역시 남구 대연동 45'
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (parsed.address) address = parsed.address
      } catch (e) {}
    }

    const region = parseRegionName(address)
    const isHeatwave = baseScenario.badgeText.includes('폭염') || currentStore === 'chicken'

    if (isHeatwave) {
      setDynamicDisplay({
        region,
        conditionText: `${region} 기온 34℃ 폭염 경보 발령`,
        actionAdvice: '무더운 날씨로 시원한 생맥주와 야식 배달 주문이 급증합니다. 냉장고 재고를 확보하세요.',
        isHeatwave: true
      })
    } else {
      setDynamicDisplay({
        region,
        conditionText: `${region} 잔잔한 비 (강수 확률 70%)`,
        actionAdvice: '매장 내 체류 시간이 길어집니다. 따뜻한 드립 커피와 디저트 세트를 추천하세요.',
        isHeatwave: false
      })
    }
  }

  useEffect(() => {
    updateWeather()

    const handleSync = () => {
      updateWeather()
    }

    window.addEventListener('storeChange', handleSync)
    window.addEventListener('settingsChange', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      window.removeEventListener('storeChange', handleSync)
      window.removeEventListener('settingsChange', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 font-sans">
      <div className={`rounded-2xl border p-4 shadow-sm ${dynamicDisplay.isHeatwave ? 'bg-amber-50/50 border-amber-200' : 'bg-blue-50/50 border-blue-100'}`}>
        <div className="flex items-start gap-3">
          <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${dynamicDisplay.isHeatwave ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
            {dynamicDisplay.isHeatwave ? <Flame className="size-4" /> : <CloudRain className="size-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold ${dynamicDisplay.isHeatwave ? 'text-amber-700' : 'text-blue-700'}`}>실시간 날씨 맞춤 브리핑</span>
              <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="mt-1 text-xs font-bold text-slate-900">
              {dynamicDisplay.conditionText}
            </p>
            <p className={`mt-1 text-xs leading-relaxed font-medium ${dynamicDisplay.isHeatwave ? 'text-amber-800' : 'text-blue-700'}`}>
              💡 {dynamicDisplay.actionAdvice}
            </p>
          </div>
        </div>
      </div>

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

export default AiSummary