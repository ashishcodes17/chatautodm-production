import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { cn } from "@/lib/utils";
// import SiteFooter from "@/components/site-footer";
import FloatingNav from "@/components/pagenavbar";
import { Footer } from "@/components/landing/footer";

// Data structure so you can easily edit plan features later.
// Edit the `features` arrays or add/remove plans as needed.
const plans: Array<{
  name: string;
  tagline: string;
  originalPrice?: string | null;
  currentPrice: string; // What we show as the active price ("Free" now)
  ctaLabel: string;
  href: string;
  highlight?: boolean;
  badge?: string;
  gradient?: string; // Extra gradient ring on highlight cards
  features: string[]; // Placeholder features – replace later
}> = [
  {
    name: "Free",
    tagline: "Jump in & send, receive feedback, and iterate quickly.",
    currentPrice: "₹0",
    originalPrice: null,
    ctaLabel: "Get Started",
    href: "/",
    features: [
       "Unlimited Automations",
      "1000 Contacts",
      "1000 DMs",
      "Get Access to all flows",
    ],
  },
  {
    name: "Pro",
    tagline: "Scale workflows & advanced personalization.",
    originalPrice: "₹499/mo",
    currentPrice: "₹0/mo",
    ctaLabel: "Start Pro Trial",
    href: "/",
    highlight: true,
    badge: "Most Popular",
    gradient: "from-blue-500/60 via-indigo-500/60 to-fuchsia-500/60",
    features: [
     "Unlimited Automations",
      "Unlimited Contacts",
      "Unlimited DMs",
      "Ask to Follow feature",
    ],
  },
  {
    name: "Elite",
    tagline: "For teams that want everything & priority scaling.",
    originalPrice: "₹999/mo",
    currentPrice: "₹0/mo",
    ctaLabel: "Unlock Elite",
    href: "/",
    highlight: true,
    badge: "Founders Promo",
    gradient: "from-amber-400/60 via-pink-500/60 to-purple-600/60",
    features: [
      "Unlimited Automations",
      "Unlimited Contacts",
      "Unlimited DMs",
      "Ask to Follow feature",
      "Collect Data ",
    ],
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Why are Pro & Elite free right now?",
    a: "We're in a founder launch period. Let people build without friction, gather feedback, then enable normal pricing with plenty of notice and a legacy discount option.",
  },
  {
    q: "Will I need a credit card to start?",
    a: "No. You can explore, build flows, and invite teammates on the Free plan and the temporary free upgrades without entering payment details.",
  },
  {
    q: "What happens after the first month?",
    a: "You'll get an email + in‑app notice well before billing would begin. You can downgrade, continue on Free, or stay upgraded at regular (or legacy discounted) pricing.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Plan changes (up or down) take effect immediately; any future billing will pro‑rate fairly once pricing activates.",
  },
  {
    q: "Are there usage limits?",
    a: "Free has basic volume & execution caps. Pro increases throughput & advanced targeting. Elite adds higher concurrency, priority processing and premium support. Exact limits will be published before billing starts.",
  },
  {
    q: "How do I get support?",
    a: "In‑app chat (coming soon), email support at info@chatautodm.xyz or text us @chatautodm, and community access. Elite adds priority & roadmap input calls.",
  },
];

// Detailed comparison matrix (edit freely). Availability: true | false | 'soon'
type Availability = boolean | 'soon'
interface ComparisonItem { label: string; free: Availability; pro: Availability; elite: Availability; note?: string }
interface ComparisonSection { category: string; items: ComparisonItem[] }

const comparisonSections: ComparisonSection[] = [
  {
    category: "Core Automation",
    items: [
      { label: "Visual Flow Builder", free: true, pro: true, elite: true },
      { label: "Unlimited Flows", free: true, pro: true, elite: true, note: "Fair-use monitoring" },
      { label: "Scheduled Runs", free: true, pro: true, elite: true },
      { label: "Parallel Branching", free: false, pro: true, elite: true },
      { label: "Conditional Logic", free: true, pro: true, elite: true },
      { label: "AI Text Generation Blocks", free: false, pro: true, elite: true },
      { label: "Custom Code Step", free: false, pro: 'soon', elite: true },
    ],
  },
  {
    category: "Audience & Targeting",
    items: [
      { label: "Basic Filters", free: true, pro: true, elite: true },
      { label: "Multi‑attribute Segments", free: false, pro: true, elite: true },
      { label: "Saved Dynamic Segments", free: false, pro: true, elite: true },
      { label: "Lookalike Suggestions", free: false, pro: false, elite: 'soon' },
    ],
  },
  {
    category: "Messaging & Channels",
    items: [
      { label: "Instagram DMs", free: true, pro: true, elite: true },
      { label: "Multi‑Account Rotation", free: false, pro: true, elite: true },
      { label: "Auto‑Follow + DM Combo", free: false, pro: true, elite: true },
      { label: "Keyword Triggered Replies", free: true, pro: true, elite: true },
      { label: "Link Click Triggers", free: false, pro: true, elite: true },
      { label: "Webhook Outbound", free: false, pro: 'soon', elite: true },
    ],
  },
  {
    category: "Performance & Scale",
    items: [
      { label: "Daily Execution Quota", free: true, pro: true, elite: true, note: "Tiered caps" },
      { label: "Concurrent Runs", free: false, pro: true, elite: true },
      { label: "Priority Queueing", free: false, pro: false, elite: true },
      { label: "Adaptive Rate Control", free: false, pro: true, elite: true },
      { label: "Error Auto‑Retry", free: false, pro: true, elite: true },
    ],
  },
  {
    category: "Collaboration",
    items: [
      { label: "Team Members", free: true, pro: true, elite: true, note: "Higher limits on paid" },
      { label: "Role Permissions", free: false, pro: true, elite: true },
      { label: "Flow Version History", free: false, pro: true, elite: true },
      { label: "Shared Component Library", free: false, pro: 'soon', elite: true },
    ],
  },
  {
    category: "Support & Success",
    items: [
      { label: "Email Support", free: true, pro: true, elite: true },
      { label: "Priority Support", free: false, pro: false, elite: true },
      { label: "Roadmap Input Calls", free: false, pro: false, elite: true },
      { label: "Migration Assistance", free: false, pro: false, elite: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <LightBackgroundArt />
      {/* Removed max-w-7xl so layout can span full width */}
      <main className="relative z-10 flex w-full flex-col gap-24 px-6 pb-32 pt-32 md:px-10 lg:px-20 xl:px-32 2xl:px-40">
        <FloatingNav />
        <HeroSection />
        <PlansSection />
        <PlanComparisonTable />
        <FounderNote />
        <FAQSection />
       

        {/* <SiteFooter /> */}
      </main>
       <div className="w-full max-w-none">
  <Footer />
</div>

    </div>
  );
}

function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium tracking-wide text-slate-600 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
        </span>
       <p>Founder Launch: Paid plans are temporarily free  </p>
      </div>
      <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-6xl">
        Simple pricing for serious automation
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
        Start building without cost friction. When billing begins you choose: stay free, upgrade, or lock a legacy discount.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/">
          <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm">
            Start Free
          </Button>
        </Link>
        <Link href="#plans" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          View plans ↓
        </Link>
      </div>
    </section>
  );
}

function PlansSection() {
  return (
    <section id="plans" className="relative">
      {/* Removed max-w-6xl to allow full-width growth */}
      <div className="grid w-full gap-8 pt-14 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-slate-500">
        Crossed-out prices represent upcoming public pricing. Upgrades are free for the launch month.
      </p>
    </section>
  );
}

function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  return (
    <div className={cn("group relative h-full")}> 
      {plan.highlight && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br opacity-70 blur-sm transition-all duration-500 group-hover:opacity-100",
            plan.gradient || "from-indigo-400/40 via-sky-300/40 to-cyan-300/40"
          )}
        />
      )}
      <Card
        className={cn(
          "relative flex h-full min-h-[520px] flex-col justify-between rounded-3xl border border-slate-200 bg-white px-6 pb-6 pt-8 shadow-sm transition duration-300",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:border before:border-transparent before:transition before:duration-300 group-hover:before:border-slate-300",
          plan.highlight && "shadow-sm ring-1 ring-inset ring-slate-200"
        )}
      >
        <CardHeader className="p-0">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              {plan.name}
            </CardTitle>
            {plan.badge && (
              <Badge className="bg-slate-900 text-white text-[10px] uppercase tracking-wide shadow">
                {plan.badge}
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm leading-relaxed text-slate-600">
            {plan.tagline}
          </CardDescription>
          <div className="mt-6 flex items-end gap-2">
            {plan.originalPrice && (
              <span className="text-sm font-medium text-slate-400 line-through">
                {plan.originalPrice}
              </span>
            )}
            <span className="text-3xl font-semibold tracking-tight text-slate-900">
              {plan.currentPrice}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-8">
          <ul className="flex flex-col gap-3 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                  ✓
                </span>
                <span className="text-slate-600">{f}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="mt-10 flex flex-col items-stretch gap-4 p-0">
          <Button
            asChild
            size="lg"
            className={cn(
              "w-full rounded-xl font-medium transition",
              plan.highlight
                ? "bg-slate-900 hover:bg-slate-800 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-900"
            )}
          >
            <Link href={plan.href}>{plan.ctaLabel}</Link>
          </Button>
          {plan.name === "Free" && (
            <p className="text-center text-[10px] leading-snug text-slate-500">
              No credit card required. Upgrade anytime.
            </p>
          )}
          {plan.highlight && (
            <p className="text-center text-[10px] leading-snug text-slate-500">
              Intro promo: first month free. Regular pricing resumes after launch window.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function FounderNote() {
  return (
    <section className="relative mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
        Why is everything free right now?
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
        We want ambitious builders using the product immediately. Your real usage guides polish & prioritization before general pricing. When pricing activates you'll get advance notice plus a legacy discount option if you helped shape early feedback.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button asChild variant="outline" className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
          <Link href="/">Start Building</Link>
        </Button>
        <Link href="/compare/manychat" className="text-xs font-medium text-slate-600 hover:text-slate-900">
          Compare vs ManyChat →
        </Link>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Frequently Asked Questions</h2>
        <p className="mt-3 text-sm text-slate-600">More questions? Email <a href="mailto:info@chatautodm.xyz" className="font-medium underline underline-offset-4">founder@example.com</a></p>
      </div>
      <Accordion type="single" collapsible className="divide-y rounded-2xl border border-slate-200 bg-white shadow-sm">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`faq-${i}`} className="px-6">
            <AccordionTrigger className="text-left text-sm font-medium text-slate-800 md:text-base">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-sm md:text-[15px]">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function PlanComparisonTable() {
  return (
    // Removed max-w-6xl; now full width
    <section className="relative mt-4 w-full">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Compare Plan Features</h2>
        <p className="mt-3 text-sm text-slate-600">Granular breakdown of what each tier unlocks. Items marked "Coming" will land before billing activates.</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="min-w-[200px] px-4 py-3 font-medium">Category / Feature</th>
                <th className="w-[140px] px-4 py-3 text-center font-semibold text-slate-700">Free</th>
                <th className="w-[140px] px-4 py-3 text-center font-semibold text-slate-700">Pro</th>
                <th className="w-[140px] px-4 py-3 text-center font-semibold text-slate-700">Elite</th>
              </tr>
            </thead>
            <tbody>
              {comparisonSections.map((section, si) => (
                <React.Fragment key={section.category}>
                  <tr className="bg-slate-100/60">
                    <td colSpan={4} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {section.category}
                    </td>
                  </tr>
                  {section.items.map((item, ii) => (
                    <tr
                      key={item.label}
                      className={cn(
                        "border-b border-slate-100 last:border-0",
                        (si + ii) % 2 === 0 && "bg-slate-50/30"
                      )}
                    >
                      <td className="px-4 py-3 align-top text-slate-700">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-800">{item.label}</span>
                          {item.note && <span className="text-[11px] text-slate-500">{item.note}</span>}
                        </div>
                      </td>
                      <AvailabilityCell value={item.free} />
                      <AvailabilityCell value={item.pro} highlight />
                      <AvailabilityCell value={item.elite} highlight strong />
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 text-[11px] text-slate-500">
          <p className="max-w-xl">Feature limits (volumes, concurrency) scale by plan. Final numeric caps published before billing starts. "Coming" features arrive during the free launch window.</p>
          <Link href="/" className="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800">Start Free Today</Link>
        </div>
      </div>
      {/* Mobile simplified list */}
      <div className="mt-10 grid gap-6 md:hidden">
        {comparisonSections.map((section) => (
          <div key={section.category} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{section.category}</h3>
            <ul className="flex flex-col divide-y divide-slate-100">
              {section.items.map((item) => (
                <li key={item.label} className="py-3">
                  <div className="mb-1 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-800">{item.label}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{renderMobileTag(item)}</span>
                  </div>
                  {item.note && <p className="text-[11px] text-slate-500">{item.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function AvailabilityCell({ value, highlight, strong }: { value: Availability; highlight?: boolean; strong?: boolean }) {
  let content: React.ReactNode
  if (value === true) content = <span aria-label="Included" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500/90 text-[11px] font-bold text-white">✓</span>
  else if (value === false) content = <span aria-label="Not included" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[13px] font-bold text-slate-500">×</span>
  else content = <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Coming</span>
  return (
    <td
      className={cn(
        "px-4 py-3 text-center align-middle",
        highlight && "bg-gradient-to-br from-slate-50 to-white",
        strong && "font-medium"
      )}
    >
      {content}
    </td>
  )
}

function renderMobileTag(item: ComparisonItem) {
  const tiers: [string, Availability][] = [
    ["Free", item.free],
    ["Pro", item.pro],
    ["Elite", item.elite],
  ]
  const available = tiers.filter(([, v]) => v === true).map(([n]) => n)
  if (available.length === 3) return "All Plans"
  if (available.length === 0) return item.elite === 'soon' || item.pro === 'soon' || item.free === 'soon' ? 'Coming' : 'Unavailable'
  return available.join(" / ")
}

function LightBackgroundArt() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-5%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-100 via-transparent to-transparent blur-2xl" />
        <div className="absolute bottom-[-10%] left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-t from-indigo-100 via-transparent to-transparent blur-2xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [mask-image:radial-gradient(circle_at_center,black,transparent)]" style={{ backgroundImage: "linear-gradient(rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.08)_1px,transparent_1px)", backgroundSize: "56px 56px" }} />
    </>
  );
}
