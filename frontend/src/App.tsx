import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/layout'
import { DashboardView } from '@/components/dashboard/view'
import { ReservationsView } from '@/components/reservations/view'
import { ReviewsView } from '@/components/reviews/view'
import { MarketingView } from '@/components/marketing/marketing-view' // 🎯 1. 마케팅 뷰 임포트 추가
import { OperationsView } from '@/components/operations/view'
import { TasksView } from '@/components/tasks/view'
import { SettingsView } from '@/components/settings/view'
import { MenuProfitView } from '@/components/menu/menu-profit-view'
import { InventoryIntelligenceView } from '@/components/inventory/inventory-intelligence-view'
// 에러 경계 컴포넌트 추가
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600">페이지를 새로고침해주세요.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }
  
  return children
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardView onLogout={() => {}} />} />
            <Route path="/reservations" element={<ReservationsView />} />
            <Route path="/reviews" element={<ReviewsView />} />
            <Route path="/marketing" element={<MarketingView />} /> {/* 🎯 2. AI 마케팅 라우트 추가 */}
            <Route path="/operations" element={<OperationsView />} />
            <Route path="/tasks" element={<TasksView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/menu-profit" element={<MenuProfitView />} />
            <Route path="/inventory" element={<InventoryIntelligenceView />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  )
}