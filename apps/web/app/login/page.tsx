"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export default function Login() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/user/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Login failed");
            localStorage.setItem("token", data.token);
            toast.success("Welcome back!");
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
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-black relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-16 right-16 w-32 h-32 rounded-full bg-yellow-300 border-4 border-yellow-300 opacity-20" />
                <div className="absolute bottom-32 left-8 w-20 h-20 rounded-full bg-pink-400 opacity-20" />
                <div className="absolute top-1/2 right-8 w-16 h-16 rounded-full bg-cyan-400 opacity-20" />

                <Link href="/" className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-300 border-2 border-white shadow-[3px_3px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
                        <Zap className="w-6 h-6 text-black fill-black" />
                    </div>
                    <span className="font-black text-2xl text-white">FlowMate</span>
                </Link>

                <div className="relative">
                    <h2 className="font-black text-4xl text-white leading-tight mb-4">
                        Your automations<br />are waiting. ⚡
                    </h2>
                    <p className="text-gray-400 font-medium text-lg mb-10">Sign in to manage your workflows and watch them run.</p>

                    {/* Decorative workflow cards */}
                    <div className="space-y-3">
                        {[
                            { flow: "Webhook → Email", color: "bg-yellow-300", status: "Running" },
                            { flow: "Schedule → Solana", color: "bg-cyan-300", status: "Running" },
                            { flow: "HTTP → Slack", color: "bg-pink-300", status: "Running" },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 ${item.color} rounded-xl px-4 py-3 border-2 border-white/20`}>
                                <div className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
                                <span className="text-sm font-black text-black">{item.flow}</span>
                                <span className="ml-auto text-xs font-bold text-black/60 bg-white/40 px-2 py-0.5 rounded-full">{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-gray-600 text-xs font-medium">© 2025 FlowMate. All rights reserved.</p>
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
                        <div className="inline-block bg-yellow-300 border-2 border-black shadow-[3px_3px_0_#1a1a1a] rounded-xl px-4 py-2 mb-4">
                            <h1 className="font-black text-2xl text-black">Welcome back 👋</h1>
                        </div>
                        <p className="font-medium text-gray-600">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-black text-black mb-2">Username</label>
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
                                    placeholder="••••••••"
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
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-white bg-black border-2 border-black shadow-[4px_4px_0_#06D6A0] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#06D6A0] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-base"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm font-medium text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-black text-black underline underline-offset-2 hover:text-[#06D6A0] transition-colors">
                            Sign up free →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
