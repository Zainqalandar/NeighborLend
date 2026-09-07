import { NextRequest, NextResponse } from "next/server";

const authRoutes = new Set(["/signin", "/signup"]);
const protectedRoutes = new Set(["/requests"]);

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.has(pathname);
  const isProtectedRoute = protectedRoutes.has(pathname);
  const hasToken = Boolean(request.cookies.get("token")?.value);

  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedRoute && !hasToken) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/requests"],
};
