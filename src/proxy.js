import { NextResponse } from 'next/server';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Check for NextAuth session token in cookies
  const sessionToken = 
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  // Protect student-only routes
  const studentOnlyRoutes = ['/chat', '/profile/edit'];
  if (studentOnlyRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionToken) {
      // No session token, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Role checking will be handled in the page components
    // Proxy only checks for authentication presence
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/profile/edit/:path*'],
};

