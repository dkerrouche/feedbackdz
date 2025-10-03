import PhoneAuth from '@/components/auth/PhoneAuth'

export default function AuthPage() {
  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful authentication
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <PhoneAuth onSuccess={handleAuthSuccess} />
    </div>
  )
}