import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Paths that require authentication
const protectedPaths = ['/', '/dashboard', '/employee', '/survey', '/question', '/unit']

// Paths that should redirect to dashboard if already authenticated
const authPaths = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookie or check if it exists in localStorage (client-side only)
  const accessToken = request.cookies.get('access_token')?.value
  
  // Check if the current path is an auth path first
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))
  
  // If it's an auth path, handle it before checking protected paths
  if (isAuthPath) {
    // Redirect to dashboard if trying to access auth pages while authenticated
    if (accessToken) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    // Allow access to auth pages without token
    return NextResponse.next()
  }
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => {
    // Exact match for root path
    if (path === '/') {
      return pathname === '/'
    }
    // StartsWith for other paths
    return pathname.startsWith(path)
  })
  
  // Redirect to login if trying to access protected route without token
  if (isProtectedPath && !accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
}
