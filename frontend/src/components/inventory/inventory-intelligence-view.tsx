'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Sparkles, 
  CheckCircle2, 
  TrendingDown, 
  Boxes, 
  Plus, 
  ShieldAlert, 
  Flame, 
  Pencil, 
  Check, 
  X, 
  RotateCcw 
} from 'lucide-react'
import { 
  getStoreIngredients, 
  updateIngredientStock, 
  updateIngredientCost,
  resetIngredientsToDefault,
  type IngredientAnalysisItem 
} from '@/lib/recipe-data'

export function InventoryIntelligenceView() {
  const [storeId, setStoreId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('localmate_store_id') || 'cafe'
    }
    return 'cafe'
  })

  const [ingredients, setIngredients] = useState<IngredientAnalysisItem[]>(() => getStoreIngredients('cafe'))
  const [filterType, setFilterType] = useState<'all' | 'warning' | 'danger'>('all')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCost, setEditingCost] = useState<string>('')

  const isChicken = storeId.includes('치킨') || storeId.includes('chicken')

  const refreshData = useCallback((sId: string) => {
    const list = getStoreIngredients(sId)
    setIngredients(list)
  }, [])

  useEffect(() => {
    const cur = localStorage.getItem('localmate_store_id') || 'cafe'
    setStoreId(cur)
    refreshData(cur)

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<any>
      const nextStore = customEvent.detail?.storeId || customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      if (typeof nextStore === 'string') {
        setStoreId(nextStore)
        setEditingId(null)
        refreshData(nextStore)
      }
    }

    const handleLiveIngredientSync = () => {
      const current = localStorage.getItem('localmate_store_id') || 'cafe'
      refreshData(current)
    }

    window.addEventListener('storeChange', handleSync)
    window.addEventListener('ingredientUpdated', handleLiveIngredientSync)
    window.addEventListener('storage', handleLiveIngredientSync)

    return () => {
      window.removeEventListener('storeChange', handleSync)
      window.removeEventListener('ingredientUpdated', handleLiveIngredientSync)
      window.removeEventListener('storage', handleLiveIngredientSync)
    }
  }, [refreshData])

  const totalStockValue = ingredients.reduce((acc, cur) => acc + cur.totalValue, 0)
  const totalExpectedLoss = ingredients.reduce((acc, cur) => acc + cur.expectedLoss, 0)
  const lowStockCount = ingredients.filter(i => i.isLowStock).length
  const urgentExpiryCount = ingredients.filter(i => i.expiryStatus === 'danger').length

  const handleAutoReorderAll = () => {
    const needOrder = ingredients.filter(i => i.isLowStock)
    if (needOrder.length === 0) {
      alert('현재 안전재고에 미달된 품목이 없습니다.')
      return
    }

    needOrder.forEach(item => {
      updateIngredientStock(storeId, item.id, item.recommendedOrder)
    })
    alert(`발주 필요 품목 ${needOrder.length}종의 적정 권장량이 즉시 입고 처리되었습니다!`)
  }

  const handleAddStock = (item: IngredientAnalysisItem) => {
    const amount = item.unit === 'g' || item.unit === 'ml' ? 1000 : 10
    updateIngredientStock(storeId, item.id, amount)
  }

  const handleSaveCost = (item: IngredientAnalysisItem) => {
    const parsed = parseFloat(editingCost)
    if (isNaN(parsed) || parsed <= 0) {
      alert('올바른 단가를 입력해주세요.')
      return
    }

    updateIngredientCost(storeId, item.id, parsed)
    setEditingId(null)
    setEditingCost('')
  }

  // 🎯 재고 및 단가 전체 초기화 핸들러
  const handleResetAll = () => {
    if (confirm('모든 식자재 보유 재고 수량과 구매 단가를 최초 표준 기본값으로 완벽 초기화하시겠습니까?')) {
      resetIngredientsToDefault(storeId)
      setEditingId(null)
    }
  }

  const filteredList = ingredients.filter(item => {
    if (filterType === 'danger') return item.expiryStatus === 'danger'
    if (filterType === 'warning') return item.isLowStock || item.expiryStatus !== 'safe'
    return true
  })

  const dangerItem = [...ingredients].sort((a, b) => b.expectedLoss - a.expectedLoss)[0]

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 font-sans">
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 space-y-6">
        
        {/* 상단 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">
                {isChicken ? '🍗 치킨 식자재 원가·폐기 손실 및 발주 관리' : '☕ 카페 식자재 원가·폐기 손실 및 발주 관리'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                FR-M03
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              메뉴 판매 시 레시피(BOM)에 따라 식자재가 자동 소진되며, 식자재 구매단가 수정 시 [메뉴 수익성 분석] 화면의 순이익이 실시간 갱신됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
              title="모든 식자재 재고 수량과 단가를 최초 기본값으로 복원합니다"
            >
              <RotateCcw className="size-3.5 text-slate-500" />
              <span>재고 및 단가 초기화</span>
            </button>
            <button
              type="button"
              onClick={handleAutoReorderAll}
              disabled={lowStockCount === 0}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
            >
              <ShoppingCart className="size-3.5" />
              <span>미달 품목 원클릭 AI 발주 ({lowStockCount}건)</span>
            </button>
          </div>
        </div>

        {/* 1. 상단 KPI 카드 4종 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">보유 식자재 총 평가액</span>
              <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {totalStockValue.toLocaleString()}원
              </span>
              <span className="text-xs text-slate-400">({ingredients.length}종 보유)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">D-2 이내 예상 폐기 손실액</span>
              <div className="size-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${totalExpectedLoss > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {totalExpectedLoss.toLocaleString()}원
              </span>
              <span className="text-xs font-bold text-rose-500">
                {urgentExpiryCount > 0 ? `${urgentExpiryCount}종 임박` : '위험 없음'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">안전재고 미달 품목</span>
              <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingDown className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {lowStockCount}개 품목
              </span>
              <span className="text-xs text-slate-400">/ {ingredients.length}개</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">BOM 실시간 연동</span>
              <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-emerald-600">
                주문 소진 가동 중
              </span>
              <span className="text-[10px] text-slate-400">POS 동기화</span>
            </div>
          </div>
        </div>

        {/* 2. AI 폐기 방어 전략 및 필터링 탭 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-linear-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100 p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-indigo-950">AI 식자재 폐기 방어 & 발주 최적화 제안</h3>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                  BOM 레시피 기반
                </span>
              </div>

              <div className="p-4 bg-white/90 rounded-xl border border-indigo-100/60 text-xs leading-relaxed text-slate-700 space-y-2.5">
                {dangerItem && dangerItem.expiryStatus === 'danger' ? (
                  <>
                    <p className="flex items-center gap-1.5 font-bold text-rose-700">
                      <Flame className="size-4 text-rose-600 shrink-0" />
                      긴급 소진 권장: '{dangerItem.name}'의 유통기한이 {dangerItem.expiryDays}일 남았습니다!
                    </p>
                    <p>
                      현재 재고 <strong>{dangerItem.currentStock.toLocaleString()}{dangerItem.unit}</strong>가 유통기한 내에 모두 판매되지 않으면 약 <strong className="text-rose-600">{dangerItem.expectedLoss.toLocaleString()}원</strong>의 폐기 손실이 발생합니다.
                    </p>
                    <p className="text-indigo-800 font-semibold bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                      💡 <strong>AI 액션 플랜:</strong> {isChicken ? (
                        <>오늘 저녁 배달앱에 '{dangerItem.name}'을 사용하는 <strong>[황금 후라이드 + 치즈볼 세트]</strong> 타임세일 배너를 띄워 당일 전량 소진을 추천합니다.</>
                      ) : (
                        <>오후 나른한 시간대에 '{dangerItem.name}'을 사용하는 <strong>[아메리카노 + 버터 크로플 세트]</strong> 할인 프로모션을 진행하여 재고를 조기 소진하세요.</>
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-emerald-700 font-medium">
                    ✅ 현재 모든 식자재의 유통기한이 안정권에 있어 폐기 위험이 없습니다.
                  </p>
                )}

                {lowStockCount > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600">
                      ⚠️ 안전재고 미달 품목: <strong>{ingredients.filter(i => i.isLowStock).map(i => i.name).slice(0, 2).join(', ')}</strong> 등 {lowStockCount}종
                    </span>
                    <span className="text-indigo-600 font-bold text-[11px]">
                      상단 '원클릭 AI 발주'로 신속 충전 가능
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3">
              <span className="text-[11px] text-indigo-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3 text-indigo-600" />
                구매단가 수정 시 [메뉴 수익성] 건당 순이익 자동 갱신
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">식자재 상태별 필터</h3>
              <p className="text-xs text-slate-400">주의 및 위험 품목을 우선 정렬합니다</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`w-full p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  filterType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>전체 보유 식자재</span>
                <span className="text-[11px] opacity-80">{ingredients.length}종</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('danger')}
                className={`w-full p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  filterType === 'danger' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <span className="flex items-center gap-1">
                  <ShieldAlert className="size-3.5" /> D-2 유통기한 임박
                </span>
                <span className="text-[11px] font-extrabold">{urgentExpiryCount}종</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('warning')}
                className={`w-full p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  filterType === 'warning' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <span className="flex items-center gap-1">
                  <TrendingDown className="size-3.5" /> 안전재고 미달 품목
                </span>
                <span className="text-[11px] font-extrabold">{lowStockCount}종</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
              💡 주문 1건이 발생할 때마다 해당 레시피에 등록된 식자재 수량이 실시간으로 차감됩니다.
            </div>
          </div>
        </div>

        {/* 3. 식자재 재고 및 유통기한 명세 테이블 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="size-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">식자재 보유 현황 및 유통기한 명세표</h3>
            </div>
            <span className="text-xs text-slate-400">단위당 구매 단가 수정 시 메뉴 마진율 즉시 반영</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">식자재명</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">카테고리</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">현재 재고</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">안전 재고</th>
                  <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">유통기한 잔여</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">구매 단가 (원)</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">재고 평가액</th>
                  <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">발주 상태</th>
                  <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">입고 관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{item.category}</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {item.currentStock.toLocaleString()}{item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500 whitespace-nowrap">
                      {item.safetyStock.toLocaleString()}{item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {item.expiryStatus === 'danger' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                          D-{item.expiryDays} (폐기 임박)
                        </span>
                      )}
                      {item.expiryStatus === 'warning' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          D-{item.expiryDays} (주의)
                        </span>
                      )}
                      {item.expiryStatus === 'safe' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          D-{item.expiryDays} (정상)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="any"
                            value={editingCost}
                            onChange={(e) => setEditingCost(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveCost(item)
                            }}
                            className="w-20 px-1.5 py-0.5 border border-indigo-500 rounded text-right font-bold text-xs"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveCost(item)}
                            className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            <Check className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 group">
                          <span className="text-slate-800 font-semibold">
                            {item.costPerUnit.toLocaleString()}원/{item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id)
                              setEditingCost(item.costPerUnit.toString())
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 transition"
                            title="구매 단가 수정 (메뉴 순이익에 실시간 반영)"
                          >
                            <Pencil className="size-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {item.totalValue.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {item.isLowStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          +{item.recommendedOrder.toLocaleString()}{item.unit} 필요
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold">충분</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleAddStock(item)}
                        className="px-2 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center gap-0.5 mx-auto shadow-2xs"
                        title="기본 수량 입고 보충"
                      >
                        <Plus className="size-3" />
                        <span>입고</span>
                      </button>
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

export default InventoryIntelligenceView