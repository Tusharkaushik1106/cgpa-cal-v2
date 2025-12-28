"use client";

import { useState, useEffect } from "react";
import MagneticButton from "@/components/MagneticButton";
import Link from "next/link";
import { ArrowLeft, ArrowUpDown, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import clsx from "clsx";

interface UserData {
    username: string;
    guessedCGPA: number;
    actualCGPA: number;
    sem5Guessed: number;
    sem5Actual: number | null;
    sem4Guessed: number;
    sem4Actual: number | null;
    isAdmin: boolean;
}

export default function Leaderboard() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortAsc, setSortAsc] = useState(false);
    const [semester, setSemester] = useState<4 | 5>(5);

    // Admin state
    const [showAdmin, setShowAdmin] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/leaderboard");
            const data = await res.json();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const getDisplayData = (user: UserData) => {
        if (semester === 5) {
            return {
                actual: user.sem5Actual ?? user.actualCGPA,
                // Use sem5Guessed if available and non-zero, otherwise fallback to generic guessedCGPA
                guessed: (user.sem5Guessed && user.sem5Guessed > 0) ? user.sem5Guessed : user.guessedCGPA
            };
        } else {
            return {
                actual: user.sem4Actual,
                guessed: user.sem4Guessed
            };
        }
    };

    const handleSort = () => {
        const sorted = [...users].sort((a, b) => {
            const dataA = getDisplayData(a);
            const dataB = getDisplayData(b);
            // Handle nulls
            const valA = dataA.actual || 0;
            const valB = dataB.actual || 0;
            return sortAsc ? valA - valB : valB - valA;
        });
        setUsers(sorted);
        setSortAsc(!sortAsc);
    };

    const clearAllData = async () => {
        if (!adminPassword) return alert("Password required");

        const res = await fetch("/api/clear-all-cgpa", {
            method: "POST",
            body: JSON.stringify({ password: adminPassword })
        });

        if (res.ok) {
            alert("All data cleared.");
            fetchLeaderboard();
            setAdminPassword("");
            setShowAdmin(false);
        } else {
            alert("Failed. Check password.");
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
            <header className="w-full max-w-4xl flex justify-between items-center mb-12">
                <Link href="/">
                    <MagneticButton className="p-4 rounded-full glass hover:bg-white/10 text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </MagneticButton>
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600">
                    Leaderboard
                </h1>
                <div className="w-12"></div> {/* Spacer */}
            </header>

            <main className="w-full max-w-4xl flex flex-col gap-8">

                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 p-1 rounded-full glass">
                        {[4, 5].map((sem) => (
                            <button
                                key={sem}
                                onClick={() => setSemester(sem as 4 | 5)}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-xs font-bold transition-all",
                                    semester === sem ? "bg-white text-black shadow" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                SEM {sem}
                            </button>
                        ))}
                    </div>

                    <MagneticButton
                        onClick={handleSort}
                        className="px-6 py-2 rounded-full font-bold text-sm text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        Sort by CGPA ({sortAsc ? "ASC" : "DESC"})
                    </MagneticButton>
                </div>

                {/* Table */}
                <div className="glass rounded-2xl overflow-hidden border border-white/5 overflow-x-auto">
                    <div className="grid grid-cols-4 p-4 border-b border-white/10 text-xs font-bold uppercase text-zinc-500 tracking-widest">
                        <div className="pl-4">User</div>
                        <div className="text-center">Guessed</div>
                        <div className="text-center">Actual</div>
                        <div className="text-center">Diff</div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-zinc-500 animate-pulse">Loading Arena Data...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">No data found. Start calculating!</div>
                    ) : (
                        users.map((user, i) => {
                            const { actual, guessed } = getDisplayData(user);

                            // If actual is null/undefined, treat as not present
                            if (typeof actual !== 'number') return null;

                            const diff = Math.abs(guessed - actual).toFixed(2);
                            return (
                                <div key={user.username} className="grid grid-cols-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center animate-in fade-in slide-in-from-bottom-2">
                                    <div className="pl-4 font-bold text-white capitalize">{user.username}</div>
                                    <div className="flex justify-center">
                                        {guessed === 0 ? (
                                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap border border-red-500/30">
                                                you are not a homie dwag
                                            </span>
                                        ) : (
                                            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-mono font-bold">
                                                {guessed}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-center">
                                        <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono font-bold">
                                            {actual}
                                        </span>
                                    </div>
                                    <div className="flex justify-center">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-mono font-bold",
                                            parseFloat(diff) < 0.2 ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"
                                        )}>
                                            {diff}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Admin Panel */}
                {session?.user?.name === "tushar" && (
                    <div className="mt-12 p-8 border border-red-900/30 rounded-2xl bg-red-950/10">
                        <h3 className="text-red-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            Admin Zone
                        </h3>
                        {!showAdmin ? (
                            <button
                                onClick={() => setShowAdmin(true)}
                                className="text-xs text-red-400 underline underline-offset-4 hover:text-red-300"
                            >
                                Reveal Controls
                            </button>
                        ) : (
                            <div className="flex gap-4 items-center animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="password"
                                    placeholder="Admin Password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    className="bg-black/50 border border-red-900/50 rounded px-4 py-2 text-red-200 text-sm focus:outline-none focus:border-red-500"
                                />
                                <button
                                    onClick={clearAllData}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    NUKE ALL DATA
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}
