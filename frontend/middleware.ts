import { NextRequest, NextResponse } from "next/server";

const authRoutes = new Set(["/signin", "/signup"]);

export function middleware(request: NextRequest) {
  const isAuthRoute = authRoutes.has(request.nextUrl.pathname);
  const hasToken = Boolean(request.cookies.get("token")?.value);

  // Authenticated users should not see login or registration pages again.
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup"],
};
