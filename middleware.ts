import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const role = (req.auth?.user as any)?.role;

  const isAuthRoute = ["/login", "/signup"].includes(nextUrl.pathname);
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isProfileRoute = nextUrl.pathname === "/profile";

  if (isProfileRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard/profile", nextUrl));
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === "owner" || role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/login", "/signup", "/profile", "/dashboard/:path*"],
};

