import React from 'react'
import Link from 'next/link'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-extrabold text-gray-900 tracking-tight">
                FeedbackDZ
              </Link>
            </div>
            <nav className="flex space-x-2">
              <Link 
                href="/dashboard" 
                className="text-gray-900/80 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <Link 
                href="/profile" 
                className="text-gray-900/80 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}