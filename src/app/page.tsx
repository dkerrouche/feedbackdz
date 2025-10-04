import Layout from '@/components/Layout'
import Link from 'next/link'

export default function Home() {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Welcome to FeedbackDZ
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Algeria's leading restaurant feedback platform
        </p>
        <div className="space-y-4 mb-8">
          <p className="text-gray-800">
            Collect real-time customer feedback through voice and text
          </p>
          <p className="text-gray-800">
            Get AI-powered insights and analytics
          </p>
          <p className="text-gray-800">
            Support for Arabic, French, and Darija
          </p>
        </div>
        
        <div className="space-x-4">
          <Link 
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/auth"
            className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </Layout>
  )
}
