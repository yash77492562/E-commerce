import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/api', // API routes prefix
  '/_next', // Next.js internal routes
  '/favicon.ico',
  '/public'
]

// Helper to get domain configuration based on environment
const getDomainConfig = (request: NextRequest) => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const productionDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.yourdomain.com'

  return {
    domain: isDevelopment ? 'localhost' : productionDomain,
    port: isDevelopment ? ':3001' : '',
  }
}

// Helper to clear admin cookies
const clearAdminCookies = (response: NextResponse, request: NextRequest) => {
  const { domain } = getDomainConfig(request)
  
  response.cookies.set('userId', '', {
    path: '/',
    domain: domain,
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  
  return response
}

// Helper to check if the route is public
const isPublicRoute = (path: string): boolean => {
  return publicRoutes.some(route => path.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const { domain, port } = getDomainConfig(request)

  // Skip middleware for static files
  if (path.match(/(\.ico|\.png|\.jpg|\.jpeg|\.svg)$/)) {
    return NextResponse.next()
  }

  // Allow access to public routes without authentication
  if (isPublicRoute(path)) {
    return NextResponse.next()
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://${domain}${port}`
    const response = await fetch(`${baseUrl}/api/checkAdminLogin`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    const isAuthenticated = response.ok

    // If not authenticated, redirect to login page with callback URL
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', path)
      const redirectResponse = NextResponse.redirect(loginUrl)
      return clearAdminCookies(redirectResponse, request)
    }

    // For authenticated users, proceed but ensure cookies are properly scoped
    const nextResponse = NextResponse.next()
    
    // Set proper path and domain for admin cookies
    const cookies = request.cookies.getAll()
    cookies.forEach(cookie => {
      if (cookie.name === 'userId') {
        nextResponse.cookies.set(cookie.name, cookie.value, {
          ...cookie,
          path: '/',
          domain: domain,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
      }
    })
    
    return nextResponse

  } catch (error) {
    console.error('Middleware authentication error:', error)
    const loginUrl = new URL('/auth/login', request.url)
    const redirectResponse = NextResponse.redirect(loginUrl)
    return clearAdminCookies(redirectResponse, request)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image).*)',
  ],
}