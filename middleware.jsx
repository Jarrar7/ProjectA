import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY);

export function middleware(req) {
    const url = req.nextUrl.pathname;

    const publicRoutes = ['/', '/api/auth/login', '/api/auth/reset-password'];

    if (
        publicRoutes.includes(url) ||
        url.startsWith('/_next') ||
        url.startsWith('/static') ||
        url.startsWith('/favicon.ico')
    ) {
        return NextResponse.next();
    }

    const tokenCookie = req.cookies.get('token');
    const token = tokenCookie ? tokenCookie.value : null;

    if (!token) {
        console.error('No token found in cookies for protected route.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { payload } = jwtVerify(token, SECRET_KEY); // Use `jose` for JWT verification
        console.log('Decoded Token:', payload);
        req.user = payload; // Attach user info to the request
        return NextResponse.next();
    } catch (err) {
        console.error('Invalid Token:', err.message);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}