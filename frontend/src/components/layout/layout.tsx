import { useState, useEffect, useRef } from 'react'
import { Sidebar } from './sidebar'
import { AiAssistant } from '../localmate/ai-assistant'
import { LoginView } from '@/components/localmate/login-view' // 👈 니가 만든 로그인 화면 불러오기!
import { initialReviews } from '@/lib/mock-data'

export function Layout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<'checking' | 'authed' | 'guest-out'>('checking')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const isLoggedInRef = useRef(isLoggedIn)

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
            isLoggedInRef.current = 'authed'
          } else {
            setIsLoggedIn('guest-out')
            isLoggedInRef.current = 'guest-out'
          }
        } catch (e) {
          setIsLoggedIn('guest-out')
          isLoggedInRef.current = 'guest-out'
        }
      } else {
        setIsLoggedIn('guest-out')
        isLoggedInRef.current = 'guest-out'
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
    
    // 로그인 상태 체크 타임아웃 설정 (1초 후에 'guest-out'으로 강제 전환)
    const timeoutId = setTimeout(() => {
      if (isLoggedInRef.current === 'checking') {
        setIsLoggedIn('guest-out')
      }
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [])

  // 로그인 성공 시 세션 스토리지에 저장
  const handleLoginSuccess = (mode: 'user' | 'guest', businessId?: string) => {
    const authData = { mode, businessId }
    sessionStorage.setItem('localmate_auth', JSON.stringify(authData))
    setIsLoggedIn('authed')
    isLoggedInRef.current = 'authed'
  }

  // 로그아웃 시 세션 스토리지에서 삭제
  const handleLogout = () => {
    sessionStorage.removeItem('localmate_auth')
    setIsLoggedIn('guest-out')
    isLoggedInRef.current = 'guest-out'
  }

  // 사이드바 접기/펼치기 상태 저장
  useEffect(() => {
    localStorage.setItem('localmate_sidebar_collapsed', isSidebarCollapsed.toString())
  }, [isSidebarCollapsed])

  // mounted 상태가 false이면 null 반환 (서버 렌더링 방지)
  if (!mounted) return null

  // 로그인 상태 확인 중일 때는 로딩 표시 또는 기본 화면
  if (isLoggedIn === 'checking') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로그인 상태를 확인 중입니다...</p>
        </div>
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