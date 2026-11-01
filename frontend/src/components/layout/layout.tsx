import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { AiAssistant } from '../localmate/ai-assistant'
import { LoginView } from '@/components/localmate/login-view' // 👈 니가 만든 로그인 화면 불러오기!
import { initialReviews } from '@/lib/mock-data'

export function Layout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<'checking' | 'authed' | 'guest-out'>('checking')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Next.js 에러 방지
  useEffect(() => {
    setMounted(true)
  }, [])

  // 세션 스토리지에서 로그인 상태 복원
  useEffect(() => {
    const restoreAuthStatus = () => {
      const storedAuth = sessionStorage.getItem('localmate_auth')
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth)
          if (authData.mode === 'user' || authData.mode === 'guest') {
            setIsLoggedIn('authed')
          } else {
            setIsLoggedIn('guest-out')
          }
        } catch (e) {
          setIsLoggedIn('guest-out')
        }
      } else {
        setIsLoggedIn('guest-out')
      }
      
      // 사이드바 접힘 상태 복원
      const collapsed = localStorage.getItem('localmate_sidebar_collapsed')
      if (collapsed === 'true') {
        setIsSidebarCollapsed(true)
      } else {
        setIsSidebarCollapsed(false)
      }
    }

    restoreAuthStatus()
  }, [])

  // 로그인 성공 시 세션 스토리지에 저장
  const handleLoginSuccess = (mode: 'user' | 'guest', businessId?: string) => {
    const authData = { mode, businessId }
    sessionStorage.setItem('localmate_auth', JSON.stringify(authData))
    setIsLoggedIn('authed')
  }

  // 로그아웃 시 세션 스토리지에서 삭제
  const handleLogout = () => {
    sessionStorage.removeItem('localmate_auth')
    setIsLoggedIn('guest-out')
  }

  // 사이드바 접기/펼치기 상태 저장
  useEffect(() => {
    localStorage.setItem('localmate_sidebar_collapsed', isSidebarCollapsed.toString())
  }, [isSidebarCollapsed])

  if (!mounted) return null

  // 로그인 상태 확인 중일 때는 빈 화면 또는 로딩 표시
  if (isLoggedIn === 'checking') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        {/* 로딩 스피너를 여기에 추가 가능 */}
      </div>
    )
  }

  // 1. 미로그인: 니가 원래 짰던 그 예쁜 로그인 화면 렌더링
  if (isLoggedIn !== 'authed') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <LoginView onLogin={() => handleLoginSuccess('guest')} />
      </div>
    )
  }

  // 2. 로그인 완료: 대시보드 레이아웃 (사이드바 고정)
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        onLogout={handleLogout} 
      />
      <main className={`flex-1 overflow-y-auto relative transition-all duration-300 ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'}`}>
        {children}
      </main>
      {isAssistantOpen && (
        <AiAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} reviews={initialReviews} />
      )}
    </div>
  )
}