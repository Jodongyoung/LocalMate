'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  PlusCircle, 
  ShieldAlert, 
  XCircle,
  ArrowRightCircle,
  UtensilsCrossed,
  Store,
  Flame,
  AlertOctagon
} from 'lucide-react'
import { TableItem, TableStatus } from '@/types/reservation'

// 1. 카페 본점 초기 테이블 데이터
const INITIAL_CAFE_TABLES: TableItem[] = [
  { id: 1, name: '1번 테라스', capacity: 2, status: 'occupied', currentOrder: '아메리카노 2잔' },
  { id: 2, name: '2번 창가석', capacity: 2, status: 'available' },
  { id: 3, name: '3번 창가석', capacity: 2, status: 'available' },
  { id: 4, name: '11번 홀석', capacity: 4, status: 'occupied', currentOrder: '시그니처 라떼 + 스콘' },
  { id: 5, name: '12번 홀석', capacity: 4, status: 'available' },
  { 
    id: 6, 
    name: '13번 홀석', 
    capacity: 4, 
    status: 'noshow_warning',
    reservation: {
      id: 'res-cafe-1',
      guestName: '박서준',
      guestCount: 3,
      reservedTime: '15:00',
      source: 'naver',
      phoneLastDigits: '8831',
      remainSeconds: 180,
      isWarning: true
    }
  },
  { id: 7, name: '21번 부스석', capacity: 4, status: 'available' },
  { id: 8, name: '22번 부스석', capacity: 4, status: 'occupied', currentOrder: '콜드브루 1병 + 휘낭시에' },
  { id: 9, name: '31번 파티션', capacity: 4, status: 'available' },
  { id: 10, name: '32번 파티션', capacity: 4, status: 'available' },
  { id: 11, name: '41번 단체룸', capacity: 6, status: 'available' },
  { id: 12, name: '42번 단체룸', capacity: 6, status: 'available' }
]

// 2. 치킨 지점 초기 테이블 데이터
const INITIAL_CHICKEN_TABLES: TableItem[] = [
  { id: 1, name: '1번 테라스', capacity: 2, status: 'occupied', currentOrder: '후라이드 반마리 + 생맥주 2잔' },
  { id: 2, name: '2번 창가석', capacity: 2, status: 'available' },
  { id: 3, name: '3번 창가석', capacity: 2, status: 'available' },
  { id: 4, name: '11번 홀석', capacity: 4, status: 'occupied', currentOrder: '반반치킨 + 치즈볼 세트' },
  { id: 5, name: '12번 홀석', capacity: 4, status: 'available' },
  { 
    id: 6, 
    name: '13번 홀석', 
    capacity: 4, 
    status: 'noshow_warning',
    reservation: {
      id: 'res-chicken-1',
      guestName: '박서준',
      guestCount: 3,
      reservedTime: '15:00',
      source: 'naver',
      phoneLastDigits: '8831',
      remainSeconds: 180,
      isWarning: true
    }
  },
  { id: 7, name: '21번 부스석', capacity: 4, status: 'available' },
  { id: 8, name: '22번 부스석', capacity: 4, status: 'occupied', currentOrder: '순살 간장치킨 + 제로콜라 2개' },
  { id: 9, name: '31번 파티션', capacity: 4, status: 'available' },
  { id: 10, name: '32번 파티션', capacity: 4, status: 'available' },
  { id: 11, name: '41번 단체룸', capacity: 6, status: 'available' },
  { id: 12, name: '42번 단체룸', capacity: 6, status: 'available' }
]

const CAFE_ORDERS = [
  '아메리카노 2잔 + 바스크 치즈케이크',
  '딸기 라떼 + 소금빵 2개',
  '시그니처 바닐라빈 라떼 2잔',
  '핸드드립 원두 2잔 + 휘낭시에 세트',
  '콜드브루 라떼 + 크로플'
]

const CHICKEN_ORDERS = [
  '황금 후라이드 한 마리 + 생맥주 500cc 2잔',
  '양념/간장 반반치킨 + 특제 치즈볼 4개',
  '매콤 순살치킨 + 콜라 1.25L',
  '오븐구이 치킨 + 케이준 감자튀김',
  '시그니처 통닭 세트 + 어묵탕'
]

// 🎯 Ypykue jepytéva (localStorage-gui ojagarra pya'e hag̃ua)
const getInitialStore = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

const getInitialTables = (storeId: string) => {
  const isCafe = storeId === 'cafe'
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`localmate_tables_${storeId}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
  }
  return isCafe ? INITIAL_CAFE_TABLES : INITIAL_CHICKEN_TABLES
}

export function ReservationsView() {
  const [storeId, setStoreId] = useState(getInitialStore)
  const [storeName, setStoreName] = useState(() => getInitialStore() === 'cafe' ? '동성로 카페 (본점)' : '수성 치킨 (지점)')
  const [tables, setTables] = useState<TableItem[]>(() => getInitialTables(getInitialStore()))
  const [noShowTimeoutMinutes, setNoShowTimeoutMinutes] = useState(15)
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null)
  const [waitingCount, setWaitingCount] = useState(0)
  const [actionLog, setActionLog] = useState<string[]>([
    '시스템 구동: 네이버 예약 자동 배정 엔진이 활성화되었습니다.'
  ])

  const loadStoreTables = (currentStore: string) => {
    setStoreId(currentStore)
    const isCafe = currentStore === 'cafe'
    setStoreName(isCafe ? '동성로 카페 (본점)' : '수성 치킨 (지점)')

    const saved = localStorage.getItem(`localmate_tables_${currentStore}`)
    if (saved) {
      try {
        setTables(JSON.parse(saved))
        return
      } catch (e) {}
    }
    setTables(isCafe ? INITIAL_CAFE_TABLES : INITIAL_CHICKEN_TABLES)
  }

  useEffect(() => {
    const currentStore = localStorage.getItem('localmate_store_id') || 'cafe'
    loadStoreTables(currentStore)

    const savedTimeout = localStorage.getItem('localmate_noshow_timeout')
    if (savedTimeout) setNoShowTimeoutMinutes(Number(savedTimeout))

    const handleStoreSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        loadStoreTables(customEvent.detail)
      }
    }

    window.addEventListener('storeChange', handleStoreSync)
    window.addEventListener('storage', handleStoreSync)
    return () => {
      window.removeEventListener('storeChange', handleStoreSync)
      window.removeEventListener('storage', handleStoreSync)
    }
  }, [])

  const saveTables = (newTables: TableItem[]) => {
    setTables(newTables)
    localStorage.setItem(`localmate_tables_${storeId}`, JSON.stringify(newTables))
  }

  // 실시간 노쇼 카운트다운 타이머 (1초 주기)
  useEffect(() => {
    const timer = setInterval(() => {
      setTables((prevTables) => {
        let hasChanges = false
        const updated = prevTables.map((table) => {
          if (table.status === 'reserved' || table.status === 'noshow_warning') {
            if (table.reservation && table.reservation.remainSeconds > 0) {
              hasChanges = true
              const nextSec = table.reservation.remainSeconds - 1
              const nextStatus: TableStatus = nextSec <= 300 ? 'noshow_warning' : 'reserved'
              return {
                ...table,
                status: nextStatus,
                reservation: { 
                  ...table.reservation, 
                  remainSeconds: nextSec,
                  isWarning: nextSec <= 300
                }
              }
            } else if (table.reservation && table.reservation.remainSeconds <= 0) {
              hasChanges = true
              setActionLog((prev) => [
                `[자동 노쇼 취소] ${table.name} (${table.reservation?.guestName} 님) 유예시간 초과로 좌석 자동 회수 완료`,
                ...prev.slice(0, 8)
              ])
              return {
                ...table,
                status: 'available' as TableStatus,
                reservation: undefined
              }
            }
          }
          return table
        })
        return hasChanges ? updated : prevTables
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [storeId])

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length
  const reservedCount = tables.filter((t) => t.status === 'reserved' || t.status === 'noshow_warning').length
  const availableCount = tables.filter((t) => t.status === 'available').length
  const isFull = availableCount === 0

  // 네이버 예약 가상 인입 시뮬레이터 (만석 시 웨이팅으로 자동 전환)
  const simulateNaverReservation = (guestName: string, count: number) => {
    const candidates = tables.filter((t) => t.status === 'available' && t.capacity >= count)
    candidates.sort((a, b) => a.capacity - b.capacity)

    if (candidates.length === 0) {
      setWaitingCount((prev) => prev + 1)
      setActionLog((prev) => [
        `[🚨 만석 대기 접수] ${guestName} 님 (${count}명) ➔ 가용 빈자리 없음! 현장 웨이팅 대기 번호 부여됨`,
        ...prev.slice(0, 8)
      ])
      alert(`🚨 현재 매장이 전석 만석(Full)입니다!\n${guestName} 고객님이 네이버 스마트 웨이팅(대기)으로 자동 등록되었습니다.`)
      return
    }

    const targetTable = candidates[0]
    const remainSeconds = noShowTimeoutMinutes * 60

    const newReservation = {
      id: `res-${Date.now()}`,
      guestName,
      guestCount: count,
      reservedTime: '15:30',
      source: 'naver' as const,
      phoneLastDigits: Math.floor(1000 + Math.random() * 9000).toString(),
      remainSeconds,
      isWarning: false
    }

    const updatedTables = tables.map((t) => 
      t.id === targetTable.id ? { ...t, status: 'reserved' as TableStatus, reservation: newReservation } : t
    )

    saveTables(updatedTables)

    setActionLog((prev) => [
      `[네이버 예약 자동 배정] ${guestName} 님 (${count}명) ➔ ${targetTable.name} 자동 지정 완료!`,
      ...prev.slice(0, 8)
    ])
  }

  const handleCheckIn = (tableId: number) => {
    const isCafe = storeId === 'cafe'
    const orderPool = isCafe ? CAFE_ORDERS : CHICKEN_ORDERS
    const randomOrder = orderPool[Math.floor(Math.random() * orderPool.length)]

    const updated = tables.map((t) => {
      if (t.id === tableId) {
        return {
          ...t,
          status: 'occupied' as TableStatus,
          currentOrder: randomOrder,
          reservation: undefined
        }
      }
      return t
    })
    saveTables(updated)
    setSelectedTable(null)
    setActionLog((prev) => [
      `[손님 착석 완료] ${tables.find(t => t.id === tableId)?.name} ➔ 주문: "${randomOrder}"`,
      ...prev.slice(0, 8)
    ])
  }

  const handleCancelReservation = (tableId: number) => {
    const target = tables.find(t => t.id === tableId)
    const updated = tables.map((t) => {
      if (t.id === tableId) {
        return { ...t, status: 'available' as TableStatus, reservation: undefined }
      }
      return t
    })
    saveTables(updated)
    setSelectedTable(null)
    setActionLog((prev) => [
      `[점주 예약 취소] ${target?.name} 좌석이 정상적으로 비워졌습니다.`,
      ...prev.slice(0, 8)
    ])
  }

  const handleFreeTable = (tableId: number) => {
    const target = tables.find(t => t.id === tableId)
    const updated = tables.map((t) => {
      if (t.id === tableId) {
        return { ...t, status: 'available' as TableStatus, currentOrder: undefined }
      }
      return t
    })
    saveTables(updated)
    setSelectedTable(null)
    setActionLog((prev) => [
      `[퇴석 및 정돈 완료] ${target?.name} 회전 완료 ➔ 빈자리 전환`,
      ...prev.slice(0, 8)
    ])
  }

  const handleResetTables = () => {
    if (confirm('현재 매장의 테이블 상태와 예약 내역을 초기화하시겠습니까?')) {
      const defaults = storeId === 'cafe' ? INITIAL_CAFE_TABLES : INITIAL_CHICKEN_TABLES
      saveTables(defaults)
      setWaitingCount(0)
      setActionLog(['테이블 현황이 매장 기본값으로 리셋되었습니다.'])
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}분 ${s < 10 ? '0' : ''}${s}초`
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6 pb-28 font-sans">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* 상단 컨트롤 바 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">실시간 테이블 관제 & 네이버 예약 자동 배정</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
                <Store className="size-3" /> {storeName}
              </span>
              {isFull ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                  <Flame className="size-3" /> 전석 만석 (피크타임)
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                  AI 좌석 최적화
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              네이버 예약 유입 시 인원수에 맞춰 최적의 빈자리에 즉시 자동 배정되고, 설정된 노쇼 유예 시간 초과 시 자동으로 좌석을 회수합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Clock className="size-3.5 text-slate-500" />
              <span className="font-medium text-slate-600">노쇼 자동 취소:</span>
              <select 
                value={noShowTimeoutMinutes} 
                onChange={(e) => {
                  setNoShowTimeoutMinutes(Number(e.target.value))
                  localStorage.setItem('localmate_noshow_timeout', e.target.value)
                }}
                className="bg-transparent font-semibold text-blue-600 focus:outline-none cursor-pointer"
              >
                <option value={10}>예약 후 10분</option>
                <option value={15}>예약 후 15분</option>
                <option value={30}>예약 후 30분</option>
              </select>
            </div>

            <button
              onClick={handleResetTables}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center gap-1"
            >
              <RotateCcw className="size-3" /> 초기화
            </button>
          </div>
        </div>

        {/* 요약 바 & 시뮬레이터 트리거 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-around text-center">
            <div>
              <p className="text-[11px] font-medium text-slate-500">전체 좌석</p>
              <p className="text-lg font-bold text-slate-800">{tables.length}석</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[11px] font-medium text-blue-600">이용 중</p>
              <p className="text-lg font-bold text-blue-700">{occupiedCount}석</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[11px] font-medium text-amber-600">예약석</p>
              <p className="text-lg font-bold text-amber-700">{reservedCount}석</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            
            {/* 🎯 만석 상태일 때 붉은색 만석 배너로 교체 */}
            <div>
              <p className="text-[11px] font-medium text-slate-500">가용 좌석</p>
              {isFull ? (
                <div className="mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md animate-pulse">
                    <AlertOctagon className="size-3" /> 만석 (0석)
                  </span>
                </div>
              ) : (
                <p className="text-lg font-bold text-emerald-700">{availableCount}석</p>
              )}
            </div>
          </div>

          {/* ⚡ 시뮬레이터 배너 (만석 여부에 따라 디자인 변경) */}
          <div className={`lg:col-span-3 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
            isFull 
              ? 'bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-white border-rose-300'
              : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white border-emerald-200'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full ${isFull ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                <span className={`text-xs font-bold ${isFull ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {isFull ? '⚠️ 매장 전석 만석 (웨이팅 자동 접수 모드)' : '네이버 예약 가상 유입 시뮬레이터'}
                </span>
                {waitingCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white">
                    웨이팅 {waitingCount}팀
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isFull 
                  ? '현재 빈 좌석이 없어 추가 예약 발생 시 네이버 스마트 웨이팅 대기열로 즉시 적재됩니다.'
                  : '버튼을 누르면 네이버 예약이 인입되어 알맞은 빈 테이블에 즉시 자동 배정됩니다.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => simulateNaverReservation('이영희', 2)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition shadow-2xs flex items-center gap-1.5 border ${
                  isFull 
                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100' 
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <PlusCircle className="size-3.5" /> 2명 예약 인입
              </button>
              <button
                onClick={() => simulateNaverReservation('김철수', 4)}
                className={`px-3 py-2 text-xs font-semibold text-white rounded-xl transition shadow-xs flex items-center gap-1.5 ${
                  isFull ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <PlusCircle className="size-3.5" /> 4명 예약 인입
              </button>
              <button
                onClick={() => simulateNaverReservation('팀회식(정명기)', 6)}
                className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <PlusCircle className="size-3.5" /> 6인 단체 인입
              </button>
            </div>
          </div>
        </div>

        {/* 매장 테이블 실시간 관제 배치도 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UtensilsCrossed className="size-4 text-indigo-600" />
              <span>매장 테이블 실시간 관제 배치도</span>
              <span className="text-xs font-normal text-slate-400"> (테이블을 클릭하면 입석/퇴석/노쇼 직접 관리가 가능합니다)</span>
            </h2>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600"><span className="size-2.5 rounded-full bg-slate-200 border border-slate-300" /> 빈자리</span>
              <span className="flex items-center gap-1 text-blue-700"><span className="size-2.5 rounded-full bg-blue-500" /> 이용중</span>
              <span className="flex items-center gap-1 text-amber-700"><span className="size-2.5 rounded-full bg-amber-500" /> 네이버 예약중</span>
              <span className="flex items-center gap-1 text-rose-700"><span className="size-2.5 rounded-full bg-rose-500 animate-pulse" /> 노쇼 임박</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {tables.map((table) => {
              const isOccupied = table.status === 'occupied'
              const isReserved = table.status === 'reserved'
              const isNoShowWarning = table.status === 'noshow_warning'
              const isAvailable = table.status === 'available'

              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[145px] select-none ${
                    isOccupied 
                      ? 'bg-blue-50/40 border-blue-300 hover:border-blue-500 shadow-2xs'
                      : isNoShowWarning
                      ? 'bg-rose-50/70 border-rose-400 hover:border-rose-500 shadow-xs ring-2 ring-rose-200 animate-pulse'
                      : isReserved
                      ? 'bg-amber-50/50 border-amber-300 hover:border-amber-500 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 border-b border-slate-100/80 pb-2">
                    <span className="text-sm font-semibold text-slate-800 tracking-tight">
                      {table.name}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
                      {table.capacity}인석
                    </span>
                  </div>

                  <div className="my-2.5">
                    {isOccupied && (
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                          식사 이용 중
                        </span>
                        <p className="text-xs font-medium text-slate-700 line-clamp-1" title={table.currentOrder}>
                          🍽️ {table.currentOrder || '식사 진행 중'}
                        </p>
                      </div>
                    )}

                    {(isReserved || isNoShowWarning) && table.reservation && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isNoShowWarning ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                            N 예약
                          </span>
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {table.reservation.guestName} ({table.reservation.guestCount}명)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          예약: {table.reservation.reservedTime} (끝자리 {table.reservation.phoneLastDigits})
                        </p>
                      </div>
                    )}

                    {isAvailable && (
                      <div className="text-center py-2">
                        <span className="text-xs text-slate-400 font-normal">비어 있음</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    {(isReserved || isNoShowWarning) && table.reservation ? (
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-medium flex items-center gap-1 ${isNoShowWarning ? 'text-rose-600 font-bold' : 'text-amber-700'}`}>
                          <Clock className="size-3" /> {formatTime(table.reservation.remainSeconds)}
                        </span>
                        <span className={`text-[10px] font-semibold ${isNoShowWarning ? 'text-rose-600' : 'text-amber-600'}`}>
                          {isNoShowWarning ? '노쇼 임박' : '대기중'}
                        </span>
                      </div>
                    ) : isOccupied ? (
                      <span className="text-[10px] text-blue-600 font-medium">테이블 회전 중</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">즉시 배정 가능</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 관제 실시간 엔진 로그 */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              LocalMate 예약 관제 실시간 엔진 로그
            </span>
            <span className="text-[11px] text-slate-400">자동 노쇼 취소 타이머 작동 중</span>
          </div>
          <div className="font-mono text-xs space-y-1 max-h-28 overflow-y-auto pt-1 text-slate-300">
            {actionLog.map((log, index) => (
              <div key={index} className="leading-relaxed">
                <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString('ko-KR')}]</span>
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 테이블 상세 제어 모달 */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedTable.name} 상세 제어</h3>
                <span className="text-xs text-slate-500">{selectedTable.capacity}인석 기준 테이블 ({storeName})</span>
              </div>
              <button onClick={() => setSelectedTable(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="size-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5">
              <p><strong>현재 상태:</strong> {
                selectedTable.status === 'available' ? '빈자리' :
                selectedTable.status === 'occupied' ? '식사 이용중' :
                selectedTable.status === 'noshow_warning' ? '🚨 노쇼 임박' : '예약 대기중'
              }</p>

              {selectedTable.currentOrder && (
                <p><strong>주문 내역:</strong> <span className="font-semibold text-indigo-700">{selectedTable.currentOrder}</span></p>
              )}

              {selectedTable.reservation && (
                <>
                  <p><strong>예약자:</strong> {selectedTable.reservation.guestName} ({selectedTable.reservation.guestCount}명)</p>
                  <p><strong>예약 시간:</strong> {selectedTable.reservation.reservedTime}</p>
                  <p><strong>남은 유예 시간:</strong> <span className="font-bold text-rose-600">{formatTime(selectedTable.reservation.remainSeconds)}</span></p>
                </>
              )}
            </div>

            <div className="space-y-2 pt-2">
              {selectedTable.status === 'available' && (
                <button
                  onClick={() => handleCheckIn(selectedTable.id)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ArrowRightCircle className="size-4" /> 현장 워크인 손님 착석 (식사 시작)
                </button>
              )}

              {(selectedTable.status === 'reserved' || selectedTable.status === 'noshow_warning') && (
                <>
                  <button
                    onClick={() => handleCheckIn(selectedTable.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="size-4" /> 고객 도착 완료 (식사 시작으로 전환)
                  </button>
                  <button
                    onClick={() => handleCancelReservation(selectedTable.id)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="size-4" /> 점주 직접 노쇼 취소 (좌석 즉시 비우기)
                  </button>
                </>
              )}

              {selectedTable.status === 'occupied' && (
                <button
                  onClick={() => handleFreeTable(selectedTable.id)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="size-4" /> 식사 완료 / 퇴석 (테이블 비우기)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ReservationsView