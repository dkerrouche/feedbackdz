import { Suspense } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardContent from '@/components/dashboard/DashboardContent'

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={<DashboardLoading />}>
          <DashboardContent />
        </Suspense>
      </Layout>
    </ProtectedRoute>
  )
}