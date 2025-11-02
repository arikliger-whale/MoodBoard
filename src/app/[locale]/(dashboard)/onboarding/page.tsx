import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/auth'

export default async function OnboardingPage() {
  const session = await getSession()

  if (!session) {
    redirect('/sign-in')
  }

  // TODO: Check if user has completed onboarding
  // TODO: Show onboarding flow (create organization, etc.)

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f7f7ed'
    }}>
      <div>
        <h1>Welcome to MoodB!</h1>
        <p>Let's set up your account...</p>
        {/* TODO: Add onboarding form */}
      </div>
    </div>
  )
}

