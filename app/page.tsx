'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, BarChart3, MessageSquare, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20">
          {/* Header */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AI Gateway Lab</span>
            </div>
            <Link 
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
            >
              Open Dashboard
            </Link>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered Analytics Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="text-white">Ads Analytics</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Analyze your advertising campaigns 
              across Google Ads, Meta Ads, and LinkedIn Ads with intelligent insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg glow-purple"
              >
                View Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard/chat"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                Chat with AI
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-24">
            <div className="card-gradient p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Metrics</h3>
              <p className="text-gray-400 text-sm">
                Connect to your database and view real campaign performance data.
              </p>
            </div>

            <div className="card-gradient p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
              <p className="text-gray-400 text-sm">
                Chat with an AI that can query your ads data and provide actionable insights.
              </p>
            </div>

            <div className="card-gradient p-6 rounded-2xl border border-white/10 hover:border-green-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Gateway</h3>
              <p className="text-gray-400 text-sm">
                Unified model access with OpenAI and Anthropic.
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-24 text-center">
            <p className="text-gray-500 text-sm mb-4">Built with</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['AI SDK', 'Next.js 15', 'React 19', 'Tailwind CSS'].map((tech) => (
                <span 
                  key={tech}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

