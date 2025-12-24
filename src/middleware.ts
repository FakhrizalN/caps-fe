import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Paths that require authentication
const protectedPaths = ['/dashboard', '/employee', '/survey', '/question', '/roles', '/unit', '/response']

// Paths that are public (exception from protected paths)
// These paths do not require authentication even though they match protected paths
const publicPaths = ['/survey/*/supervisor']

// Paths that only admin can access
const adminOnlyPaths = ['/employee', '/roles']

// Paths that should redirect to dashboard if already authenticated
const authPaths = ['/login']

// Helper function to check if a path matches a pattern with wildcard
function matchesPattern(pathname: string, pattern: string): boolean {
  // Convert pattern to regex, replacing * with regex wildcard
  const regexPattern = pattern.replace(/\*/g, '[^/]+')
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(pathname)
}

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
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Allow access to auth pages without token
    return NextResponse.next()
  }

  // Check if the current path is a public path (exception from protected)
  const isPublicPath = publicPaths.some(pattern => matchesPattern(pathname, pattern))

  // If it's a public path, allow access without authentication
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => {
    // Exact match for root path
    if (path === '/dashboard') {
      return pathname === '/dashboard'
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

  // Check if the current path is admin-only
  const isAdminOnlyPath = adminOnlyPaths.some(path => pathname.startsWith(path))

  // Check user role for admin-only routes
  if (isAdminOnlyPath && accessToken) {
    // Get role from cookie (you may need to store this during login)
    const userRole = request.cookies.get('user_role')?.value

    // Redirect non-admin users to dashboard
    if (userRole?.toLowerCase() !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
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
