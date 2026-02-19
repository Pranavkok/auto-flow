import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, Shield, Clock, BarChart3, CheckCircle, ChevronRight } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Triggers",
    desc: "Connect any event as a trigger — webhooks, schedules, app events, and more.",
    color: "amber",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    desc: "All workflows run in isolated environments with end-to-end encryption.",
    color: "emerald",
  },
  {
    icon: Clock,
    title: "Always On",
    desc: "Your automations run 24/7 without you lifting a finger. Truly set and forget.",
    color: "amber",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Track every execution, success rate, and time saved across all your flows.",
    color: "emerald",
  },
];

const steps = [
  { num: "01", title: "Choose a Trigger", desc: "Pick what kicks off your automation — a webhook, form, or app event." },
  { num: "02", title: "Add Actions", desc: "Stack multiple actions: send emails, transfer tokens, post updates, and more." },
  { num: "03", title: "Go Live", desc: "Activate your Zap and watch it run silently in the background." },
];

const integrations = [
  { name: "Webhooks", emoji: "🔗" },
  { name: "Email", emoji: "✉️" },
  { name: "Solana", emoji: "◎" },
  { name: "Slack", emoji: "💬" },
  { name: "Notion", emoji: "📄" },
  { name: "GitHub", emoji: "🐙" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-hero-gradient grain-texture overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-light border border-amber/30 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-soft" />
                <span className="text-xs font-semibold text-amber-dark tracking-wide uppercase">Automation made simple</span>
              </div>

              <h1 className="font-display text-5xl lg:text-6xl font-800 text-charcoal leading-[1.1] tracking-tight mb-6">
                Automate your
                <span className="block text-emerald"> workflow,</span>
                reclaim your time.
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                FlowMate connects your apps and services into seamless workflows — no code needed. Build once, run forever.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-emerald-gradient text-primary-foreground shadow-emerald hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-foreground bg-card border border-border shadow-card hover:shadow-card-hover transition-all hover:scale-[1.02]"
                >
                  Sign in
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>

              {/* Trust */}
              <div className="mt-10 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["#4ade80", "#34d399", "#6ee7b7"].map((c, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-background" style={{ background: c }} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">2,400+</span> teams automate with FlowMate
                </p>
              </div>
            </div>

            {/* Hero Visual — replaced static image with decorative illustration */}
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald/10 to-amber/10 blur-3xl scale-90" />
              <div className="relative rounded-3xl shadow-warm w-full animate-float bg-gradient-to-br from-card to-muted border border-border p-8 flex flex-col items-center justify-center min-h-[320px]">
                <div className="w-16 h-16 rounded-2xl bg-emerald-gradient flex items-center justify-center shadow-emerald mb-4">
                  <Zap className="w-8 h-8 text-primary-foreground fill-current" />
                </div>
                <p className="text-lg font-display font-600 text-foreground mb-1">Workflow Automation</p>
                <p className="text-sm text-muted-foreground text-center max-w-xs">Connect triggers to actions and let FlowMate handle the rest</p>
              </div>
              {/* Floating stats card */}
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-card-hover border border-border animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-light flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-amber-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Workflows ran today</p>
                    <p className="text-lg font-display font-700 text-foreground">48,293</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Pills */}
      <section className="py-12 px-6 border-y border-border bg-card">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">Connects with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map((i) => (
              <div key={i.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border hover:border-primary/30 hover:bg-primary-light transition-all cursor-default">
                <span className="text-base">{i.emoji}</span>
                <span className="text-sm font-medium text-foreground">{i.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-700 text-charcoal mb-4">Everything you need to automate</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Powerful primitives that compose into anything your team needs.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-card-gradient border border-border shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-11 h-11 rounded-xl mb-4 flex items-center justify-center ${f.color === "amber" ? "bg-amber-light" : "bg-emerald-light"}`}>
                  <f.icon className={`w-5 h-5 ${f.color === "amber" ? "text-amber-dark" : "text-emerald"}`} />
                </div>
                <h3 className="font-display font-600 text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-muted/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-700 text-charcoal mb-4">How FlowMate works</h2>
            <p className="text-lg text-muted-foreground">From idea to automation in under 5 minutes.</p>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute left-[2.75rem] top-8 bottom-8 w-px bg-gradient-to-b from-emerald/40 via-amber/30 to-transparent" />
            <div className="flex flex-col gap-8">
              {steps.map((s) => (
                <div key={s.num} className="flex gap-6 items-start">
                  <div className="relative flex-shrink-0 w-11 h-11 rounded-2xl bg-emerald-gradient flex items-center justify-center shadow-emerald z-10">
                    <span className="text-xs font-display font-700 text-primary-foreground">{s.num}</span>
                  </div>
                  <div className="bg-card rounded-2xl p-6 flex-1 border border-border shadow-card hover:shadow-card-hover transition-all">
                    <h3 className="font-display font-600 text-lg text-foreground mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-emerald-gradient shadow-emerald overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber/20 blur-2xl" />
            <h2 className="relative font-display text-4xl font-700 text-primary-foreground mb-4">Start automating today.</h2>
            <p className="relative text-primary-foreground/80 mb-8 text-lg">No credit card required. Free forever for small teams.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-amber-gradient text-charcoal shadow-warm hover:opacity-90 transition-all hover:scale-[1.02]"
            >
              Create your first Zap
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-card">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-gradient flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground fill-current" />
            </div>
            <span className="font-display font-600 text-sm text-foreground">FlowMate</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 FlowMate. Automate everything.</p>
        </div>
      </footer>
    </div>
  );
}
