"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Plus, Zap, ArrowDown, X, Loader2, ChevronDown, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

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

type FieldDef = { key: string; label: string; placeholder: string; type?: string };

const getMetadataFields = (actionName: string): FieldDef[] => {
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
    if (name.includes("slack")) {
        return [
            { key: "webhookUrl", label: "Slack Webhook URL", placeholder: "https://hooks.slack.com/services/..." },
            { key: "message", label: "Message", placeholder: "New event: {body.type}" },
        ];
    }
    if (name.includes("discord")) {
        return [
            { key: "webhookUrl", label: "Discord Webhook URL", placeholder: "https://discord.com/api/webhooks/..." },
            { key: "message", label: "Message", placeholder: "New event: {body.type}" },
        ];
    }
    if (name.includes("http") || name.includes("request")) {
        return [
            { key: "url", label: "URL", placeholder: "https://api.example.com/notify" },
            { key: "method", label: "Method (GET / POST)", placeholder: "POST" },
            { key: "body", label: "Body (JSON)", placeholder: '{"key": "{body.value}"}' },
        ];
    }
    if (name.includes("log")) {
        return [
            { key: "label", label: "Log Label", placeholder: "Event received: {body.type}" },
        ];
    }
    return [];
};

const getTriggerFields = (triggerName: string): FieldDef[] => {
    const name = triggerName.toLowerCase();
    if (name.includes("schedule")) {
        return [
            { key: "intervalMinutes", label: "Run every (minutes)", placeholder: "60", type: "number" },
        ];
    }
    return [];
};

// Cartoon Selector Dropdown
const Selector = ({
    label,
    selected,
    options,
    onSelect,
    loading,
    placeholder,
    emoji,
    accentColor,
}: {
    label: string;
    selected?: AppOption;
    options: AppOption[];
    onSelect: (o: AppOption) => void;
    loading: boolean;
    placeholder: string;
    emoji: string;
    accentColor: string;
}) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 border-black bg-white hover:bg-yellow-50 transition-all text-left shadow-[3px_3px_0_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#1a1a1a]"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${accentColor} border-2 border-black flex items-center justify-center text-sm`}>{emoji}</div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className={`text-sm font-black ${selected ? "text-black" : "text-gray-400"}`}>
                            {selected ? selected.name : placeholder}
                        </p>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-black transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#1a1a1a] z-20 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                        </div>
                    ) : options.length === 0 ? (
                        <div className="py-6 text-center text-sm font-medium text-gray-500">No options available</div>
                    ) : (
                        <div className="max-h-52 overflow-y-auto py-1.5">
                            {options.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => { onSelect(opt); setOpen(false); }}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-yellow-100 transition-colors text-left border-b border-gray-100 last:border-0"
                                >
                                    <span className="text-sm font-bold text-black">{opt.name}</span>
                                    {selected?.id === opt.id && <Check className="w-4 h-4 text-[#06D6A0]" />}
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
    const [triggerMetadata, setTriggerMetadata] = useState<Record<string, string>>({});
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

    const handleTriggerSelect = (option: AppOption) => {
        setSelectedTrigger(option);
        setTriggerMetadata({});
    };

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
                    triggerMetadata,
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
            toast.success("Zap created successfully!");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Failed to create Zap");
        } finally {
            setSubmitting(false);
        }
    };

    const actionColors = ["bg-pink-300", "bg-purple-300", "bg-orange-300", "bg-blue-300", "bg-rose-300"];

    return (
        <div className="min-h-screen bg-[#FEFCE8]">
            <Navbar />
            <main className="pt-24 pb-16 px-6">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-300 border-2 border-black shadow-[3px_3px_0_#1a1a1a] mb-4">
                            <Zap className="w-4 h-4 text-black fill-black" />
                            <span className="text-xs font-black text-black uppercase tracking-wide">New Workflow</span>
                        </div>
                        <h1 className="font-black text-4xl text-black mb-2">Create a Zap ⚡</h1>
                        <p className="font-medium text-gray-600">Define your trigger and chain actions to automate any workflow.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Trigger Block */}
                        <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0_#1a1a1a]">
                            <div className="px-5 py-3.5 bg-yellow-300 border-b-2 border-black rounded-t-2xl flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                                    <span className="text-xs font-black text-yellow-300">1</span>
                                </div>
                                <span className="text-sm font-black text-black">Trigger</span>
                                <span className="ml-auto text-xs font-bold text-black/60">When this happens…</span>
                            </div>
                            <div className="p-5 space-y-4">
                                <Selector
                                    label="Select trigger event"
                                    selected={selectedTrigger}
                                    options={triggers}
                                    onSelect={handleTriggerSelect}
                                    loading={loadingOptions}
                                    placeholder="Choose what starts your Zap"
                                    emoji="⚡"
                                    accentColor="bg-yellow-200"
                                />
                                {selectedTrigger && (
                                    <div className="mt-3 p-3 rounded-xl bg-[#C8F0D4] border-2 border-black flex items-center gap-2">
                                        <Check className="w-4 h-4 text-black flex-shrink-0" />
                                        <span className="text-sm font-black text-black">{selectedTrigger.name} selected</span>
                                    </div>
                                )}
                                {selectedTrigger && getTriggerFields(selectedTrigger.name).length > 0 && (
                                    <div className="space-y-3 pt-1">
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Configuration</p>
                                        {getTriggerFields(selectedTrigger.name).map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-black text-black mb-2">{field.label}</label>
                                                <input
                                                    type={field.type || "text"}
                                                    value={triggerMetadata[field.key] || ""}
                                                    onChange={(e) => setTriggerMetadata(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                    placeholder={field.placeholder}
                                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black bg-[#FEFCE8] text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[0_0_0_3px_#FFD60A] transition-all text-sm font-medium shadow-[2px_2px_0_#1a1a1a]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Connector */}
                        {(selectedTrigger || actions.length > 0) && (
                            <div className="flex justify-center">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-0.5 h-5 bg-black" />
                                    <div className="w-8 h-8 rounded-full border-2 border-black bg-white shadow-[2px_2px_0_#1a1a1a] flex items-center justify-center">
                                        <ArrowDown className="w-4 h-4 text-black" />
                                    </div>
                                    <div className="w-0.5 h-5 bg-black" />
                                </div>
                            </div>
                        )}

                        {/* Action Blocks */}
                        {actions.map((action, idx) => {
                            const fields = action.actionName ? getMetadataFields(action.actionName) : [];
                            const color = actionColors[idx % actionColors.length];
                            return (
                                <div key={idx}>
                                    <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0_#1a1a1a]">
                                        <div className={`px-5 py-3.5 ${color} border-b-2 border-black rounded-t-2xl flex items-center gap-2`}>
                                            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                                                <span className="text-xs font-black text-white">{idx + 2}</span>
                                            </div>
                                            <span className="text-sm font-black text-black">Action {idx + 1}</span>
                                            <span className="ml-auto text-xs font-bold text-black/60">Then do this…</span>
                                            <button
                                                type="button"
                                                onClick={() => removeAction(idx)}
                                                className="ml-2 p-1.5 rounded-lg border-2 border-black bg-white hover:bg-red-100 transition-colors shadow-[2px_2px_0_#1a1a1a]"
                                            >
                                                <X className="w-3.5 h-3.5 text-black" />
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
                                                accentColor={color}
                                            />

                                            {fields.length > 0 && action.availableActionId && (
                                                <div className="space-y-3 pt-1">
                                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Configuration</p>
                                                    {fields.map((field) => (
                                                        <div key={field.key}>
                                                            <label className="block text-sm font-black text-black mb-2">{field.label}</label>
                                                            <input
                                                                type={field.type || "text"}
                                                                value={action.metadata[field.key] || ""}
                                                                onChange={(e) => updateMetadata(idx, field.key, e.target.value)}
                                                                placeholder={field.placeholder}
                                                                className="w-full px-4 py-2.5 rounded-xl border-2 border-black bg-[#FEFCE8] text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[0_0_0_3px_#FFD60A] transition-all text-sm font-medium shadow-[2px_2px_0_#1a1a1a]"
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
                                                <div className="w-0.5 h-5 bg-black" />
                                                <div className="w-8 h-8 rounded-full border-2 border-black bg-white shadow-[2px_2px_0_#1a1a1a] flex items-center justify-center">
                                                    <ArrowDown className="w-4 h-4 text-black" />
                                                </div>
                                                <div className="w-0.5 h-5 bg-black" />
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
                                    {actions.length > 0 && <div className="w-0.5 h-5 bg-black" />}
                                    <button
                                        type="button"
                                        onClick={addAction}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed border-black hover:bg-white hover:border-solid hover:shadow-[3px_3px_0_#1a1a1a] text-black transition-all text-sm font-black"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add action
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Validation hint */}
                        {!selectedTrigger && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-100 border-2 border-black shadow-[3px_3px_0_#1a1a1a]">
                                <AlertCircle className="w-5 h-5 text-black flex-shrink-0" />
                                <p className="text-sm font-bold text-black">Start by selecting a trigger event above</p>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || !selectedTrigger || actions.length === 0}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-white bg-black border-2 border-black shadow-[4px_4px_0_#06D6A0] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#06D6A0] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0_#06D6A0] text-lg"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 fill-white" />
                                        Publish Zap
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs font-medium text-gray-500 mt-3">
                                Your Zap will be active immediately after publishing
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
