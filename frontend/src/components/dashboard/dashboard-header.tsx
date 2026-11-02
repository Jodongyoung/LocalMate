'use client'

import { useState, useEffect } from 'react'
import { Bell, ChevronDown, Store } from 'lucide-react'

const DEFAULT_STORES = [
  { id: 'cafe', name: '☕ 동성로 카페 (본점)', platform: '배달의민족 연동 매장' },
  { id: 'chicken', name: '🍗 수성 치킨 (지점)', platform: '쿠팡이츠 연동 매장' },
]

export function DashboardHeader({
  onLogout,
  unansweredCount,
}: {
  onLogout?: () => void
  unansweredCount?: number
}) {
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState('cafe')
  const [stores, setStores] = useState(DEFAULT_STORES)

  // 1. 설정값에서 동적 상호명 불러오기
  const loadStoreNames = () => {
    const updatedStores = [...DEFAULT_STORES]
    
    const cafeSettings = localStorage.getItem('localmate_settings_cafe')
    if (cafeSettings) updatedStores[0].name = JSON.parse(cafeSettings).name
    
    const chickenSettings = localStorage.getItem('localmate_settings_chicken')
    if (chickenSettings) updatedStores[1].name = JSON.parse(chickenSettings).name
    
    setStores(updatedStores)
  }

  useEffect(() => {
    loadStoreNames() // 최초 실행

    const saved = localStorage.getItem('localmate_store_id')
    if (saved && DEFAULT_STORES.some((s) => s.id === saved)) {
      setSelectedStoreId(saved)
    }

    // 설정창 변경 감지
    window.addEventListener('settingsChange', loadStoreNames)

    // 매장 변경 감지
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) setSelectedStoreId(customEvent.detail)
    }
    window.addEventListener('storeChange', handleSync)

    return () => {
      window.removeEventListener('settingsChange', loadStoreNames)
      window.removeEventListener('storeChange', handleSync)
    }
  }, [])

  const handleSelectStore = (id: string) => {
    setSelectedStoreId(id)
    setStoreDropdownOpen(false)
    localStorage.setItem('localmate_store_id', id)
    window.dispatchEvent(new CustomEvent('storeChange', { detail: id }))
  }

  const currentStore = stores.find((s) => s.id === selectedStoreId) || stores[0]

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Store className="size-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">LocalMate</span>
        </div>
        <div className="h-4 w-px bg-slate-200"></div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-slate-950 transition-colors"
          >
            <span className="size-2 rounded-full bg-emerald-500"></span>
            <span>{currentStore.name}</span>
            <span className="text-xs font-normal text-slate-500">({currentStore.platform})</span>
            <ChevronDown className="size-4 text-slate-400" />
          </button>

          {storeDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl z-50">
              {stores.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStore(s.id)}
                  className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedStoreId === s.id ? 'bg-indigo-50 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-medium text-slate-900">{s.name}</span>
                  <span className="text-xs text-slate-500">{s.platform}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="h-4 w-px bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold">김</div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 leading-tight">김사장님</span>
            <span className="text-xs text-slate-500 leading-tight">게스트 체험 중</span>
          </div>
        </div>
      </div>
    </header>
  )
}