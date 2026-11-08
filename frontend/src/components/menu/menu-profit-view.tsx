'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Boxes
} from 'lucide-react'
import { 
  getStoreProfitAnalysis, 
  ALL_MASTER_RECIPES, 
  ALL_MASTER_INGREDIENTS, 
  calculateMenuProfit, 
  type CalculatedMenuProfit 
} from '@/lib/recipe-data'

// 🍽️ 메뉴명/카테고리 기반 단위 자동 판별 헬퍼
function getMenuUnit(name: string, category: string): string {
  const text = `${name} ${category}`
  if (text.includes('커피') || text.includes('라떼') || text.includes('아메리카노') || text.includes('음료') || text.includes('티')) return '잔'
  if (text.includes('치킨') || text.includes('닭') || text.includes('마리')) return '마리'
  if (text.includes('케이크') || text.includes('조각')) return '조각'
  if (text.includes('세트') || text.includes('볼') || text.includes('봉')) return '세트'
  if (text.includes('병') || text.includes('콜라') || text.includes('맥주')) return '병'
  return '개'
}

const getInitialStoreId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

// 🎯 대시보드 실시간 오늘 매출 로드 헬퍼
const getInitialTodaySales = (sId: string): number => {
  const isChicken = sId.includes('치킨') || sId.includes('chicken')
  const key = isChicken ? 'chicken' : 'cafe'
  const baseToday = isChicken ? 1284000 : 980000

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`localmate_today_sales_${key}`)
    if (saved) return Number(saved)
  }
  return baseToday
}

export function MenuProfitView() {
  const [storeId, setStoreId] = useState<string>(getInitialStoreId)
  const [profitList, setProfitList] = useState<CalculatedMenuProfit[]>(() => getStoreProfitAnalysis(getInitialStoreId()))
  const [selectedMenuName, setSelectedMenuName] = useState<string>('')
  const [simulatedPrice, setSimulatedPrice] = useState<number>(0)
  const [todaySales, setTodaySales] = useState<number>(() => getInitialTodaySales(getInitialStoreId()))

  const isChicken = storeId.includes('치킨') || storeId.includes('chicken')
  const currentKey = isChicken ? 'chicken' : 'cafe'

  const refreshData = useCallback((sId: string) => {
    const list = getStoreProfitAnalysis(sId)
    setProfitList(list)
    setTodaySales(getInitialTodaySales(sId))
    if (list.length > 0) {
      const currentSelected = list.find(item => item.name === selectedMenuName) || list[0]
      setSelectedMenuName(currentSelected.name)
      setSimulatedPrice(currentSelected.price)
    }
  }, [selectedMenuName])

  useEffect(() => {
    const cur = localStorage.getItem('localmate_store_id') || 'cafe'
    setStoreId(cur)
    refreshData(cur)

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<any>
      const nextStore = customEvent.detail?.storeId || customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      if (typeof nextStore === 'string') {
        setStoreId(nextStore)
        refreshData(nextStore)
      }
    }

    const handleLiveSalesSync = (e: Event) => {
      const customEvent = e as CustomEvent<any>
      const current = localStorage.getItem('localmate_store_id') || 'cafe'
      if (customEvent.detail?.todaySales) {
        setTodaySales(Number(customEvent.detail.todaySales))
      } else {
        setTodaySales(getInitialTodaySales(current))
      }
      refreshData(current)
    }

    const handleSalesReset = () => {
      const current = localStorage.getItem('localmate_store_id') || 'cafe'
      setTodaySales(getInitialTodaySales(current))
      refreshData(current)
    }

    window.addEventListener('storeChange', handleSync)
    window.addEventListener('stockUpdated', handleLiveSalesSync)
    window.addEventListener('menuUpdated', handleLiveSalesSync)
    window.addEventListener('localmate_sales_updated', handleLiveSalesSync)
    window.addEventListener('localmate_sales_reset', handleSalesReset)
    window.addEventListener('storage', handleLiveSalesSync)

    return () => {
      window.removeEventListener('storeChange', handleSync)
      window.removeEventListener('stockUpdated', handleLiveSalesSync)
      window.removeEventListener('menuUpdated', handleLiveSalesSync)
      window.removeEventListener('localmate_sales_updated', handleLiveSalesSync)
      window.removeEventListener('localmate_sales_reset', handleSalesReset)
      window.removeEventListener('storage', handleLiveSalesSync)
    }
  }, [refreshData])

  // 🎯 1. 대시보드 매출과 연동된 당일 총 순수익 계산 (방향 A 적용)
  const totalSoldToday = profitList.reduce((acc, cur) => acc + cur.soldCount, 0)
  const avgMarginRate = profitList.length > 0
    ? Number((profitList.reduce((acc, cur) => acc + cur.marginRate, 0) / profitList.length).toFixed(1))
    : 0

  // A. 기본 매출에 해당하는 기본 순이익 (대시보드 시작 매출 × 평균 마진율)
  const baseToday = isChicken ? 1284000 : 980000
  const baseNetProfit = Math.round(baseToday * (avgMarginRate / 100))

  // B. 실시간 주문 및 판매 출고로 누적된 추가 순이익
  const posNetProfitToday = profitList.reduce((acc, cur) => acc + cur.totalNetProfit, 0)

  // C. 당일 누적 총 순수익 = 기본 매출 순이익 + 실시간 추가 출고 순이익
  const totalNetProfitToday = baseNetProfit + posNetProfitToday

  // 🎯 2. 동적 AI 추천용 메뉴 선별
  const topSoldMenu = profitList.length > 0
    ? [...profitList].sort((a, b) => b.soldCount - a.soldCount)[0]
    : null

  const highestNetProfitMenu = profitList.length > 0
    ? [...profitList].sort((a, b) => b.netProfit - a.netProfit)[0]
    : null

  const otherMenus = profitList.filter(m => m.name !== highestNetProfitMenu?.name)
  const pairingMenu = otherMenus.find(m => 
    m.category.includes('사이드') || m.category.includes('디저트') || m.marginRate >= 40
  ) || otherMenus[0] || null

  // 🎯 3. 가상 시뮬레이터 대상 메뉴 및 변화량 계산
  const activeMenu = profitList.find(m => m.name === selectedMenuName) || profitList[0]
  const matchedKnown = activeMenu 
    ? ALL_MASTER_RECIPES.find(km => km.name.trim() === activeMenu.name.trim())
    : undefined

  const simulatedResult = activeMenu
    ? calculateMenuProfit(
        activeMenu.name,
        activeMenu.category,
        activeMenu.price,
        matchedKnown,
        ALL_MASTER_INGREDIENTS,
        activeMenu.soldCount,
        simulatedPrice
      )
    : null

  const unitDiff = simulatedResult && activeMenu ? simulatedResult.netProfit - activeMenu.netProfit : 0
  const dailyTotalDiff = unitDiff * (activeMenu?.soldCount || 1)

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 font-sans">
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 space-y-6">
        
        {/* 상단 타이틀 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">
                {isChicken ? '🍗 치킨 매장 메뉴 수익성 분석 & 가격 시뮬레이터' : '☕ 카페 매장 메뉴 수익성 분석 & 가격 시뮬레이터'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                FR-M02
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              대시보드 실시간 매출 및 POS 출고량과 연동되어 당일 누적 순이익을 계산하고, 플랫폼 수수료(9.8%) 및 원가를 감안한 가격 변경 시뮬레이션을 제공합니다.
            </p>
          </div>

          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-600 font-medium">
              실시간 판매 출고 연동: <strong className="text-indigo-600 font-bold">{totalSoldToday}건 추가 출고</strong>
            </span>
          </div>
        </div>

        {/* 1. 상단 KPI 카드 3종 (대시보드 오늘 매출 기준 순수익 표출) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">당일 누적 총 순수익</span>
              <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600">
                {totalNetProfitToday.toLocaleString()}원
              </span>
              <span className="text-xs font-bold text-slate-500">
                (오늘 매출 {todaySales.toLocaleString()}원 대비)
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">전체 메뉴 평균 마진율</span>
              <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <PieChart className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{avgMarginRate}%</span>
              <span className="text-xs font-bold text-indigo-600">안정권 유지</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">순이익 기여 1위 효자 메뉴</span>
              <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900 truncate">
                {highestNetProfitMenu?.name || '집계 중'}
              </span>
              <span className="text-xs font-bold text-amber-600 shrink-0">
                {highestNetProfitMenu ? `${highestNetProfitMenu.marginRate}% 마진` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* 2. 인터랙티브 가격 시뮬레이터 & AI 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 가격 변경 시뮬레이터 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">가상 가격 변경 시뮬레이터</h3>
              </div>
              <span className="text-xs text-slate-400">판매량과 연동된 당일 총 순수익 변동을 예측합니다</span>
            </div>

            {/* 메뉴 선택 탭 */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {profitList.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setSelectedMenuName(m.name)
                    setSimulatedPrice(m.price)
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap ${
                    selectedMenuName === m.name
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* 가격 조절 슬라이더 */}
            {activeMenu && simulatedResult && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    '{activeMenu.name}' 판매가 조정
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-indigo-600">{simulatedPrice.toLocaleString()}원</span>
                    <span className="text-xs text-slate-400">(기존 {activeMenu.price.toLocaleString()}원)</span>
                  </div>
                </div>

                <input 
                  type="range"
                  min={Math.max(1000, activeMenu.price - 4000)}
                  max={activeMenu.price + 6000}
                  step={500}
                  value={simulatedPrice}
                  onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />

                {/* 판매량 연동 비교 결과 메트릭 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">식자재 원가</span>
                    <strong className="text-slate-800">{simulatedResult.ingredientCost.toLocaleString()}원</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">포장 + 플랫폼수수료(9.8%)</span>
                    <strong className="text-slate-800">{(simulatedResult.packageCost + simulatedResult.platformFee).toLocaleString()}원</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">건당 순이익</span>
                    <strong className="text-indigo-600 font-extrabold">{simulatedResult.netProfit.toLocaleString()}원</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      추가 출고({activeMenu.soldCount}건) 기준 변동
                    </span>
                    <strong className={`flex items-center font-extrabold ${dailyTotalDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {dailyTotalDiff >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {Math.abs(dailyTotalDiff).toLocaleString()}원
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 우측: 100% 동적 생성 AI 실시간 판매·수익 분석 솔루션 */}
          <div className="bg-linear-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-indigo-950">AI 실시간 판매·수익 분석</h3>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-indigo-100/60 text-xs leading-relaxed text-slate-700 space-y-2">
                <p>
                  📊 오늘 매장 총 매출은 <strong>{todaySales.toLocaleString()}원</strong>이며, 식자재 원가와 플랫폼 수수료를 차감한 당일 총 순수익은 <strong className="text-emerald-600">{totalNetProfitToday.toLocaleString()}원</strong>(평균 마진율 {avgMarginRate}%)으로 추정 집계되었습니다.
                </p>

                {topSoldMenu && (
                  <p>
                    🔥 실시간 출고 1위 품목은 <strong>{topSoldMenu.name}</strong>({topSoldMenu.soldCount > 0 ? `${topSoldMenu.soldCount}${getMenuUnit(topSoldMenu.name, topSoldMenu.category)} 출고 완료` : '판매 대기 중'})이며, 건당 순이익 <strong>{topSoldMenu.netProfit.toLocaleString()}원</strong>을 기록하고 있습니다.
                  </p>
                )}

                {highestNetProfitMenu && (
                  <p>
                    💡 등록 메뉴 중 건당 순이익이 가장 높은 효자 품목은 <strong>{highestNetProfitMenu.name}</strong>(건당 <strong>{highestNetProfitMenu.netProfit.toLocaleString()}원</strong>, 마진율 {highestNetProfitMenu.marginRate}%)입니다.
                  </p>
                )}

                <p className="text-indigo-700 font-semibold">
                  {pairingMenu ? (
                    <>👉 {topSoldMenu?.name} 단품 판매에 그치지 않고, 마진율이 {pairingMenu.marginRate}%인 <strong>[{topSoldMenu?.name} + {pairingMenu.name}]</strong> 결합 세트 구성을 배달앱 상단에 배치하여 주문당 객단가와 순이익을 동시 확보하세요.</>
                  ) : (
                    <>👉 {topSoldMenu?.name} 주문 시 사이드 옵션 선택을 추천하여 주문당 순이익을 극대화하세요.</>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-3">
              <span className="text-[11px] text-indigo-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3 text-indigo-600" />
                대시보드 매출 및 POS 출고량 동시 연동 완료
              </span>
            </div>
          </div>
        </div>

        {/* 3. 메뉴별 실제 판매량 & 누적 순익 세부 명세서 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="size-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">전체 메뉴 수익성 세부 명세서</h3>
            </div>
            <span className="text-xs text-slate-400">플랫폼 중개 수수료 9.8% 및 포장비 반영</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">메뉴명</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">카테고리</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">판매가</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">식자재 원가</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">포장+수수료</th>
                  <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">실시간 출고량</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">건당 순이익</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">출고 누적 순익</th>
                  <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">마진율</th>
                  <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">수익성 분류</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profitList.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{item.category}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-800 whitespace-nowrap">{item.price.toLocaleString()}원</td>
                    <td className="px-4 py-3.5 text-right text-slate-600 whitespace-nowrap">{item.ingredientCost.toLocaleString()}원</td>
                    <td className="px-4 py-3.5 text-right text-slate-500 whitespace-nowrap">{(item.packageCost + item.platformFee).toLocaleString()}원</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${item.soldCount > 0 ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}>
                        {item.soldCount}{getMenuUnit(item.name, item.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-indigo-600 whitespace-nowrap">{item.netProfit.toLocaleString()}원</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-emerald-600 whitespace-nowrap">{item.totalNetProfit.toLocaleString()}원</td>
                    <td className="px-4 py-3.5 text-center font-extrabold text-slate-900 whitespace-nowrap">{item.marginRate}%</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {item.profitRankType === 'high_profit' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          고마진 효자
                        </span>
                      )}
                      {item.profitRankType === 'volume_driver' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          판매량 주도
                        </span>
                      )}
                      {item.profitRankType === 'low_margin' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          마진 개선 필요
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}

export default MenuProfitView