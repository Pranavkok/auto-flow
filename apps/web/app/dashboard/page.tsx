"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Plus, Zap, Calendar, Link2, ExternalLink, Loader2, AlertCircle, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = "http://localhost:3000";
const HOOKS_URL = "http://localhost:3002";

interface ZapAction {
    type?: { name: string };
    metadata?: any;
}

interface ZapTrigger {
    type?: { name: string };
}

interface ZapItem {
    id: string;
    triggerId?: string;
    actions?: ZapAction[];
    trigger?: ZapTrigger;
    createdAt?: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [zaps, setZaps] = useState<ZapItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchZaps = async () => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/zap`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) { localStorage.removeItem("token"); router.push("/login"); return; }
            if (!res.ok) throw new Error("Failed to fetch Zaps");
            const data = await res.json();
            setZaps(data.zaps || []);
        } catch (err: any) {
            setError(err.message || "Failed to load Zaps");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchZaps(); }, []);

    const getWebhookUrl = (zapId: string) => `${HOOKS_URL}/hooks/catch/1/${zapId}`;

    const copyWebhook = async (zapId: string) => {
        await navigator.clipboard.writeText(getWebhookUrl(zapId));
        setCopiedId(zapId);
        toast.success("Webhook URL copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                        <div>
                            <h1 className="font-display text-3xl font-700 text-charcoal mb-1">Your Zaps</h1>
                            <p className="text-muted-foreground">
                                {!loading && `${zaps.length} workflow${zaps.length !== 1 ? "s" : ""} active`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchZaps}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground bg-card border border-border hover:border-primary/30 hover:text-foreground transition-all shadow-card"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                            <Link
                                href="/zap/create"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-gradient text-primary-foreground shadow-emerald hover:opacity-90 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                New Zap
                            </Link>
                        </div>
                    </div>

                    {/* States */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground text-sm">Loading your workflows…</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-destructive" />
                            </div>
                            <p className="text-muted-foreground text-sm">{error}</p>
                            <button onClick={fetchZaps} className="text-sm font-medium text-primary underline underline-offset-2">
                                Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && zaps.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-5">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-light flex items-center justify-center">
                                <Zap className="w-8 h-8 text-emerald" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-display font-600 text-lg text-foreground mb-1">No Zaps yet</h3>
                                <p className="text-muted-foreground text-sm">Create your first automation to get started</p>
                            </div>
                            <Link
                                href="/zap/create"
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-emerald-gradient text-primary-foreground shadow-emerald hover:opacity-90 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Create your first Zap
                            </Link>
                        </div>
                    )}

                    {!loading && !error && zaps.length > 0 && (
                        <div className="space-y-4">
                            {/* Table header */}
                            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-5 py-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zap ID</span>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trigger</span>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</span>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</span>
                            </div>

                            {zaps.map((zap) => (
                                <div
                                    key={zap.id}
                                    className="bg-card-gradient border border-border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all group"
                                >
                                    <div className="grid md:grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 items-center">
                                        {/* ID + Webhook */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-light flex items-center justify-center">
                                                    <Zap className="w-3.5 h-3.5 text-emerald" />
                                                </div>
                                                <span className="font-display font-600 text-sm text-foreground">{zap.id.slice(0, 8)}…</span>
                                                <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-light text-emerald text-xs font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse-soft" />
                                                    Active
                                                </span>
                                            </div>
                                            {/* Webhook URL */}
                                            <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5 group/webhook cursor-pointer" onClick={() => copyWebhook(zap.id)}>
                                                <Link2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                                                    {getWebhookUrl(zap.id)}
                                                </span>
                                                {copiedId === zap.id ? (
                                                    <Check className="w-3 h-3 text-emerald ml-auto flex-shrink-0" />
                                                ) : (
                                                    <Copy className="w-3 h-3 text-muted-foreground ml-auto flex-shrink-0 opacity-0 group-hover/webhook:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Trigger */}
                                        <div>
                                            <span className="text-xs text-muted-foreground md:hidden block mb-1">Trigger</span>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-light border border-amber/20">
                                                <span className="text-sm">⚡</span>
                                                <span className="text-xs font-medium text-amber-dark">
                                                    {zap.trigger?.type?.name || "Webhook"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div>
                                            <span className="text-xs text-muted-foreground md:hidden block mb-1">Actions</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(zap.actions || []).slice(0, 3).map((action, i) => (
                                                    <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border">
                                                        <span className="text-xs">
                                                            {action.type?.name?.toLowerCase().includes("email") ? "✉️" :
                                                                action.type?.name?.toLowerCase().includes("sol") ? "◎" : "⚙️"}
                                                        </span>
                                                        <span className="text-xs font-medium text-secondary-foreground">
                                                            {action.type?.name || "Action"}
                                                        </span>
                                                    </div>
                                                ))}
                                                {(zap.actions || []).length > 3 && (
                                                    <div className="px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground">
                                                        +{(zap.actions || []).length - 3} more
                                                    </div>
                                                )}
                                                {(!zap.actions || zap.actions.length === 0) && (
                                                    <span className="text-xs text-muted-foreground">No actions</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center justify-between md:justify-start gap-4">
                                            <div>
                                                <span className="text-xs text-muted-foreground md:hidden block mb-1">Created</span>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(zap.createdAt)}
                                                </div>
                                            </div>
                                            <button className="md:ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
