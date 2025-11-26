'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, MessageSquare, Settings, RefreshCw, LogOut, ChevronDown, Play, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const navItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Overview' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'AI Chat' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

// Helper to set demo mode cookie
function setDemoModeCookie(enabled: boolean) {
  if (enabled) {
    document.cookie = 'demo_mode=true; path=/; max-age=86400; SameSite=Lax';
  } else {
    document.cookie = 'demo_mode=; path=/; max-age=0';
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Always check auth first, then determine if demo mode applies
  useEffect(() => {
    const checkAuthAndDemoMode = async () => {
      // Check for demo mode in URL params or cookie
      const urlParams = new URLSearchParams(window.location.search);
      const demoFromUrl = urlParams.get('demo') === 'true';
      const demoFromCookie = document.cookie.includes('demo_mode=true');
      
      // Always check auth first
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // If user is logged in, ALWAYS clear demo mode
      if (user) {
        localStorage.removeItem('demo_mode');
        setDemoModeCookie(false);
        setIsDemoMode(false);
        setLoading(false);
        return;
      }
      
      // User is NOT logged in - check if demo mode is requested
      const demoMode = localStorage.getItem('demo_mode') === 'true' || demoFromUrl || demoFromCookie;
      
      if (demoMode) {
        // Set demo mode for unauthenticated users (both localStorage and cookie)
        localStorage.setItem('demo_mode', 'true');
        setDemoModeCookie(true);
        setIsDemoMode(true);
        setLoading(false);
      } else {
        // Not logged in and not in demo mode - redirect to login
        router.push('/login');
      }
    };
    
    checkAuthAndDemoMode();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // If user logs in, clear demo mode
      if (session?.user) {
        localStorage.removeItem('demo_mode');
        setDemoModeCookie(false);
        setIsDemoMode(false);
      } else if (!localStorage.getItem('demo_mode') && !document.cookie.includes('demo_mode=true')) {
        // User logged out and not in demo mode
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSync = async () => {
    if (isDemoMode) return; // Don't sync in demo mode
    
    setSyncing(true);
    try {
      await fetch('/api/sync-data', { method: 'POST' });
    } catch (error) {
      console.error('Sync error:', error);
    }
    setSyncing(false);
  };

  const handleSignOut = async () => {
    // Clear demo mode when signing out
    localStorage.removeItem('demo_mode');
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleExitDemo = () => {
    localStorage.removeItem('demo_mode');
    setDemoModeCookie(false);
    router.push('/login');
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'D';
  const displayEmail = user?.email || 'Demo User';

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Marketing Analytics"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg font-semibold text-blue-400">Analytics</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 border-r border-white/10 p-6 flex flex-col
        bg-gray-900 lg:bg-transparent
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        pt-20 lg:pt-6
      `}>
        {/* Logo - Desktop Only */}
        <Link href="/dashboard" className="hidden lg:flex items-center gap-3 mb-8">
          <Image
            src="/logo.png"
            alt="Marketing Analytics"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="text-xl font-semibold text-blue-400">Marketing Analytics</span>
        </Link>

        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <Play className="w-4 h-4" />
              Demo Mode
            </div>
            <p className="text-xs text-gray-400 mt-1">Viewing sample data</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sync Button - Only show when logged in */}
        {!isDemoMode && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
        )}

        {/* User Profile / Demo Controls */}
        <div className="mt-6 relative" ref={userMenuRef}>
          {isDemoMode ? (
            <button
              onClick={handleExitDemo}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center">
                <Play className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Demo Mode</p>
                <p className="text-xs text-gray-500">Click to exit</p>
              </div>
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/30 border border-purple-500/50 flex items-center justify-center">
                  <span className="text-purple-300 font-semibold">{userInitial}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{displayEmail}</p>
                  <p className="text-xs text-gray-500">Logged in</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-white/10">
                    <p className="text-sm font-medium">{displayEmail}</p>
                    <p className="text-xs text-gray-500">Account</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-6 pt-20 lg:pt-6">
        {children}
      </main>
    </div>
  );
}
