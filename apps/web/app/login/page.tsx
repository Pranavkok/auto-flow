"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = "http://localhost:3000";

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
        <div className="min-h-screen bg-hero-gradient flex">
            {/* Left panel - branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-emerald-gradient relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-amber blur-3xl" />
                </div>
                <Link href="/" className="relative flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary-foreground fill-current" />
                    </div>
                    <span className="font-display font-700 text-xl text-primary-foreground">FlowMate</span>
                </Link>

                <div className="relative">
                    <h2 className="font-display text-4xl font-700 text-primary-foreground leading-tight mb-4">
                        Your automations are waiting.
                    </h2>
                    <p className="text-primary-foreground/70 text-lg">Sign in to manage your workflows and watch them run.</p>

                    {/* Decorative workflow cards */}
                    <div className="mt-10 space-y-3">
                        {["Gmail → Notion", "Webhook → Email", "Schedule → Solana"].map((flow, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-amber animate-pulse-soft" />
                                <span className="text-sm font-medium text-primary-foreground/90">{flow}</span>
                                <span className="ml-auto text-xs text-primary-foreground/50">Running</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-primary-foreground/40 text-xs">© 2025 FlowMate. All rights reserved.</p>
            </div>

            {/* Right panel - form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8">
                {/* Mobile logo */}
                <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-emerald-gradient flex items-center justify-center shadow-emerald">
                        <Zap className="w-4 h-4 text-primary-foreground fill-current" />
                    </div>
                    <span className="font-display font-700 text-lg text-foreground">FlowMate</span>
                </Link>

                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h1 className="font-display text-3xl font-700 text-charcoal mb-2">Welcome back</h1>
                        <p className="text-muted-foreground">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-emerald-gradient text-primary-foreground shadow-emerald hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-semibold text-primary hover:underline underline-offset-2">
                            Sign up free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
