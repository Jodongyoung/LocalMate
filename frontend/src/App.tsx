import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/layout'
import { DashboardView } from '@/components/dashboard/view'
import { ReviewsView } from '@/components/reviews/view'
import { OperationsView } from '@/components/operations/view'
import { TasksView } from '@/components/tasks/view'
import { SettingsView } from '@/components/settings/view'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/reviews" element={<ReviewsView />} />
          <Route path="/operations" element={<OperationsView />} />
          <Route path="/tasks" element={<TasksView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}