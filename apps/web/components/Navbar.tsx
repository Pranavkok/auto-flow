"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        router.push("/login");
    };

    const isActive = (path: string) => pathname === path;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
            <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-gradient flex items-center justify-center shadow-emerald group-hover:scale-105 transition-transform">
                        <Zap className="w-4 h-4 text-primary-foreground fill-current" />
                    </div>
                    <span className="font-display font-700 text-lg text-foreground tracking-tight">
                        FlowMate
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {!token ? (
                        <>
                            <Link
                                href="/"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/")
                                    ? "bg-primary-light text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="ml-2 px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-gradient text-primary-foreground shadow-emerald hover:opacity-90 transition-all"
                            >
                                Get Started
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/dashboard")
                                    ? "bg-primary-light text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/zap/create"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/zap/create")
                                    ? "bg-primary-light text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                            >
                                New Zap
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-2 animate-fade-up">
                    {!token ? (
                        <>
                            <Link href="/" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">Home</Link>
                            <Link href="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">Sign In</Link>
                            <Link href="/signup" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-semibold bg-emerald-gradient text-primary-foreground text-center transition-opacity hover:opacity-90">Get Started</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">Dashboard</Link>
                            <Link href="/zap/create" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">New Zap</Link>
                            <button onClick={handleLogout} className="px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 text-left transition-colors">Logout</button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};
