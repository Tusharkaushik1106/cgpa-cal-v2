import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnLogin = req.nextUrl.pathname.startsWith("/login");
    const isApi = req.nextUrl.pathname.startsWith("/api");
    // Basic static file exclusion is handled by matcher, but keeping checks if needed

    if (isApi) return;

    if (isOnLogin) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/", req.nextUrl));
        }
        return;
    }

    if (!isLoggedIn) {
        return Response.redirect(new URL("/login", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
