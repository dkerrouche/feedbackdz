import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome to your FeedbackDZ dashboard! Here you can manage your surveys and view customer feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Total Responses
              </h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Average Rating
              </h3>
              <p className="text-3xl font-bold text-green-600">-</p>
              <p className="text-sm text-gray-500">Out of 5 stars</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Response Rate
              </h3>
              <p className="text-3xl font-bold text-purple-600">-</p>
              <p className="text-sm text-gray-500">QR scans to completion</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Responses
            </h3>
            <div className="text-center py-8 text-gray-500">
              <p>No responses yet. Create your first survey to start collecting feedback!</p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}