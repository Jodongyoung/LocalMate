'use client'

import { useState, useEffect } from 'react'
import { Target, Pencil } from 'lucide-react'

const BASE_TARGETS = {
  cafe: { target: 20000000, month: 15200000 },
  chicken: { target: 25000000, month: 18500000 }
}

const getInitialStore = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

const getMonthSales = (storeId: string) => {
  const isCafe = storeId === 'cafe'
  const base = isCafe ? BASE_TARGETS.cafe : BASE_TARGETS.chicken
  if (typeof window === 'undefined') return base

  const monthSaved = localStorage.getItem(`localmate_month_sales_${storeId}`)
  return {
    target: base.target,
    month: monthSaved ? Number(monthSaved) : base.month
  }
}

export function SalesTargetCard() {
  const [storeId, setStoreId] = useState(getInitialStore)
  const [salesInfo, setSalesInfo] = useState(() => getMonthSales(getInitialStore()))

  const refreshSales = (currentStore: string) => {
    setStoreId(currentStore)
    setSalesInfo(getMonthSales(currentStore))
  }

  useEffect(() => {
    const cur = localStorage.getItem('localmate_store_id') || 'cafe'
    refreshSales(cur)

    const handleStore = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const target = customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      refreshSales(target)
    }

    const handleSales = () => {
      const curStore = localStorage.getItem('localmate_store_id') || 'cafe'
      refreshSales(curStore)
    }

    const handleSalesReset = () => {
      const curStore = localStorage.getItem('localmate_store_id') || 'cafe'
      refreshSales(curStore)
    }

    window.addEventListener('storeChange', handleStore)
    window.addEventListener('localmate_sales_updated', handleSales)
    window.addEventListener('localmate_sales_reset', handleSalesReset)
    window.addEventListener('storage', handleSales)

    return () => {
      window.removeEventListener('storeChange', handleStore)
      window.removeEventListener('localmate_sales_updated', handleSales)
      window.removeEventListener('localmate_sales_reset', handleSalesReset)
      window.removeEventListener('storage', handleSales)
    }
  }, [])

  const currentMonthSales = salesInfo.month
  const targetSales = salesInfo.target
  const diff = Math.max(0, targetSales - currentMonthSales)
  const percentage = Math.min(100, Math.round((currentMonthSales / targetSales) * 100))

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">11월 매출 목표</h3>
            <p className="text-[11px] text-slate-400">목표까지 {diff.toLocaleString()}원 남음</p>
          </div>
        </div>
        <button type="button" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <Pencil className="size-3" /> 목표 수정
        </button>
      </div>

      <div className="my-3">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-slate-500 font-medium">현재 누적</span>
          <span className="text-xs text-slate-400 font-medium">목표 {targetSales.toLocaleString()}원</span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{currentMonthSales.toLocaleString()}원</p>
        
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-indigo-600 font-bold">{percentage}% 달성</span>
        <span className="text-slate-400">하루 평균 {Math.round(diff / 25).toLocaleString()}원 필요</span>
      </div>
    </div>
  )
}

export default SalesTargetCard