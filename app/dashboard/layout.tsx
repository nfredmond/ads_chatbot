import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, email')
    .eq('id', user.id)
    .single()

  // Create profile if it doesn't exist
  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      onboarding_completed: false,
    })
    redirect('/onboarding')
  }

  // Redirect to onboarding if not completed
  if (!profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav user={user} />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}

