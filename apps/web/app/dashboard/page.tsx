"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Plus, Zap, Calendar, Link2, ExternalLink, Loader2, AlertCircle, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const HOOKS_URL = process.env.NEXT_PUBLIC_HOOKS_URL || "http://localhost:3002";

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
    const [userId, setUserId] = useState<string>("1");

    const fetchZaps = async () => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload?.id) setUserId(String(payload.id));
        } catch {}
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

    const getWebhookUrl = (zapId: string) => `${HOOKS_URL}/hooks/catch/${userId}/${zapId}`;

    const copyWebhook = async (zapId: string) => {
        const url = getWebhookUrl(zapId);
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const el = document.createElement("textarea");
            el.value = url;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        }
        setCopiedId(zapId);
        toast.success("Webhook URL copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const cardColors = ["bg-yellow-100", "bg-pink-100", "bg-cyan-100", "bg-purple-100", "bg-orange-100", "bg-green-100"];

    return (
        <div className="min-h-screen bg-[#FEFCE8]">
            <Navbar />
            <main className="pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                        <div>
                            <div className="inline-block bg-cyan-300 border-2 border-black shadow-[3px_3px_0_#1a1a1a] rounded-xl px-4 py-2 mb-3">
                                <h1 className="font-black text-2xl text-black">Your Zaps ⚡</h1>
                            </div>
                            <p className="font-medium text-gray-600">
                                {!loading && `${zaps.length} workflow${zaps.length !== 1 ? "s" : ""} active`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchZaps}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-black bg-white border-2 border-black shadow-[3px_3px_0_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#1a1a1a] transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                            <Link
                                href="/zap/create"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white bg-black border-2 border-black shadow-[3px_3px_0_#06D6A0] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#06D6A0] transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                New Zap
                            </Link>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-yellow-300 border-2 border-black shadow-[4px_4px_0_#1a1a1a] flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-black" />
                            </div>
                            <p className="font-bold text-gray-600">Loading your workflows…</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-red-300 border-2 border-black shadow-[4px_4px_0_#1a1a1a] flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-black" />
                            </div>
                            <p className="font-bold text-gray-700">{error}</p>
                            <button onClick={fetchZaps} className="px-5 py-2.5 rounded-xl font-black text-white bg-black border-2 border-black shadow-[3px_3px_0_#FF4D6D] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#FF4D6D] transition-all text-sm">
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && zaps.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-yellow-300 border-2 border-black shadow-[5px_5px_0_#1a1a1a] flex items-center justify-center animate-wiggle">
                                <Zap className="w-10 h-10 text-black fill-black" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-black text-xl text-black mb-1">No Zaps yet!</h3>
                                <p className="font-medium text-gray-600">Create your first automation to get started</p>
                            </div>
                            <Link
                                href="/zap/create"
                                className="flex items-center gap-2 px-7 py-3 rounded-xl font-black text-white bg-black border-2 border-black shadow-[4px_4px_0_#06D6A0] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#06D6A0] transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Create your first Zap
                            </Link>
                        </div>
                    )}

                    {/* Zap cards */}
                    {!loading && !error && zaps.length > 0 && (
                        <div className="grid gap-4">
                            {zaps.map((zap, i) => (
                                <div
                                    key={zap.id}
                                    className={`${cardColors[i % cardColors.length]} border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#1a1a1a] transition-all group`}
                                >
                                    <div className="grid md:grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 items-center">
                                        {/* ID + Webhook */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-yellow-300 border-2 border-black flex items-center justify-center">
                                                    <Zap className="w-4 h-4 text-black fill-black" />
                                                </div>
                                                <span className="font-black text-sm text-black">{zap.id.slice(0, 8)}…</span>
                                                <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8F0D4] border-2 border-black text-xs font-black text-black">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] animate-pulse" />
                                                    Active
                                                </span>
                                            </div>
                                            {/* Webhook URL */}
                                            <div
                                                className="flex items-center gap-1.5 bg-white/70 border border-black/20 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-white transition-colors"
                                                onClick={() => copyWebhook(zap.id)}
                                            >
                                                <Link2 className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                                <span className="text-xs font-medium text-gray-600 truncate max-w-[160px]">
                                                    {getWebhookUrl(zap.id)}
                                                </span>
                                                {copiedId === zap.id ? (
                                                    <Check className="w-3 h-3 text-[#06D6A0] ml-auto flex-shrink-0" />
                                                ) : (
                                                    <Copy className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Trigger */}
                                        <div>
                                            <span className="text-xs font-black text-gray-500 md:hidden block mb-1">TRIGGER</span>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-300 border-2 border-black shadow-[2px_2px_0_#1a1a1a]">
                                                <span className="text-sm">⚡</span>
                                                <span className="text-xs font-black text-black">
                                                    {zap.trigger?.type?.name || "Webhook"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div>
                                            <span className="text-xs font-black text-gray-500 md:hidden block mb-1">ACTIONS</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(zap.actions || []).slice(0, 3).map((action, j) => {
                                                    const actionBg = ["bg-pink-300", "bg-cyan-300", "bg-purple-300"][j % 3];
                                                    return (
                                                        <div key={j} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${actionBg} border-2 border-black shadow-[2px_2px_0_#1a1a1a]`}>
                                                            <span className="text-xs">
                                                                {action.type?.name?.toLowerCase().includes("email") ? "✉️" :
                                                                 action.type?.name?.toLowerCase().includes("sol") ? "◎" :
                                                                 action.type?.name?.toLowerCase().includes("slack") ? "💬" :
                                                                 action.type?.name?.toLowerCase().includes("discord") ? "🎮" :
                                                                 action.type?.name?.toLowerCase().includes("http") ? "🌐" :
                                                                 action.type?.name?.toLowerCase().includes("log") ? "📋" : "⚙️"}
                                                            </span>
                                                            <span className="text-xs font-black text-black">
                                                                {action.type?.name || "Action"}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                                {(zap.actions || []).length > 3 && (
                                                    <div className="px-2.5 py-1 rounded-lg bg-white border-2 border-black text-xs font-black text-black">
                                                        +{(zap.actions || []).length - 3}
                                                    </div>
                                                )}
                                                {(!zap.actions || zap.actions.length === 0) && (
                                                    <span className="text-xs font-medium text-gray-500">No actions</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center justify-between md:justify-start gap-4">
                                            <div>
                                                <span className="text-xs font-black text-gray-500 md:hidden block mb-1">CREATED</span>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(zap.createdAt)}
                                                </div>
                                            </div>
                                            <button className="md:ml-auto p-2 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#1a1a1a] opacity-0 group-hover:opacity-100 hover:bg-yellow-100 transition-all">
                                                <ExternalLink className="w-3.5 h-3.5 text-black" />
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
