'use client'

import { useState, useEffect, useRef } from 'react'
import { Sidebar } from './sidebar'
import { AiAssistant } from '../localmate/ai-assistant'
import { LoginView } from '@/components/localmate/login-view'
import { initialReviews, type Review } from '@/lib/mock-data'

export function Layout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<'checking' | 'authed' | 'guest-out'>('checking')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isLoggedInRef = useRef(isLoggedIn)

  const [reviews, setReviews] = useState<Review[]>(initialReviews)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      
      const collapsed = localStorage.getItem('localmate_sidebar_collapsed')
      if (collapsed === 'true') {
        setIsSidebarCollapsed(true)
      } else {
        setIsSidebarCollapsed(false)
      }
    }

    restoreAuthStatus()
    
    const timeoutId = setTimeout(() => {
      if (isLoggedInRef.current === 'checking') {
        setIsLoggedIn('guest-out')
      }
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [])

  const handleLoginSuccess = (mode: 'user' | 'guest', businessId?: string) => {
    const authData = { mode, businessId }
    sessionStorage.setItem('localmate_auth', JSON.stringify(authData))
    setIsLoggedIn('authed')
    isLoggedInRef.current = 'authed'
  }

  const handleLogout = () => {
    sessionStorage.removeItem('localmate_auth')
    setIsLoggedIn('guest-out')
    isLoggedInRef.current = 'guest-out'
  }

  useEffect(() => {
    localStorage.setItem('localmate_sidebar_collapsed', isSidebarCollapsed.toString())
  }, [isSidebarCollapsed])

  const handleGenerateAllDrafts = () => {
    return reviews.filter(r => !r.reply)
  }

  if (!mounted) return null

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

  if (isLoggedIn !== 'authed') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <LoginView onLogin={() => handleLoginSuccess('guest')} />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        onLogout={handleLogout} 
      />
      <main className={`flex-1 overflow-y-auto relative transition-all duration-300 ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>

      <AiAssistant 
        reviews={reviews} 
        onGenerateAllDrafts={handleGenerateAllDrafts} 
      />
    </div>
  )
}