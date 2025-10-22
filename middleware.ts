import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // For now, allow all requests to pass through
  // In production, you might want to add more sophisticated auth checks here
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - auth (auth routes)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
