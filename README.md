# Marketing Analytics Chatbot

An AI-powered marketing analytics platform that provides intelligent insights across Google Ads, Meta Ads, and LinkedIn Ads campaigns.

## 🚀 Features

- **Unified Dashboard**: View all your campaigns across platforms in one place
- **AI Assistant**: Chat with Claude 3.5 Sonnet for intelligent campaign insights
- **Multi-Tenant Architecture**: Secure, isolated data for each organization
- **Platform Integrations**: Connect Google Ads, Meta Ads, and LinkedIn Ads
- **Real-Time Analytics**: Track impressions, clicks, conversions, ROAS, and more
- **Dark Mode**: Beautiful UI with light/dark theme support
- **Secure Authentication**: Built on Supabase Auth with Row Level Security

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: Anthropic Claude 3.5 Sonnet
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel
- **Version Control**: GitHub

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Anthropic API key
- Vercel account (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/nfredmond/ads_chatbot.git
cd ads_chatbot/ads-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

## 📊 Database Schema

The application uses a multi-tenant PostgreSQL database with the following tables:

- `profiles` - User profiles with tenant association
- `tenants` - Organization/tenant management
- `ad_accounts` - Connected advertising platform accounts
- `campaigns` - Campaign data from all platforms
- `campaign_metrics` - Time-series performance data
- `conversations` - AI chat conversation history
- `messages` - Individual chat messages
- `insights` - AI-generated insights and recommendations

All tables have Row Level Security (RLS) enabled for secure multi-tenant isolation.

## 🎨 UI Components

Built with shadcn/ui components:
- Dashboard with metrics cards and charts
- AI chat interface with suggested questions
- Settings page for API key and platform configuration
- Authentication pages (login/signup)
- Dark mode toggle

## 🔐 Security

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- API keys encrypted and stored securely
- HTTPS everywhere
- CORS protection

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.
