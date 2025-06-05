import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/home', '/dashboard', '/dashboard/:path*'])

const isAdminRoute = (path: string) => {
  return path.startsWith('/admin') && path !== '/admin/login'
}

const isAdminApiRoute = (path: string) => {
  return path.startsWith('/api/admin') || 
         path.startsWith('/api/admin/question-banks')
}

export default clerkMiddleware(async (auth, req: NextRequest) =>{
  const { pathname } = req.nextUrl
  const { userId, redirectToSignIn } = await auth();

  // Allow all non-admin API routes to pass through without authentication
  if (pathname.startsWith('/api/') && !isAdminApiRoute(pathname)) {
    console.log('API route access allowed without authentication:', pathname);
    return NextResponse.next();
  }

  // Check for admin-specific API routes
  if (isAdminApiRoute(pathname)) {
    // Get the admin auth cookie
    const adminAuthCookie = req.cookies.get('admin-auth')
    
    // If no admin auth cookie, return 401
    if (!adminAuthCookie || adminAuthCookie.value !== 'true') {
      console.log('Unauthorized access to admin API route')
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }
    
    // If they have the admin auth cookie, continue to the admin API route
    return NextResponse.next()
  }

  // Check for admin UI routes (except login page)
  if (isAdminRoute(pathname)) {
    // Get the admin auth cookie
    const adminAuthCookie = req.cookies.get('admin-auth')
    
    // If no admin auth cookie, redirect to admin login
    if (!adminAuthCookie || adminAuthCookie.value !== 'true') {
      console.log('Redirecting unauthenticated user to admin login')
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    
    // If they have the admin auth cookie, continue to the admin route
    return NextResponse.next()
  }
   if (!userId && isProtectedRoute(req)) {
    console.log('Redirecting to sign in...')
    return redirectToSignIn()
  }

  // For all other routes, just proceed
  return NextResponse.next()
})
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Specifically match admin routes
    '/admin/:path*',
    '/api/admin/:path*'
  ],
}