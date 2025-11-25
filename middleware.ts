/**
 * Next.js Middleware
 * Handles authentication and initializes services
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Track if initialization has occurred
let isInitialized = false

/**
 * Initialize application services (runs once)
 */
async function initializeServices() {
  if (isInitialized) return

  try {
    // Dynamic import to avoid issues with Node.js APIs in Edge runtime
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.log('🚀 Initializing application services...')
    }

    // Initialize services in development/production Node.js runtime
    // Note: Some services like Redis and Winston might not work in Edge runtime
    // They'll initialize lazily when first accessed
    
    isInitialized = true
    
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.log('✅ Application services initialized')
    }
  } catch (error) {
    console.error('⚠️ Service initialization error:', error)
    // Don't block the app if initialization fails
  }
}

export async function middleware(request: NextRequest) {
  // Initialize services on first request
  if (!isInitialized) {
    await initializeServices()
  }

  // Handle Supabase authentication
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

