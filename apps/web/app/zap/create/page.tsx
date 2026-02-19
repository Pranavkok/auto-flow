"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Plus, Zap, ArrowDown, X, Loader2, ChevronDown, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = "http://localhost:3000";

interface AppOption {
    id: string;
    name: string;
    image?: string;
}

interface ActionConfig {
    availableActionId: string;
    actionName: string;
    metadata: Record<string, string>;
}

// Metadata field definitions for known action types
const getMetadataFields = (actionName: string): { key: string; label: string; placeholder: string; type?: string }[] => {
    const name = actionName.toLowerCase();
    if (name.includes("email")) {
        return [
            { key: "to", label: "To Email", placeholder: "recipient@example.com", type: "email" },
            { key: "subject", label: "Subject", placeholder: "Your subject line" },
            { key: "body", label: "Message Body", placeholder: "Email content…" },
        ];
    }
    if (name.includes("sol") || name.includes("solana")) {
        return [
            { key: "to", label: "Recipient Wallet", placeholder: "Solana wallet address" },
            { key: "amount", label: "Amount (SOL)", placeholder: "0.01", type: "number" },
        ];
    }
    return [
        { key: "value", label: "Value", placeholder: "Enter value" },
    ];
};

// Selector Dropdown
const Selector = ({
    label,
    selected,
    options,
    onSelect,
    loading,
    placeholder,
    emoji,
}: {
    label: string;
    selected?: AppOption;
    options: AppOption[];
    onSelect: (o: AppOption) => void;
    loading: boolean;
    placeholder: string;
    emoji: string;
}) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all text-left shadow-card"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">{emoji}</div>
                    <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className={`text-sm font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                            {selected ? selected.name : placeholder}
                        </p>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-card-hover z-20 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : options.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">No options available</div>
                    ) : (
                        <div className="max-h-52 overflow-y-auto py-1.5">
                            {options.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => { onSelect(opt); setOpen(false); }}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                                >
                                    <span className="text-sm text-foreground">{opt.name}</span>
                                    {selected?.id === opt.id && <Check className="w-4 h-4 text-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function ZapCreate() {
    const router = useRouter();
    const [triggers, setTriggers] = useState<AppOption[]>([]);
    const [availableActions, setAvailableActions] = useState<AppOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    const [selectedTrigger, setSelectedTrigger] = useState<AppOption | undefined>();
    const [actions, setActions] = useState<ActionConfig[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }

        const fetchOptions = async () => {
            setLoadingOptions(true);
            try {
                const [tRes, aRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/api/v1/trigger/available`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${BACKEND_URL}/api/v1/action/available`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const tData = await tRes.json();
                const aData = await aRes.json();
                setTriggers(tData.availableTriggers || []);
                setAvailableActions(aData.availableActions || []);
            } catch {
                toast.error("Failed to load available triggers/actions");
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchOptions();
    }, [router]);

    const addAction = () => {
        setActions((prev) => [...prev, { availableActionId: "", actionName: "", metadata: {} }]);
    };

    const removeAction = (idx: number) => {
        setActions((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateActionType = (idx: number, option: AppOption) => {
        setActions((prev) =>
            prev.map((a, i) => i === idx ? { ...a, availableActionId: option.id, actionName: option.name, metadata: {} } : a)
        );
    };

    const updateMetadata = (idx: number, key: string, value: string) => {
        setActions((prev) =>
            prev.map((a, i) => i === idx ? { ...a, metadata: { ...a.metadata, [key]: value } } : a)
        );
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }

        if (!selectedTrigger) { toast.error("Please select a trigger"); return; }
        if (actions.length === 0) { toast.error("Add at least one action"); return; }
        if (actions.some((a) => !a.availableActionId)) { toast.error("Please select an action type for all actions"); return; }

        setSubmitting(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/zap`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    availableTriggerId: selectedTrigger.id,
                    triggerMetadata: {},
                    actions: actions.map((a) => ({
                        availableActionId: a.availableActionId,
                        actionMetadata: a.metadata,
                    })),
                }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.message || "Failed to create Zap");
            }
            toast.success("Zap created successfully! 🎉");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Failed to create Zap");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16 px-6">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-light border border-amber/30 mb-4">
                            <Zap className="w-3 h-3 text-amber-dark" />
                            <span className="text-xs font-semibold text-amber-dark uppercase tracking-wide">New Workflow</span>
                        </div>
                        <h1 className="font-display text-3xl font-700 text-charcoal mb-2">Create a Zap</h1>
                        <p className="text-muted-foreground">Define your trigger and chain actions to automate any workflow.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Trigger Block */}
                        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                            <div className="px-5 py-3.5 bg-amber-light border-b border-amber/20 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-amber/20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-amber-dark">1</span>
                                </div>
                                <span className="text-sm font-semibold text-amber-dark">Trigger</span>
                                <span className="ml-auto text-xs text-amber-dark/60">When this happens…</span>
                            </div>
                            <div className="p-5">
                                <Selector
                                    label="Select trigger event"
                                    selected={selectedTrigger}
                                    options={triggers}
                                    onSelect={setSelectedTrigger}
                                    loading={loadingOptions}
                                    placeholder="Choose what starts your Zap"
                                    emoji="⚡"
                                />
                                {selectedTrigger && (
                                    <div className="mt-3 p-3 rounded-xl bg-emerald-light border border-emerald/20 flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald flex-shrink-0" />
                                        <span className="text-sm text-emerald font-medium">{selectedTrigger.name} selected</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Connector */}
                        {(selectedTrigger || actions.length > 0) && (
                            <div className="flex justify-center">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-px h-4 bg-border" />
                                    <div className="w-6 h-6 rounded-full border-2 border-border bg-card flex items-center justify-center">
                                        <ArrowDown className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                    <div className="w-px h-4 bg-border" />
                                </div>
                            </div>
                        )}

                        {/* Action Blocks */}
                        {actions.map((action, idx) => {
                            const fields = action.actionName ? getMetadataFields(action.actionName) : [];
                            return (
                                <div key={idx}>
                                    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                                        <div className="px-5 py-3.5 bg-primary-light border-b border-primary/20 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                                                <span className="text-xs font-bold text-primary">{idx + 2}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-primary">Action {idx + 1}</span>
                                            <span className="ml-auto text-xs text-primary/60">Then do this…</span>
                                            <button
                                                type="button"
                                                onClick={() => removeAction(idx)}
                                                className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <Selector
                                                label="Select action type"
                                                selected={action.availableActionId ? { id: action.availableActionId, name: action.actionName } : undefined}
                                                options={availableActions}
                                                onSelect={(opt) => updateActionType(idx, opt)}
                                                loading={loadingOptions}
                                                placeholder="Choose what to do"
                                                emoji="⚙️"
                                            />

                                            {/* Metadata fields */}
                                            {fields.length > 0 && action.availableActionId && (
                                                <div className="space-y-3 pt-1">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configuration</p>
                                                    {fields.map((field) => (
                                                        <div key={field.key}>
                                                            <label className="block text-sm font-medium text-foreground mb-1.5">{field.label}</label>
                                                            <input
                                                                type={field.type || "text"}
                                                                value={action.metadata[field.key] || ""}
                                                                onChange={(e) => updateMetadata(idx, field.key, e.target.value)}
                                                                placeholder={field.placeholder}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {idx < actions.length - 1 && (
                                        <div className="flex justify-center my-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-px h-4 bg-border" />
                                                <div className="w-6 h-6 rounded-full border-2 border-border bg-card flex items-center justify-center">
                                                    <ArrowDown className="w-3 h-3 text-muted-foreground" />
                                                </div>
                                                <div className="w-px h-4 bg-border" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Add action button */}
                        {selectedTrigger && (
                            <div className="flex justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    {actions.length > 0 && <div className="w-px h-4 bg-border" />}
                                    <button
                                        type="button"
                                        onClick={addAction}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary-light text-muted-foreground hover:text-primary transition-all text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add action
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Validation hint */}
                        {!selectedTrigger && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-light border border-amber/20">
                                <AlertCircle className="w-4 h-4 text-amber-dark flex-shrink-0" />
                                <p className="text-sm text-amber-dark">Start by selecting a trigger event above</p>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || !selectedTrigger || actions.length === 0}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-emerald-gradient text-primary-foreground shadow-emerald hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 fill-current" />
                                        Publish Zap
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-muted-foreground mt-3">
                                Your Zap will be active immediately after publishing
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
