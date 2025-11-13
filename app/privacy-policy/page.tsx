import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Marketing Analytics Chatbot',
  description:
    'Learn how Marketing Analytics Chatbot collects, uses, and protects your advertising data across Google Ads, Meta Ads, and LinkedIn Ads.',
}

const sections = [
  {
    title: 'Information We Collect',
    content: [
      'Account information such as name, email address, and organization details supplied during onboarding.',
      'OAuth credentials and API tokens issued by Google Ads, Meta Ads, and LinkedIn Ads. Tokens are encrypted at rest and scoped to your tenant.',
      'Advertising performance data (campaigns, ad sets, spend, conversions, audiences) retrieved only after you explicitly connect a platform.',
      'Operational telemetry such as sync timestamps, API success or error codes, and anonymized usage metrics used to improve reliability.',
    ],
  },
  {
    title: 'How We Use Your Data',
    content: [
      'Deliver dashboards, AI-generated insights, and reporting automation specific to your connected ad accounts.',
      'Monitor token health, send proactive alerts about expiring credentials, and maintain synchronization schedules.',
      'Securely store encrypted refresh tokens so you do not need to re-authorize platforms each time data is refreshed.',
      'Improve product performance by analyzing aggregated, anonymized usage patterns. We do not sell or share campaign-level data with third parties.',
    ],
  },
  {
    title: 'Data Sharing & Retention',
    content: [
      'We never share identifiable advertising data with third parties except when required to provide the service (e.g., Supabase hosting and email delivery).',
      'All third-party processors are contractually obligated to follow GDPR, CCPA, and applicable privacy regulations.',
      'Tenant data is isolated at the database level using row-level security. Role-based access limits internal visibility to authorized support personnel.',
      'You can request deletion of your tenant and associated data at any time by emailing support@ads-chatbot.app. Data is permanently removed from production backups within 30 days.',
    ],
  },
  {
    title: 'Your Rights & Choices',
    content: [
      'Disconnect any advertising platform at any time from the Settings → Connected Accounts area to revoke data access.',
      'Request a copy of stored campaign data or personal information by contacting support@ads-chatbot.app.',
      'Update notification preferences and communication settings inside the application under Account Settings.',
      'File a complaint with your local data protection authority if you believe your rights have been violated.',
    ],
  },
  {
    title: 'Security Practices',
    content: [
      'AES-256 encryption for OAuth tokens and sensitive fields, with keys stored in a dedicated secrets vault.',
      'TLS 1.2+ enforced for data in transit between the application, Supabase, and advertising APIs.',
      'Continuous monitoring for rate limits, anomalous API traffic, and unauthorized access attempts.',
      'Role-based access controls, audit logging, and minimum privilege standards for all personnel.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-6 rounded-2xl bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-900/90">
          <header className="space-y-2 text-left">
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Privacy Policy
            </p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Protecting Your Advertising Data
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: November 13, 2025
            </p>
          </header>

          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
            Marketing Analytics Chatbot (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) helps
            agencies connect Google Ads, Meta Ads, and LinkedIn Ads accounts to deliver actionable
            insights. This privacy policy describes how we collect, use, store, and protect the
            information you provide when using the Service. By connecting your ad platforms, you
            agree to this policy.
          </p>

          <div className="space-y-8">
            {sections.map(section => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  {section.content.map(item => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300">
              If you have questions about this policy or wish to exercise your privacy rights,
              please email{' '}
              <a
                href="mailto:support@ads-chatbot.app"
                className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                support@ads-chatbot.app
              </a>{' '}
              or open a support ticket inside the application. We respond to all requests within 5
              business days.
            </p>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 pt-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <span>© {new Date().getFullYear()} Marketing Analytics Chatbot. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link
                href="/terms-of-service"
                className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                Terms of Service
              </Link>
              <Link
                href="/"
                className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                Home
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}

