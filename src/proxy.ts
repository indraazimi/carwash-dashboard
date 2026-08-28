import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Definisi route berdasarkan role
const roleBasedRoutes = {
    SUPERADMIN: ['/superadmin'],
    ADMIN: ['/admin'],
};

// Route yang bisa diakses tanpa login
const publicRoutes = ['/login', '/lacak'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rute publik /lacak dapat diakses langsung tanpa login dan tidak di-redirect ke apapun
    if (pathname === '/lacak' || pathname.startsWith('/lacak/')) {
        return NextResponse.next();
    }

    // Ambil token dan user dari cookie atau localStorage (via header)
    const token = request.cookies.get('token')?.value;
    const userCookie = request.cookies.get('user')?.value;

    // Parse user data
    let user = null;
    if (userCookie) {
        try {
            user = JSON.parse(decodeURIComponent(userCookie));
        } catch (error) {
            console.error('Failed to parse user cookie:', error);
        }
    }

    // Cek apakah route adalah public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/';

    // Jika belum login dan mencoba akses protected route
    if (!token && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Jika sudah login dan mencoba akses halaman login
    if (token && pathname === '/login') {
        // Redirect ke dashboard sesuai role
        if (user?.role === 'SUPERADMIN') {
            return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
        } else if (user?.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    // Validasi akses berdasarkan role
    if (user && !isPublicRoute) {
        const userRole = user.role as keyof typeof roleBasedRoutes;
        const allowedRoutes = roleBasedRoutes[userRole] || [];

        // Cek apakah user mencoba akses route yang tidak sesuai dengan rolenya
        const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

        if (!hasAccess) {
            // Redirect ke dashboard sesuai role mereka
            if (userRole === 'SUPERADMIN') {
                return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
            } else if (userRole === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
        }
    }

    return NextResponse.next();
}

// Konfigurasi matcher untuk route yang akan di-check oleh middleware/proxy
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
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
    ],
};
