import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that don't require authentication
const publicPaths = ['/login', '/register'];

// Paths that require authentication
const protectedPaths = ['/student', '/teacher', '/admin'];

// Helper function to verify JWT token
async function verifyAuth(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars-long');
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Allow API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/manifest.json')) {
    return NextResponse.next();
  }
  
  // For root path, redirect to login immediately for security
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // For protected paths, check authentication
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token found, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify token
    const isValid = await verifyAuth(token);
    if (!isValid) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Token valid, allow access
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|icon-192.png.txt|manifest.json).*)',
  ],
};
