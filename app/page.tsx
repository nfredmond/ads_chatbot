import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, MessageSquare, TrendingUp } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
            Marketing Analytics <span className="text-blue-600">Chatbot</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI-powered insights for your Google Ads, Meta Ads, and LinkedIn Ads campaigns.
            Get actionable recommendations and optimize your marketing performance.
          </p>

          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unified Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-300">
                View all your campaigns across platforms in one place
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ask questions and get intelligent insights instantly
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Optimization</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive actionable recommendations to improve ROAS
              </p>
            </div>
          </div>

          <div className="mt-16 text-center space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trusted by marketing agencies worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link
                href="/privacy-policy"
                className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                Privacy Policy
              </Link>
              <span className="hidden h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600 md:inline-block" />
              <Link
                href="/terms-of-service"
                className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
