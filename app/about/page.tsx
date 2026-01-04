import React from "react";
import Link from "next/link";
import FloatingNav from "@/components/pagenavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/landing/footer";

// Reuse same light / gradient art as pricing
function LightBackgroundArt() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-5%] h-[640px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-100 via-transparent to-transparent blur-2xl" />
        <div className="absolute bottom-[-10%] left-1/2 h-[560px] w-[880px] -translate-x-1/2 rounded-full bg-gradient-to-t from-indigo-100 via-transparent to-transparent blur-2xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.15),transparent_60%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [mask-image:radial-gradient(circle_at_center,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.08)_1px,transparent_1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </>
  );
}

const values = [
  {
    title: "Speed Over Friction",
    desc: "Idea → live automation in minutes. Low ceremony, high leverage.",
    gradient: "from-sky-400/40 via-indigo-400/40 to-fuchsia-400/40",
  },
  {
    title: "Clarity > Complexity",
    desc: "Visual flows that stay readable at scale and support teams.",
    gradient: "from-emerald-400/40 via-teal-400/40 to-cyan-400/40",
  },
  {
    title: "Power With Safety",
    desc: "Smart rate controls + guardrails prevent platform penalties.",
    gradient: "from-amber-400/40 via-orange-400/40 to-pink-400/40",
  },
  {
    title: "Builder Empathy",
    desc: "We ship what we’d want daily: shortcuts, sane defaults, resilience.",
    gradient: "from-violet-400/40 via-purple-400/40 to-indigo-400/40",
  },
];

const timeline = [
  { date: "Q1 2025", label: "Prototype", body: "Internal automation scaffolds + early IG DM experiments, And Verified by Meta✅" },
  { date: "Q2 2025", label: "Alpha", body: "Core features done, heavy testing and refining feedback loops, first execution engine iteration." },
  { date: "Q3 2025", label: "Closed Beta", body: "Early operators & growth teams stress test concurrency. Shipped first public version, onboarded early users, iterating fast." },
  { date: "Q4 2025", label: "Public Launch Window", body: "Active rollout in progress, optimizing performance and reliability." },
  { date: "Soon", label: "Billing + Marketplace", body: "Template marketplace & extensions. Implementation of Multi-Platform integrations" },
];

const stats = [
  { label: "Early Builders", value: "3000+" },
  { label: "Automations Run", value: "1M+" },
  { label: "Avg Success Rate", value: "99.3%" },
  { label: "Countries", value: "90+" },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <LightBackgroundArt />
      <main className="relative z-10 flex w-full flex-col gap-28 px-6 pb-40 pt-32 md:px-10 lg:px-20 xl:px-32 2xl:px-40">
        <FloatingNav />
        <Hero />
        <StatsStrip />
        <CompanySection /> {/* Added */}
        <Mission />
        <TeamSection />    {/* Added */}
        <Values />
        <Architecture />
        <Timeline />
        <FounderNote />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium tracking-wide text-slate-600 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
        </span>
        Building the automation layer for lean growth teams
      </div>
      <h1 className="mt-8 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight text-black md:text-6xl lg:text-7xl">
        Crafting a faster path from <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent"><br />idea to scaled workflow</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
        We reduce the drag between a growth hypothesis and a production‑grade automated system while keeping clarity, safety and speed.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/">
          <Button size="lg" className="bg-slate-900 hover:bg-slate-800 rounded-full text-white font-semibold shadow-sm">
            Start Free
          </Button>
        </Link>
        <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          View Pricing →
        </Link>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="relative mx-auto w-full rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-md shadow-sm md:p-10">
      <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <span className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {s.value}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-sky-200/20 via-transparent to-fuchsia-200/20" />
    </section>
  );
}

function Mission() {
  return (
    <section className="relative mx-auto grid w-full gap-12 lg:grid-cols-12">
      <div className="relative lg:col-span-5">
        <div className="sticky top-28 flex flex-col gap-6">
          <Badge className="w-fit bg-slate-900 text-white">Mission</Badge>
          <h2 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            Remove friction from building & iterating automation.
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 md:text-[15px]">
            Most tools force a trade-off between speed and power. We aim for both: a canvas you can explain to a teammate in seconds but scale to thousands of executions with resilient safeguards, adaptive pacing and intuitive insight loops.
          </p>
        </div>
      </div>
      <div className="relative flex flex-col gap-8 lg:col-span-7">
        <GlassNote
          title="Velocity"
          body="Instant feedback loops, optimistic UI, one-click duplication & rollback. Build like you prototype."
        />
        <GlassNote
          title="Precision"
          body="Structured observability, execution traces, failure surfaces and live tweakable parameters."
        />
        <GlassNote
          title="Leverage"
          body="Composable steps, reusable fragments and upcoming community templates accelerate iteration."
        />
      </div>
    </section>
  );
}

function GlassNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-7 backdrop-blur-md transition">
      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="h-full w-full bg-gradient-to-br from-sky-100/60 via-indigo-100/40 to-fuchsia-100/60" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function Values() {
  return (
    <section className="flex flex-col gap-10">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Product Pillars
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Operating principles guiding every release.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {values.map((v) => (
          <div
            key={v.title}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute -inset-px rounded-3xl opacity-60 blur-md transition group-hover:opacity-90",
                `bg-gradient-to-tr ${v.gradient}`
              )}
            />
            <div className="relative">
              <h3 className="text-base font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section className="relative rounded-3xl border border-slate-200 bg-white/80 p-10 backdrop-blur-md shadow-sm">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Under the Hood
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          A distributed execution engine with adaptive pacing, idempotent steps & queued concurrency
          envelopes. Observability hooks stream structured events for real-time diagnostics and
          post‑run analytics. This enables safe incremental rollout, rapid iteration and scale without
          guesswork.
        </p>
        <ul className="mt-6 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-4 w-4 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center">✓</span>
            Event-sourced execution traces
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-4 w-4 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center">✓</span>
            Adaptive rate + burst smoothing
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-4 w-4 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center">✓</span>
            Smart retry / backoff matrix
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-4 w-4 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center">✓</span>
            Templateable flow fragments
          </li>
        </ul>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-indigo-200/20 via-transparent to-fuchsia-200/30" />
    </section>
  );
}

function Timeline() {
  return (
    <section className="flex flex-col gap-10">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Build Journey
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Iteration loops driving toward a stable growth automation layer.
        </p>
      </div>
      <div className="relative mx-auto w-full max-w-4xl">
        <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-sky-400 via-slate-300 to-fuchsia-400 md:left-1/2 md:-translate-x-1/2" />
        <ul className="flex flex-col gap-12">
          {timeline.map((t, i) => {
            const isLeft = i % 2 === 0;
            return (
              <li
                key={t.date + t.label}
                className={cn(
                  "relative flex flex-col gap-2 pl-14 md:max-w-[44%]",
                  "md:pl-0 md:pr-0",
                  "md:[&:nth-child(odd)]:self-start md:[&:nth-child(even)]:self-end",
                  !isLeft && "md:text-right"
                )}
              >
                <span
                  className={cn(
                    "absolute left-4 top-1 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-white",
                    "bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 md:left-1/2 md:-translate-x-1/2"
                  )}
                />
                <div
                  className={cn(
                    "rounded-2xl border border-slate-200 bg-white/70 p-5 backdrop-blur-md shadow-sm",
                    "hover:shadow-md transition"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {t.date}
                    </p>
                    <Badge className="hidden bg-slate-900 text-[10px] font-medium text-white md:inline-flex">
                      {t.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900 md:hidden">{t.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function FounderNote() {
  return (
    <section className="relative mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Why we are shipping in public</h2>
      <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-[15px]">
        High‑leverage automation should not be gatekept by heavy setup and rigid abstractions. We release early to compress feedback loops, surface edge cases and refine ergonomics before pricing locks. Your experiments directly influence priorities.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button asChild variant="outline" className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
          <Link href="/">Start Building</Link>
        </Button>
        <Link href="/pricing" className="text-xs font-medium text-slate-600 hover:text-slate-900">
          View Pricing →
        </Link>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 px-10 py-16 text-center text-slate-100 shadow-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_70%)]"
      />
      <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
        Build your first automation today
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-300">
        Free while we finalize billing. Keep what you build. No credit card required.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button
            size="lg"
            className="bg-white text-slate-900 rounded-full hover:bg-slate-100 font-semibold shadow-sm"
          >
            Start Free
          </Button>
        </Link>
        {/* <Link
          href="/pricing"
          className="text-sm font-medium text-slate-300 hover:text-white"
        >
          Compare Plans →
        </Link> */}
      </div>
    </section>
  );
}



// ...existing code...
// Company overview (with logo on right)
function CompanySection() {
  return (
    <section
      id="company"
      className="relative rounded-3xl border border-slate-200 bg-white/80 p-10 backdrop-blur-md shadow-sm 
           flex flex-col md:flex-row items-center md:items-center gap-11 md:gap-20">

      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl lg-text:4xl">
          About The Company
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-[16px]">
          We are building a next-gen Instagram automation layer that respects
          platform dynamics while giving creators, lean growth teams and solo
          builders leverage. Early focus is Instagram outreach, engagement
          workflows and smart follow-up sequences. The roadmap expands into a
          multi-platform orchestration surface (Instagram, Facebook, Tiktok, Email &
          more) with an AI decision layer for adaptive branching, message
          generation and anomaly detection.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-[15px]">
          Our philosophy: high trust, low friction tooling—fast iteration
          without sacrificing safety. Expect opinionated primitives, transparent
          limits and rapidly shipped improvements shaped directly by early
          builders.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            Instagram Core
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            Multi-Platform Soon
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            AI Assist Coming
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            Safety First
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            Builder Centric
          </span>
        </div>
      </div>

      {/* Logo on the right */}
      <div className="shrink-0 pl-4">
        <img
          src="/logo-branding2.png"
          alt="Company Logo"
          className="h-28 w-28 md:h-36 md:w-36 rounded-2xl  object-contain shadow-sm"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-sky-200/25 via-transparent to-fuchsia-200/30" />
    </section>
  );
}

// // Team / Founder (single card with big profile)
// function TeamSection() {
//   return (
//     <section
//       id="team"
//       className="rounded-3xl border border-slate-200 bg-white/80 p-10 backdrop-blur-md shadow-sm flex flex-col items-center text-center gap-6"
//     >
//       <div>
//         <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
//           Founder & Early Team Ethos
//         </h2>
//         <p className="mt-3 text-sm text-slate-600">
//           Early stage, shipping fast, tightening feedback loops before scaling.
//         </p>
//       </div>

//       {/* Big founder profile */}
//       <div className="flex flex-col items-center gap-4">
//         <img
//           src="/mine2.jpg"
//           alt="Founder - Ashish Gampala"
//           className="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover shadow-md"
//         />
//         <div>
//           <h3 className="text-lg font-semibold text-slate-900">Ashish Gampala</h3>
//           <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
//             Teen Founder • Product & Engineering
//           </p>
//         </div>
//       </div>

//       {/* Founder mission */}
//       <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
//         Started this to compress the time from idea to automated growth loop.
//         Worked hard to build from scratch, with an obsession for clarity, speed
//         and safe scaling. The mission: earn trust through consistent shipping
//         and listening.
//       </p>

//       {/* Ethos bullets */}
//       {/* <ul className="mt-4 space-y-2 text-sm text-slate-600 max-w-md text-left">
//         <li className="flex items-start gap-2">
//           <span className="mt-1 h-3 w-3 rounded-full bg-sky-500" />
//           Short feedback cycles & rapid refactors.
//         </li>
//         <li className="flex items-start gap-2">
//           <span className="mt-1 h-3 w-3 rounded-full bg-indigo-500" />
//           Safety nets: tracing, rollback, guardrails.
//         </li>
//         <li className="flex items-start gap-2">
//           <span className="mt-1 h-3 w-3 rounded-full bg-fuchsia-500" />
//           Bias for clarity over cleverness.
//         </li>
//       </ul> */}

//       {/* Future expansion note */}
//       <p className="mt-6 text-[11px] uppercase tracking-wide text-slate-500">
//         Future: Team roles in Engine, AI, Safety, Growth • Not hiring yet
//       </p>
//     </section>
//   );
// }
// Team / Founder (single card with big profile)
function TeamSection() {
  return (
    <section
      id="team"
      className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white/90 to-slate-50/70 p-12 backdrop-blur-xl shadow-lg flex flex-col items-center text-center gap-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          Founder & Early Team Ethos
        </h2>
        <p className="text-sm md:text-base text-slate-600">
          Early stage, shipping fast, tightening feedback loops before scaling.
        </p>
      </div>

      {/* Founder profile */}
      <div className="flex flex-col items-center gap-4">
        {/* <img
          src="/mine2.jpg"
          alt="Founder - Ashish Gampala"
          className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover shadow-xl ring-4 ring-white/80"
        /> */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            Ashish Gampala
          </h3>
          <p className="mt-1 text-[12px] md:text-xs font-medium uppercase tracking-wide text-slate-500">
            Teen Founder • Product & Engineering
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="relative max-w-2xl text-sm md:text-base leading-relaxed text-slate-700 space-y-4">
        <blockquote className="italic">
          <p>
            “Started this to compress the time from{" "}
            <span className="font-semibold bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
              idea → automated growth loop
            </span>
            .”
          </p>
        </blockquote>
        <p>
          Built from scratch with an obsession for{" "}
          <span className="font-medium text-slate-900">clarity</span>,{" "}
          <span className="font-medium text-slate-900">speed</span>, and{" "}
          <span className="font-medium text-slate-900">safe scaling</span>.
        </p>
        <p className="text-slate-900 font-medium">
          The mission: <span className="italic">earn trust</span> through
          consistent shipping and listening.
        </p>
      </div>

      {/* Ethos bullets */}
      <ul className="mt-4 space-y-3 text-sm md:text-base text-slate-600 max-w-md text-left">
        <li className="flex items-start gap-2">
          <span className="mt-1 h-3 w-3 rounded-full bg-sky-500 shadow-sm" />
          Short feedback cycles & rapid refactors.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-3 w-3 rounded-full bg-indigo-500 shadow-sm" />
          Safety nets: tracing, rollback, guardrails.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-3 w-3 rounded-full bg-fuchsia-500 shadow-sm" />
          Bias for clarity over cleverness.
        </li>
      </ul>

      {/* Divider */}
      <div className="w-12 h-[2px] bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 rounded-full mt-6"></div>

      {/* Future expansion note */}
      <p className="text-[11px] md:text-xs uppercase tracking-wide text-slate-500">
        Future: Team roles in Engine, AI, Safety, Growth • Not hiring yet
      </p>

      {/* Thank you note */}
      <p className="mt-6 text-sm md:text-base font-medium text-slate-700">
         Thank you for being a part in the journey — every step forward is built
        with trust, consistency, and your support.
      </p>
    </section>
  );
}
