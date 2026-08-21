import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  if ((pathname.startsWith("/homeowner") || pathname.startsWith("/consultant")) && !session) {
    const login = new URL("/login", request.url);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/homeowner/:path*", "/consultant/:path*"],
};
