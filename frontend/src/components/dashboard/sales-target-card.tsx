'use client'

import { useState, useEffect, useCallback } from 'react'
import { Target, Pencil, Check, X } from 'lucide-react'

const BASE_FINANCIALS = {
  cafe: { target: 20000000, month: 15200000 },
  chicken: { target: 25000000, month: 18500000 }
}

const getInitialStoreId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

// 🎯 실시간 자릿수 콤마(,) 및 소수점(.) 포맷터
const formatWithCommas = (val: string | number): string => {
  if (val === undefined || val === null || val === '') return ''
  const str = val.toString().replace(/[^0-9.]/g, '')
  const parts = str.split('.')
  
  // 정수부 천 단위 콤마
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // 소수점 1개만 유지
  if (parts.length > 1) {
    return `${parts[0]}.${parts.slice(1).join('')}`
  }
  return parts[0]
}

export function SalesTargetCard() {
  const [storeId, setStoreId] = useState<string>(getInitialStoreId)
  const isChicken = storeId.includes('치킨') || storeId.includes('chicken')
  const storeKey = isChicken ? 'chicken' : 'cafe'

  const [targetSales, setTargetSales] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedTarget = localStorage.getItem(`localmate_target_sales_${storeKey}`)
      if (savedTarget) return Number(savedTarget)
    }
    return isChicken ? BASE_FINANCIALS.chicken.target : BASE_FINANCIALS.cafe.target
  })

  const [monthSales, setMonthSales] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedMonth = localStorage.getItem(`localmate_month_sales_${storeKey}`)
      if (savedMonth) return Number(savedMonth)
    }
    return isChicken ? BASE_FINANCIALS.chicken.month : BASE_FINANCIALS.cafe.month
  })

  // 🎯 목표 수정 모드 상태 (실시간 콤마/소수점 포맷팅 문자열 관리)
  const [isEditing, setIsEditing] = useState(false)
  const [displayInput, setDisplayInput] = useState<string>(() => formatWithCommas(targetSales))

  const loadFinancialData = useCallback((sId: string) => {
    const isChk = sId.includes('치킨') || sId.includes('chicken')
    const key = isChk ? 'chicken' : 'cafe'
    const defaultData = isChk ? BASE_FINANCIALS.chicken : BASE_FINANCIALS.cafe

    if (typeof window !== 'undefined') {
      const savedTarget = localStorage.getItem(`localmate_target_sales_${key}`)
      const savedMonth = localStorage.getItem(`localmate_month_sales_${key}`)

      const finalTarget = savedTarget ? Number(savedTarget) : defaultData.target
      const finalMonth = savedMonth ? Number(savedMonth) : defaultData.month

      setTargetSales(finalTarget)
      setDisplayInput(formatWithCommas(finalTarget))
      setMonthSales(finalMonth)
    }
  }, [])

  useEffect(() => {
    const cur = localStorage.getItem('localmate_store_id') || 'cafe'
    setStoreId(cur)
    loadFinancialData(cur)

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const next = customEvent.detail || localStorage.getItem('localmate_store_id') || 'cafe'
      setStoreId(next)
      setIsEditing(false)
      loadFinancialData(next)
    }

    const handleSalesSync = () => {
      const current = localStorage.getItem('localmate_store_id') || 'cafe'
      loadFinancialData(current)
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('localmate_sales_updated', handleSalesSync)
    window.addEventListener('localmate_sales_reset', handleSalesSync)
    window.addEventListener('storage', handleSalesSync)

    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('localmate_sales_updated', handleSalesSync)
      window.removeEventListener('localmate_sales_reset', handleSalesSync)
      window.removeEventListener('storage', handleSalesSync)
    }
  }, [loadFinancialData])

  // 🎯 입력할 때 실시간으로 천 단위 콤마와 소수점이 즉각 포맷팅되도록 처리
  const handleInputChange = (rawVal: string) => {
    const formatted = formatWithCommas(rawVal)
    setDisplayInput(formatted)
  }

  // 🎯 목표 금액 저장 핸들러
  const handleSaveTarget = () => {
    const parsed = parseFloat(displayInput.replace(/,/g, ''))
    if (isNaN(parsed) || parsed <= 0) {
      alert('올바른 목표 금액을 입력해주세요.')
      return
    }

    setTargetSales(parsed)
    setDisplayInput(formatWithCommas(parsed))
    setIsEditing(false)
    localStorage.setItem(`localmate_target_sales_${storeKey}`, parsed.toString())

    window.dispatchEvent(new CustomEvent('targetUpdated', { detail: { storeId: storeKey, target: parsed } }))
    window.dispatchEvent(new CustomEvent('settingsChange'))
    window.dispatchEvent(new Event('storage'))
  }

  const remaining = Math.max(0, targetSales - monthSales)
  const percentage = targetSales > 0 ? Math.min(100, Math.round((monthSales / targetSales) * 100)) : 0
  const remainingDays = 25
  const dailyRequired = Math.ceil(remaining / remainingDays)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      {/* 1. 상단 타이틀 & 목표 수정 버튼 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Target className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">11월 매출 목표</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              목표까지 <strong className="text-slate-600 font-semibold">{formatWithCommas(remaining)}원</strong> 남음
            </p>
          </div>
        </div>

        {/* 목표 수정 / 저장 버튼 영역 */}
        {isEditing ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSaveTarget}
              className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1 shadow-2xs"
            >
              <Check className="size-3" /> 저장
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setDisplayInput(formatWithCommas(targetSales))
              }}
              className="px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition flex items-center gap-0.5"
            >
              <X className="size-3" /> 취소
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDisplayInput(formatWithCommas(targetSales))
              setIsEditing(true)
            }}
            className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-50"
            title="목표 매출 금액을 수정합니다"
          >
            <Pencil className="size-3" /> 목표 수정
          </button>
        )}
      </div>

      {/* 2. 중간 누적 금액 & 목표 금액 인풋 */}
      <div className="mt-4">
        <div className="flex items-end justify-between mb-2 gap-2">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">현재 누적</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {formatWithCommas(monthSales)}원
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block mb-0.5">목표</span>
            {isEditing ? (
              <div className="flex items-center justify-end gap-1">
                <input
                  type="text"
                  value={displayInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTarget()
                  }}
                  placeholder="예: 100,000,000"
                  className="w-48 px-2.5 py-1 border border-indigo-500 rounded-lg text-right font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-indigo-50/30"
                  autoFocus
                />
                <span className="text-xs font-bold text-slate-600 shrink-0">원</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-slate-700">
                {formatWithCommas(targetSales)}원
              </span>
            )}
          </div>
        </div>

        {/* 3. 프로그레스 바 게이지 */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* 4. 하단 달성률 & 하루 평균 필요 금액 */}
        <div className="flex items-center justify-between text-xs mt-2 font-medium">
          <span className="font-bold text-indigo-600">{percentage}% 달성</span>
          <span className="text-slate-400">
            하루 평균 <strong className="text-slate-600 font-semibold">{formatWithCommas(dailyRequired)}원</strong> 필요
          </span>
        </div>
      </div>
    </div>
  )
}

export default SalesTargetCard