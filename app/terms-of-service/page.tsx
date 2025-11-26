import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Marketing Analytics',
  description:
    'Review the contractual terms governing your use of the Marketing Analytics platform, including acceptable use, account responsibilities, and service commitments.',
}

const commitments = [
  {
    title: 'Account Responsibilities',
    items: [
      'Provide accurate organization and billing information and keep administrator contact details up to date.',
      'Safeguard login credentials and restrict access to authorized team members only. You are responsible for activity performed under your account.',
      'Promptly notify us if you suspect unauthorized access or discover a security issue so we can help remediate it.',
    ],
  },
  {
    title: 'Acceptable Use',
    items: [
      'Use the Service solely to analyze advertising performance and automate reporting for accounts you are authorized to manage.',
      'Comply with all applicable laws, Google Ads policies, Meta Marketing API policies, and LinkedIn Marketing Developer Terms.',
      'Do not attempt to reverse engineer, probe, or overload the Service, and do not harvest data about other tenants or users.',
      'Refrain from uploading malicious code or using the Service to send spam, unauthorized email, or unapproved marketing communications.',
    ],
  },
  {
    title: 'Data Rights & Ownership',
    items: [
      'You retain ownership of all advertising data retrieved through your connected platforms. We act as a processor on your behalf.',
      'We may generate aggregated, anonymized analytics to improve the Service, but we will never disclose client-identifiable metrics without consent.',
      'If you disconnect a platform or close your account, we will remove associated campaign data from active systems within 30 days.',
    ],
  },
  {
    title: 'Service Commitments',
    items: [
      'We provide a best-effort uptime target of 99.5% measured monthly, excluding scheduled maintenance and third-party outages.',
      'Critical fixes and security patches are deployed as quickly as possible. You agree to keep client applications updated to supported versions.',
      'Email and in-app support is available Monday–Friday, 9am–6pm Eastern Time, excluding U.S. federal holidays.',
    ],
  },
  {
    title: 'Billing & Termination',
    items: [
      'Invoices are due on the schedule defined in your subscription plan. Late payments may lead to temporary suspension until the balance is cleared.',
      "Either party may terminate with 30 days' written notice. We may terminate immediately for material breach, abuse, or unpaid invoices older than 30 days.",
      'Upon termination you may request an export of campaign data and logs collected by the Service within 15 days.',
    ],
  },
]

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <div className="container mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-6 rounded-2xl bg-gray-900/90 p-8 shadow-xl backdrop-blur-sm border border-white/10">
          <header className="space-y-2 text-left">
            <p className="text-sm font-medium uppercase tracking-wide text-purple-400">
              Terms of Service
            </p>
            <h1 className="text-3xl font-bold text-white">
              Agreement for Using Marketing Analytics
            </h1>
            <p className="text-sm text-gray-400">
              Last updated: November 25, 2025
            </p>
          </header>

          <p className="text-base leading-relaxed text-gray-300">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Marketing Analytics
            platform, including any dashboards, APIs, and documentation (collectively, the
            &ldquo;Service&rdquo;). By accessing the Service or integrating your advertising
            accounts, you agree to be bound by these Terms and our{' '}
            <Link
              href="/privacy-policy"
              className="font-medium text-purple-400 underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            . If you are accepting these Terms on behalf of an organization, you affirm that you
            have authority to bind that organization.
          </p>

          <div className="space-y-8">
            {commitments.map(section => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-2xl font-semibold text-white">
                  {section.title}
                </h2>
                <ul className="space-y-2 text-gray-300">
                  {section.items.map(item => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">
              Modifications & Dispute Resolution
            </h2>
            <p className="text-gray-300">
              We may update these Terms to reflect changes in features, regulatory requirements, or
              business practices. We will provide at least 30 days' notice before material updates
              take effect. Continued use of the Service after updates indicates acceptance. The
              Terms are governed by the laws of the State of New York, excluding conflict-of-law
              principles. Any disputes will be handled through binding arbitration in New York
              County unless both parties agree to another venue.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <p className="text-gray-300">
              Questions regarding these Terms may be sent to{' '}
              <a
                href="mailto:support@ads-chatbot.app"
                className="font-medium text-purple-400 underline-offset-4 hover:underline"
              >
                support@ads-chatbot.app
              </a>
              . We recommend including your tenant ID or organization name so we can respond
              promptly.
            </p>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} Marketing Analytics. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy-policy"
                className="font-medium text-purple-400 underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/"
                className="font-medium text-purple-400 underline-offset-4 hover:underline"
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
