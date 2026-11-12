'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  MessageSquare, 
  TrendingUp, 
  ClipboardList, 
  Settings,
  LayoutGrid,
  Sparkles,
  DollarSign,
  PackageCheck,
  Store,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from '@/components/layout/router-compat'
import { usePathname } from '@/components/layout/router-compat'

const DEFAULT_STORES = [
  { id: 'cafe', name: '☕ 동성로 카페 (본점)', icon: '☕' },
  { id: 'chicken', name: '🍗 수성 치킨 (지점)', icon: '🍗' }
]

const getInitialStoreId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

const getInitialStores = () => {
  const updatedStores = [...DEFAULT_STORES]
  if (typeof window !== 'undefined') {
    const cafeSettings = localStorage.getItem('localmate_settings_cafe')
    if (cafeSettings) {
      try { updatedStores[0].name = JSON.parse(cafeSettings).name } catch (e) {}
    }
    const chickenSettings = localStorage.getItem('localmate_settings_chicken')
    if (chickenSettings) {
      try { updatedStores[1].name = JSON.parse(chickenSettings).name } catch (e) {}
    }
  }
  return updatedStores
}

const getInitialPendingCount = (storeId: string): number => {
  if (typeof window !== 'undefined') {
    const savedProposals = localStorage.getItem(`localmate_proposals_v5_${storeId}`)
    if (savedProposals) {
      try {
        const parsed = JSON.parse(savedProposals)
        return parsed.filter((p: any) => p.status === 'pending').length
      } catch (e) {}
    }
    const directSaved = localStorage.getItem('localmate_pending_tasks_count')
    if (directSaved !== null) return Number(directSaved)
  }
  return 0
}

export function Sidebar({ 
  isCollapsed, 
  onToggleCollapse,
  onLogout 
}: { 
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname()
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false)

  const [selectedStoreId, setSelectedStoreId] = useState<string>(getInitialStoreId)
  const [stores, setStores] = useState(getInitialStores)
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(() => getInitialPendingCount(getInitialStoreId()))

  const loadStoreNames = () => {
    const updatedStores = [...DEFAULT_STORES]
    const cafeSettings = localStorage.getItem('localmate_settings_cafe')
    if (cafeSettings) {
      try { updatedStores[0].name = JSON.parse(cafeSettings).name } catch (e) {}
    }
    const chickenSettings = localStorage.getItem('localmate_settings_chicken')
    if (chickenSettings) {
      try { updatedStores[1].name = JSON.parse(chickenSettings).name } catch (e) {}
    }
    setStores(updatedStores)
  }

  const syncPendingCount = (storeId: string) => {
    const savedProposals = localStorage.getItem(`localmate_proposals_v5_${storeId}`)
    if (savedProposals) {
      try {
        const parsed = JSON.parse(savedProposals)
        const pending = parsed.filter((p: any) => p.status === 'pending').length
        setPendingTasksCount(pending)
        localStorage.setItem('localmate_pending_tasks_count', pending.toString())
        return
      } catch (e) {}
    }
    const directSaved = localStorage.getItem('localmate_pending_tasks_count')
    setPendingTasksCount(directSaved !== null ? Number(directSaved) : 0)
  }

  useEffect(() => {
    loadStoreNames()
    const saved = localStorage.getItem('localmate_store_id') || 'cafe'
    setSelectedStoreId(saved)
    syncPendingCount(saved)

    window.addEventListener('settingsChange', loadStoreNames)
    
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setSelectedStoreId(customEvent.detail)
        syncPendingCount(customEvent.detail)
      }
    }
    window.addEventListener('storeChange', handleSync)

    const handlePendingTasksUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<number>
      if (typeof customEvent.detail === 'number') {
        setPendingTasksCount(customEvent.detail)
      }
    }
    window.addEventListener('pendingTasksUpdated', handlePendingTasksUpdate)

    return () => {
      window.removeEventListener('settingsChange', loadStoreNames)
      window.removeEventListener('storeChange', handleSync)
      window.removeEventListener('pendingTasksUpdated', handlePendingTasksUpdate)
    }
  }, [])

  const handleSelectStore = (id: string) => {
    setSelectedStoreId(id)
    setIsBusinessDropdownOpen(false)
    localStorage.setItem('localmate_store_id', id)
    window.dispatchEvent(new CustomEvent('storeChange', { detail: id }))
  }

  const currentStore = stores.find((s) => s.id === selectedStoreId) || stores[0]

  const tabs = [
    { id: 'dashboard', label: '통합 대시보드', icon: BarChart3, href: '/' },
    { id: 'reservations', label: '실시간 테이블 & 예약', icon: LayoutGrid, href: '/reservations' },
    { id: 'reviews', label: '고객 리뷰 관리', icon: MessageSquare, href: '/reviews' },
    { id: 'marketing', label: 'AI SNS 마케팅', icon: Sparkles, href: '/marketing' },
    { id: 'commercial-analysis', label: 'AI 상권·트렌드 분석', icon: Store, href: '/commercial-analysis' },
    { id: 'operations', label: '매장 운영 분석', icon: TrendingUp, href: '/operations' },
    { id: 'menu-profit', label: '메뉴 수익성 분석', icon: DollarSign, href: '/menu-profit' },
    { id: 'inventory', label: '식자재 및 발주 관리', icon: PackageCheck, href: '/inventory' },
    { id: 'tasks', label: 'AI 업무 및 승인', icon: ClipboardList, href: '/tasks', badge: pendingTasksCount },
    { id: 'settings', label: '매장 설정', icon: Settings, href: '/settings' },
  ]

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 font-sans ${isCollapsed ? 'w-[70px]' : 'w-[250px]'}`}>
      <div className="flex items-center justify-between p-4 border-b h-[73px]">
        <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shrink-0">LM</div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-lg font-bold">LocalMate</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">소상공인 AI 비서</span>
          </div>
        </div>
        <button onClick={onToggleCollapse} className={`p-1.5 rounded-md hover:bg-slate-100 text-slate-500 shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="p-3 border-b border-slate-200">
        <div className="relative w-full">
          <button
            type="button"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-2 px-2'} py-2 text-left rounded-lg hover:bg-slate-100 transition`}
            onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
          >
            {isCollapsed ? (
              <span className="text-lg" title={currentStore.name}>{currentStore.icon}</span>
            ) : (
              <>
                <span className="text-sm font-medium truncate">{currentStore.name}</span>
                {isBusinessDropdownOpen ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
              </>
            )}
          </button>
          
          {isBusinessDropdownOpen && !isCollapsed && (
            <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg py-1">
              {stores.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectStore(option.id)}
                  className={`w-full text-left px-3 py-2 text-sm transition ${
                    selectedStoreId === option.id ? 'bg-blue-50 font-bold text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            const Icon = tab.icon
            return (
              <li key={tab.id}>
                <Link 
                  href={tab.href}
                  title={isCollapsed ? tab.label : undefined}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-3 w-full rounded-lg transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="size-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>}
                  
                  {!isCollapsed && typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0 shadow-sm animate-in fade-in">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-slate-200">
        {!isCollapsed && (
          <div className="text-[10px] text-center text-slate-500 bg-slate-100 rounded-lg p-2 mb-2 whitespace-nowrap">
            합성 데모 데이터 모드 / Mock API
          </div>
        )}
        <button 
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2 px-3'} py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors`}
          title={isCollapsed ? "로그아웃" : undefined}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          {!isCollapsed && <span className="text-sm font-medium">로그아웃</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar