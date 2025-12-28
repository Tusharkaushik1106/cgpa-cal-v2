import NextAuth, { User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authConfig } from "./auth.config";

const preRegisteredUsers = [
    { username: "divij", guess: 9.38 },
    { username: "akshar", guess: 9.21 },
    { username: "tushar", guess: 8.74, actual: 9.08, isAdmin: true },
    { username: "piyush", guess: 8.54 },
    { username: "purav", guess: 8.34 },
    { username: "sarthak", guess: 7.74 },
    { username: "singh", guess: 7.63 },
    { username: "laksh", guess: 9.12 },
    { username: "ahuja", guess: 8.06 },
    { username: "gaurav", guess: 9.16 },
    { username: "drip queen", guess: 8.5 },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
            },
            async authorize(credentials): Promise<NextAuthUser | null> {
                if (!credentials?.username) return null;

                await dbConnect();

                const usernameInput = (credentials.username as string).toLowerCase().trim();

                // Check DB first
                let user = await User.findOne({ username: usernameInput });

                if (user) {
                    return {
                        id: user._id.toString(),
                        name: user.username,
                        email: user.isAdmin ? "admin" : "user",
                    };
                }

                // Check pre-registered list
                const preReg = preRegisteredUsers.find(u => u.username.toLowerCase() === usernameInput);

                if (preReg) {
                    // Create new user from pre-registered data
                    const newUser = await User.create({
                        username: preReg.username,
                        guessedCGPA: preReg.guess,
                        // @ts-ignore
                        actualCGPA: preReg.actual || null,
                        isAdmin: preReg.isAdmin || false
                    });
                    return {
                        id: newUser._id.toString(),
                        name: newUser.username,
                        email: newUser.isAdmin ? "admin" : "user",
                    };
                }

                // Create default user
                const defaultUser = await User.create({
                    username: usernameInput,
                    guessedCGPA: 0, // Default or require input later? Spec says "create a default user"
                    isAdmin: false
                });

                return {
                    id: defaultUser._id.toString(),
                    name: defaultUser.username,
                    email: "user",
                };
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
});
