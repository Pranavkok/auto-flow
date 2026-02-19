"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = "http://localhost:3000";

const perks = [
    "Free forever for personal use",
    "Unlimited Zap runs",
    "Webhook support built in",
    "Solana & Email integrations",
];

export default function Signup() {
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
            toast.success("Account created! Welcome to FlowMate 🎉");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-hero-gradient flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-amber-light to-cream">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-emerald/5 blur-3xl" />

                <Link href="/" className="relative flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-gradient flex items-center justify-center shadow-emerald">
                        <Zap className="w-5 h-5 text-primary-foreground fill-current" />
                    </div>
                    <span className="font-display font-700 text-xl text-charcoal">FlowMate</span>
                </Link>

                <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber/20 border border-amber/30 mb-6">
                        <span className="text-xs font-semibold text-amber-dark uppercase tracking-wide">Free to start</span>
                    </div>
                    <h2 className="font-display text-4xl font-700 text-charcoal leading-tight mb-4">
                        Build automations that actually work.
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8">Join thousands of teams saving hours every week.</p>

                    <ul className="space-y-3">
                        {perks.map((p, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-light flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 text-emerald" />
                                </div>
                                <span className="text-sm text-foreground">{p}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-muted-foreground text-xs">© 2025 FlowMate. All rights reserved.</p>
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
                        <h1 className="font-display text-3xl font-700 text-charcoal mb-2">Create your account</h1>
                        <p className="text-muted-foreground">Start automating in seconds — no credit card needed</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Username / Email</label>
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
                                    placeholder="Min. 6 characters"
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
                            {form.password && (
                                <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${form.password.length < 6 ? "w-1/3 bg-destructive" :
                                            form.password.length < 10 ? "w-2/3 bg-amber" : "w-full bg-emerald"
                                            }`}
                                    />
                                </div>
                            )}
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
                                    Create account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-2">
                            Sign in
                        </Link>
                    </p>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        By signing up you agree to our{" "}
                        <span className="underline underline-offset-2 cursor-pointer">Terms</span> and{" "}
                        <span className="underline underline-offset-2 cursor-pointer">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
