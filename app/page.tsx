"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import MagneticButton from "@/components/MagneticButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Trophy } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Subject {
    marks: number | "";
    credits: number | "";
}

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    const [subjectCount, setSubjectCount] = useState(8);
    // const [semester, setSemester] = useState<4 | 5>(5); // Hardcoded to 5
    const semester = 5;
    const [subjects, setSubjects] = useState<Subject[]>(Array(8).fill({ marks: "", credits: "" }));
    const [cgpa, setCgpa] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Auth redirect
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Initial Animation
    useEffect(() => {
        if (containerRef.current) {
            gsap.to(".reveal-hero", {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            });
        }
    }, [status]);

    // Handle Subject Count Change
    const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(e.target.value);
        setSubjectCount(count);
        setSubjects(prev => {
            const newSubjects = [...prev];
            if (count > prev.length) {
                for (let i = prev.length; i < count; i++) {
                    newSubjects.push({ marks: "", credits: "" });
                }
            } else {
                newSubjects.splice(count);
            }
            return newSubjects;
        });
    };

    const updateSubject = (index: number, field: keyof Subject, value: string) => {
        const newSubjects = [...subjects];
        const numValue = value === "" ? "" : parseFloat(value);
        // @ts-ignore
        newSubjects[index] = { ...newSubjects[index], [field]: numValue };
        setSubjects(newSubjects);
    };

    const calculateGradePoint = (marks: number) => {
        if (marks >= 90) return 10;
        if (marks >= 75) return 9;
        if (marks >= 65) return 8;
        if (marks >= 55) return 7;
        if (marks >= 50) return 6;
        if (marks >= 45) return 5;
        if (marks >= 40) return 4;
        return 0;
    };

    const handleCalculate = async () => {
        let totalPoints = 0;
        let totalCredits = 0;
        let isValid = true;

        subjects.forEach(sub => {
            if (sub.marks === "" || sub.credits === "") {
                isValid = false;
                return;
            }
            const gradePoint = calculateGradePoint(sub.marks as number);
            totalPoints += gradePoint * (sub.credits as number);
            totalCredits += (sub.credits as number);
        });

        if (!isValid || totalCredits === 0) {
            alert("Please fill all fields correctly.");
            return;
        }

        const calculatedCGPA = parseFloat((totalPoints / totalCredits).toFixed(2));
        setCgpa(calculatedCGPA);

        // Save to LocalStorage
        localStorage.setItem(`unsavedCGPA_sem${semester}`, calculatedCGPA.toString());

        // Save to DB
        await fetch("/api/save-cgpa", {
            method: "POST",
            body: JSON.stringify({ actualCGPA: calculatedCGPA, semester }),
        });
    };

    const handleClear = async () => {
        setCgpa(null);
        localStorage.removeItem(`unsavedCGPA_sem${semester}`);
        // Optionally clear from DB if user explicitly clears, but spec says "Clear My CGPA" sets to null via API
        await fetch("/api/save-cgpa", {
            method: "POST",
            body: JSON.stringify({ actualCGPA: null, semester }),
        });
    };

    const handleSignOut = async () => {
        // Check for unsaved data in localstorage before signing out as per spec
        // The spec says: "Before signing out, check `localStorage` for any "unsavedCGPA". If found, fire a request to `/api/save-cgpa` *before* clearing the session."
        // Since every calculation already saves to API, this is a fallback.

        const stored = localStorage.getItem(`unsavedCGPA_sem${semester}`);
        if (stored) {
            await fetch("/api/save-cgpa", {
                method: "POST",
                body: JSON.stringify({ actualCGPA: stored, semester }),
            });
        }
        localStorage.removeItem(`unsavedCGPA_sem${semester}`);
        await signOut({ callbackUrl: "/login" });
    };

    if (status === "loading") return <div className="h-screen w-full flex items-center justify-center text-zinc-500">Loading Arena...</div>;

    return (
        <div ref={containerRef} className="min-h-screen p-4 md:p-8 pb-32 flex flex-col items-center">
            {/* Header */}
            <header className="w-full flex flex-col md:flex-row justify-between items-center mb-16 gap-8 md:gap-0 max-w-6xl reveal-hero opacity-0 translate-y-8">
                <div className="flex items-center gap-4 flex-col md:flex-row text-center md:text-left">
                    <div className="relative w-16 h-16 md:w-20 md:h-20">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">CGPA CALCULATOR</h1>
                        <p className="text-zinc-500 tracking-widest text-sm md:text-base mt-2">WELCOME TO TUSHAR'S ARENA</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Link href="/leaderboard">
                        <MagneticButton className="px-6 py-3 glass rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm font-bold">LEADERBOARD</span>
                        </MagneticButton>
                    </Link>
                    <MagneticButton onClick={handleSignOut} className="px-4 py-3 glass rounded-full hover:bg-red-500/20 text-red-400 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </MagneticButton>
                </div>
            </header>

            {/* Main Calculator */}
            <main className="w-full max-w-4xl flex flex-col items-center gap-12 reveal-hero opacity-0 translate-y-8">


                {/* Semester Selector Removed as per request - Hardcoded to Sem 5 */}
                {/* <div className="w-full glass p-1 rounded-xl flex gap-1">...</div> */}

                {/* Slider */}
                <div className="w-full glass p-8 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <label className="text-zinc-400 text-sm uppercase tracking-widest font-bold">Subject Count</label>
                        <span className="text-4xl font-bold text-white">{subjectCount}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="15"
                        value={subjectCount}
                        onChange={handleCountChange}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>

                {/* Inputs */}
                <div className="w-full grid md:grid-cols-2 gap-4">
                    {subjects.map((sub, i) => (
                        <div key={i} className="glass p-6 rounded-xl flex gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 text-xs font-bold">
                                {i + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-zinc-600 font-bold">Marks (0-100)</label>
                                    <input
                                        type="number"
                                        placeholder="Marks"
                                        value={sub.marks}
                                        onChange={(e) => updateSubject(i, 'marks', e.target.value)}
                                        className="bg-transparent border-b border-zinc-700 text-white p-1 focus:border-white focus:outline-none text-right font-mono"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-zinc-600 font-bold">Credits</label>
                                    <input
                                        type="number"
                                        placeholder="Cr"
                                        value={sub.credits}
                                        onChange={(e) => updateSubject(i, 'credits', e.target.value)}
                                        className="bg-transparent border-b border-zinc-700 text-white p-1 focus:border-white focus:outline-none text-right font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions & Result */}
                <div className="flex flex-col items-center gap-8 w-full">
                    <div className="flex gap-4">
                        <MagneticButton onClick={handleCalculate} className="px-12 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform">
                            CALCULATE CGPA
                        </MagneticButton>
                        {cgpa && (
                            <MagneticButton onClick={handleClear} className="px-6 py-4 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white transition-colors rounded-full text-sm">
                                CLEAR
                            </MagneticButton>
                        )}
                    </div>

                    {cgpa !== null && (
                        <div className="text-center animate-in zoom-in duration-500">
                            <p className="text-zinc-500 text-sm tracking-[0.2em] mb-2 uppercase">Your Performance</p>
                            <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                                {cgpa}
                            </h2>
                            <div className="mt-4 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 inline-block">
                                {cgpa >= 10 ? "Exemplary Performance" :
                                    cgpa >= 6.5 ? "First Division" :
                                        cgpa >= 5.0 ? "Second Division" :
                                            cgpa >= 4.0 ? "Third Division" : "Fail"}
                            </div>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
