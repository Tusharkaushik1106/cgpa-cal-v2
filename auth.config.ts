import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.role) {
                // @ts-ignore
                session.user.email = token.role as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.email;
            }
            return token;
        }
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
