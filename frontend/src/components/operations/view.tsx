'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { RotateCcw, Activity } from 'lucide-react'

type ChartData = { time: string; sales: number; hour: number }
type TopMenuItem = { name: string; count: number }

const DEFAULT_HOURLY_DATA = {
  cafe: [
    { time: '10:00', sales: 15000, hour: 10 },
    { time: '11:00', sales: 45000, hour: 11 },
    { time: '12:00', sales: 120000, hour: 12 },
    { time: '13:00', sales: 95000, hour: 13 },
    { time: '14:00', sales: 50000, hour: 14 },
    { time: '15:00', sales: 30000, hour: 15 },
    { time: '16:00', sales: 25000, hour: 16 },
    { time: '17:00', sales: 40000, hour: 17 },
    { time: '18:00', sales: 60000, hour: 18 },
    { time: '19:00', sales: 85000, hour: 19 },
    { time: '20:00', sales: 55000, hour: 20 },
    { time: '21:00', sales: 20000, hour: 21 },
  ],
  chicken: [
    { time: '12:00', sales: 30000, hour: 12 },
    { time: '13:00', sales: 25000, hour: 13 },
    { time: '14:00', sales: 20000, hour: 14 },
    { time: '15:00', sales: 25000, hour: 15 },
    { time: '16:00', sales: 40000, hour: 16 },
    { time: '17:00', sales: 85000, hour: 17 },
    { time: '18:00', sales: 150000, hour: 18 },
    { time: '19:00', sales: 210000, hour: 19 },
    { time: '20:00', sales: 180000, hour: 20 },
    { time: '21:00', sales: 130000, hour: 21 },
    { time: '22:00', sales: 95000, hour: 22 },
    { time: '23:00', sales: 60000, hour: 23 },
  ]
}

const DEFAULT_TOP_MENUS = {
  cafe: [
    { name: '아메리카노 (ICED)', count: 128 },
    { name: '카페라떼 (ICED)', count: 96 },
    { name: '버터 크로플 세트', count: 84 },
    { name: '바닐라빈 라떼', count: 72 },
    { name: '생딸기 바스크 케이크', count: 64 },
  ],
  chicken: [
    { name: '황금 후라이드 치킨', count: 150 },
    { name: '매콤달콤 양념 치킨', count: 132 },
    { name: '단짠 갈릭 간장 치킨', count: 110 },
    { name: '특제 모짜 치즈볼', count: 95 },
    { name: '바삭 순살 파닭', count: 88 },
  ]
}

const getInitialStoreId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

// 🎯 저장된 시간대별 매출 로드 (없으면 기본값 생성 후 저장)
const loadHourlyData = (storeId: string): ChartData[] => {
  const isChicken = storeId === 'chicken'
  const defaults = isChicken ? DEFAULT_HOURLY_DATA.chicken : DEFAULT_HOURLY_DATA.cafe
  if (typeof window === 'undefined') return defaults

  const saved = localStorage.getItem(`localmate_hourly_sales_${storeId}`)
  if (saved) {
    try { 
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch (e) {}
  }
  const cloned = JSON.parse(JSON.stringify(defaults))
  localStorage.setItem(`localmate_hourly_sales_${storeId}`, JSON.stringify(cloned))
  return cloned
}

// 🎯 저장된 인기 메뉴 TOP 5 로드
const loadTopMenus = (storeId: string): TopMenuItem[] => {
  const isChicken = storeId === 'chicken'
  const defaults = isChicken ? DEFAULT_TOP_MENUS.chicken : DEFAULT_TOP_MENUS.cafe
  if (typeof window === 'undefined') return defaults

  const saved = localStorage.getItem(`localmate_top_menus_${storeId}`)
  if (saved) {
    try { 
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch (e) {}
  }
  const cloned = JSON.parse(JSON.stringify(defaults))
  localStorage.setItem(`localmate_top_menus_${storeId}`, JSON.stringify(cloned))
  return cloned
}

export function OperationsView() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(getInitialStoreId)
  const [chartData, setChartData] = useState<ChartData[]>(() => loadHourlyData(getInitialStoreId()))
  const [topMenus, setTopMenus] = useState<TopMenuItem[]>(() => loadTopMenus(getInitialStoreId()))
  const [liveStreamAlert, setLiveStreamAlert] = useState<string | null>(null)

  const syncStore = (storeId: string) => {
    setSelectedStoreId(storeId)
    setChartData(loadHourlyData(storeId))
    setTopMenus(loadTopMenus(storeId))
  }

  useEffect(() => {
    const cur = localStorage.getItem('localmate_store_id') || 'cafe'
    syncStore(cur)

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        syncStore(customEvent.detail)
      }
    }

    // 🎯 실시간 주문 이벤트 수신 시 데이터 갱신
    const handleSalesUpdated = (e: Event) => {
      const curStore = localStorage.getItem('localmate_store_id') || 'cafe'
      setChartData([...loadHourlyData(curStore)])
      setTopMenus([...loadTopMenus(curStore)])

      const customEvent = e as CustomEvent<any>
      if (customEvent.detail && customEvent.detail.menuName) {
        const { menuName, amount } = customEvent.detail
        setLiveStreamAlert(`⚡ [실시간 POS 연동] '${menuName}' 주문(+${Number(amount).toLocaleString()}원)이 시간대별 차트와 인기 순위에 즉시 누적되었습니다.`)
        setTimeout(() => setLiveStreamAlert(null), 3500)
      }
    }

    const handleSalesReset = () => {
      const curStore = localStorage.getItem('localmate_store_id') || 'cafe'
      syncStore(curStore)
      setLiveStreamAlert('통계 데이터가 기본값으로 초기화되었습니다.')
      setTimeout(() => setLiveStreamAlert(null), 2500)
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('localmate_sales_updated', handleSalesUpdated)
    window.addEventListener('localmate_sales_reset', handleSalesReset)
    window.addEventListener('storage', handleSalesUpdated)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('localmate_sales_updated', handleSalesUpdated)
      window.removeEventListener('localmate_sales_reset', handleSalesReset)
      window.removeEventListener('storage', handleSalesUpdated)
    }
  }, [])

  const handleResetData = () => {
    if (confirm('현재 매장의 시간대별 매출 및 판매 통계를 기본값으로 초기화하시겠습니까?')) {
      const defaultH = selectedStoreId === 'chicken' ? DEFAULT_HOURLY_DATA.chicken : DEFAULT_HOURLY_DATA.cafe
      const defaultM = selectedStoreId === 'chicken' ? DEFAULT_TOP_MENUS.chicken : DEFAULT_TOP_MENUS.cafe
      
      localStorage.removeItem(`localmate_hourly_sales_${selectedStoreId}`)
      localStorage.removeItem(`localmate_top_menus_${selectedStoreId}`)
      localStorage.removeItem(`localmate_today_sales_${selectedStoreId}`)
      localStorage.removeItem(`localmate_month_sales_${selectedStoreId}`)

      setChartData(JSON.parse(JSON.stringify(defaultH)))
      setTopMenus(JSON.parse(JSON.stringify(defaultM)))

      window.dispatchEvent(new CustomEvent('localmate_sales_reset', { detail: selectedStoreId }))
      window.dispatchEvent(new CustomEvent('localmate_sales_updated', { detail: { storeId: selectedStoreId } }))

      setLiveStreamAlert('통계 데이터가 기본값으로 복원되었습니다.')
      setTimeout(() => setLiveStreamAlert(null), 2500)
    }
  }

  const isCafe = selectedStoreId === 'cafe'
  const modeText = isCafe ? '카페 모드' : '치킨 모드'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-xl text-xs font-sans">
          <p className="font-bold text-slate-800">{label}</p>
          <p className="text-indigo-600 font-semibold mt-1">
            매출: {Number(payload[0].value).toLocaleString()}원
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-28 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">매장 운영 분석</h1>
          <p className="text-sm text-slate-500 mt-1">배달앱 및 POS와 실시간 연동된 오늘의 매출·판매 추이를 확인하세요.</p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>POS / 배달앱 실시간 자동 집계 활성화됨</span>
        </div>
      </div>

      {liveStreamAlert && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 flex items-center gap-2 animate-in fade-in">
          <Activity className="size-4 text-indigo-600 animate-spin" />
          <span>{liveStreamAlert}</span>
        </div>
      )}

      {/* 시간대별 매출 추이 영역 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">오늘의 시간대별 매출 추이</h2>
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs px-2 py-0.5 rounded-md font-semibold">
                실시간 연동 중
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isCafe ? '12~14시 점심 피크 강조' : '18~21시 저녁 피크 강조'} ({modeText})
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleResetData}
              className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RotateCcw className="size-3.5" /> 통계 리셋
            </button>
            
            <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#4f46e5]"></span>
                <span>집중 피크 시간</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#c7d2fe]"></span>
                <span>일반 운영 시간</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                tickFormatter={(value) => `${Number(value).toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => {
                  const isPeak = isCafe 
                    ? (entry.hour >= 12 && entry.hour <= 14) 
                    : (entry.hour >= 18 && entry.hour <= 21)
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isPeak ? '#4f46e5' : '#c7d2fe'}
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 인기 메뉴 TOP 5 영역 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">오늘의 인기 메뉴 TOP 5</h2>
            <p className="text-xs text-slate-500 mt-0.5">실시간 주문 판매량 기준 ({modeText})</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">자동 순위 갱신</span>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="flex justify-between py-2.5 text-xs font-semibold text-slate-400">
            <span>메뉴명</span>
            <span>판매량</span>
          </div>
          {topMenus.map((item, idx) => (
            <div key={idx} className="flex justify-between py-3 text-sm text-slate-700">
              <span className="font-medium flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span> 
                <span className="text-slate-800 font-semibold">{item.name}</span>
              </span>
              <span className="font-bold text-slate-900">{item.count}회</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OperationsView