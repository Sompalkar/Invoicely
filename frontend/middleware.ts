import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the user is authenticated by looking for auth cookies
  const isAuthenticated =
    request.cookies.has("auth_token") || request.cookies.has("auth0_token") || request.cookies.has("appSession")

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login" || path === "/register"

  // If the user is not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the user is authenticated and trying to access login or register, redirect to dashboard
  if (isAuthenticated && isPublicPath && path !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
