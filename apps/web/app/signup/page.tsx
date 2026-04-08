"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

const perks = [
    { text: "Free forever for personal use", emoji: "🎁" },
    { text: "Unlimited Zap runs", emoji: "⚡" },
    { text: "Webhook support built in", emoji: "🔗" },
    { text: "Solana & Email integrations", emoji: "◎" },
];

export default function Signup() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.username || !form.password) {
            toast.error("Please fill in all fields");
            return;
        }
        if (form.name.length < 3) {
            toast.error("Name must be at least 3 characters");
            return;
        }
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/user/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Signup failed");
            localStorage.setItem("token", data.token);
            toast.success("Account created! Welcome to FlowMate!");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FEFCE8] flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#06D6A0] relative overflow-hidden border-r-2 border-black">
                {/* Decorative shapes */}
                <div className="absolute top-20 right-12 w-24 h-24 rounded-full bg-white border-2 border-black opacity-30" />
                <div className="absolute bottom-24 right-24 w-16 h-16 rounded-xl bg-yellow-300 border-2 border-black rotate-12 opacity-50" />
                <div className="absolute top-1/3 left-4 w-12 h-12 rounded-full bg-pink-400 border-2 border-black opacity-40" />

                <Link href="/" className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-black shadow-[3px_3px_0_#1a1a1a] flex items-center justify-center">
                        <Zap className="w-6 h-6 text-black fill-black" />
                    </div>
                    <span className="font-black text-2xl text-black">FlowMate</span>
                </Link>

                <div className="relative">
                    <div className="inline-block bg-yellow-300 border-2 border-black shadow-[3px_3px_0_#1a1a1a] rounded-xl px-4 py-2 mb-6">
                        <span className="text-xs font-black text-black uppercase tracking-wide">Free to start</span>
                    </div>
                    <h2 className="font-black text-4xl text-black leading-tight mb-4">
                        Build automations<br />that actually work.
                    </h2>
                    <p className="font-medium text-black/70 text-lg mb-8">Join thousands of teams saving hours every week.</p>

                    <ul className="space-y-3">
                        {perks.map((p, i) => (
                            <li key={i} className="flex items-center gap-3 bg-white/30 rounded-xl px-4 py-3 border-2 border-black/20">
                                <span className="text-xl">{p.emoji}</span>
                                <span className="text-sm font-bold text-black">{p.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-black/50 text-xs font-medium">© 2025 FlowMate. All rights reserved.</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col justify-center items-center p-8">
                {/* Mobile logo */}
                <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-yellow-300 border-2 border-black shadow-[3px_3px_0_#1a1a1a] flex items-center justify-center">
                        <Zap className="w-5 h-5 text-black fill-black" />
                    </div>
                    <span className="font-black text-xl text-black">FlowMate</span>
                </Link>

                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <div className="inline-block bg-pink-300 border-2 border-black shadow-[3px_3px_0_#1a1a1a] rounded-xl px-4 py-2 mb-4">
                            <h1 className="font-black text-2xl text-black">Create account 🚀</h1>
                        </div>
                        <p className="font-medium text-gray-600">Start automating in seconds — no credit card needed</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-black text-black mb-2">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-xl border-2 border-black bg-white text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[0_0_0_3px_#FFD60A] transition-all text-sm font-medium shadow-[3px_3px_0_#1a1a1a]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black mb-2">Username / Email</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-xl border-2 border-black bg-white text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[0_0_0_3px_#FFD60A] transition-all text-sm font-medium shadow-[3px_3px_0_#1a1a1a]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Min. 6 characters"
                                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-black bg-white text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[0_0_0_3px_#FFD60A] transition-all text-sm font-medium shadow-[3px_3px_0_#1a1a1a]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-2 h-2 rounded-full bg-gray-200 border border-black overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${form.password.length < 6 ? "w-1/3 bg-red-500" :
                                            form.password.length < 10 ? "w-2/3 bg-yellow-400" : "w-full bg-[#06D6A0]"
                                            }`}
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-white bg-black border-2 border-black shadow-[4px_4px_0_#FF4D6D] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#FF4D6D] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-base"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm font-medium text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-black text-black underline underline-offset-2 hover:text-[#FF4D6D] transition-colors">
                            Sign in →
                        </Link>
                    </p>

                    <p className="mt-4 text-center text-xs text-gray-500">
                        By signing up you agree to our{" "}
                        <span className="underline underline-offset-2 cursor-pointer font-semibold">Terms</span> and{" "}
                        <span className="underline underline-offset-2 cursor-pointer font-semibold">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
