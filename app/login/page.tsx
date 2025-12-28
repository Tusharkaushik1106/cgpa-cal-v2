"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import MagneticButton from "@/components/MagneticButton";
import { useRouter } from "next/navigation";
import Image from "next/image";
// @ts-ignore
import logo2 from "../../public/logo2.png";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await signIn("credentials", { username, callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black relative overflow-hidden px-4">
            <div className="z-20 w-full max-w-md p-8 glass rounded-2xl border border-white/10 shadow-2xl relative">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-full h-40 relative rounded-lg overflow-hidden border border-white/10 bg-black/50">
                        {/* Placeholder for the user requested image path, assuming it exists publically or just alt text */}
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <div className="relative w-full h-full">
                                <Image
                                    src={logo2}
                                    alt="Logo"
                                    fill
                                    className="object-contain opacity-90"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                        ENTER THE ARENA
                    </h1>

                    <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-lg focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all text-center text-lg placeholder:text-zinc-600"
                            required
                        />

                        <MagneticButton
                            type="submit"
                            className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors rounded-lg"
                        >
                            Login
                        </MagneticButton>
                    </form>
                </div>
            </div>

            <footer className="absolute bottom-10 z-20 text-center">
                <p className="text-zinc-500 text-sm tracking-widest">
                    Created by <span className="text-white font-bold text-lg block mt-1">MASTER TUSHAR KAUSHIK</span>
                </p>
            </footer>
        </div>
    );
}
