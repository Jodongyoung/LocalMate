'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  MessageSquare, 
  TrendingUp, 
  ClipboardList, 
  Settings,
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

    // 설정창 저장 이벤트 감지하여 이름 실시간 업데이트
    window.addEventListener('settingsChange', loadStoreNames)

    // 매장 변경 이벤트 감지
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
    setIsBusinessDropdownOpen(false)
    localStorage.setItem('localmate_store_id', id)
    window.dispatchEvent(new CustomEvent('storeChange', { detail: id }))
  }

  const currentStore = stores.find((s) => s.id === selectedStoreId) || stores[0]

  const tabs = [
    { id: 'dashboard', label: '통합 대시보드', icon: BarChart3, href: '/' },
    { id: 'reviews', label: '고객 리뷰 관리', icon: MessageSquare, href: '/reviews' },
    { id: 'operations', label: '매장 운영 분석', icon: TrendingUp, href: '/operations' },
    { id: 'tasks', label: 'AI 업무 및 승인', icon: ClipboardList, href: '/tasks', badge: 1 },
    { id: 'settings', label: '매장 설정', icon: Settings, href: '/settings' },
  ]

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-[70px]' : 'w-[250px]'}`}>
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
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="size-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>}
                  
                  {/* 🎯 사진 속 모양과 100% 일치하는 완벽한 원형(Circle) 알림 배지 */}
                  {!isCollapsed && tab.badge && (
                    <span className="ml-auto bg-red-500 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0 shadow-sm">
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