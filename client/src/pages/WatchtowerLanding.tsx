import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Eye, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { DemoDisclosure } from "@/components/DemoDisclosure";

export default function WatchtowerLanding() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950">
      <header className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-sm"><Eye className="h-5 w-5" /></span>
          <span>Watchtower</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/onboarding" className="hidden text-sm font-medium text-slate-600 sm:block">How it works</Link>
          <Button onClick={() => startLogin()} className="rounded-xl bg-slate-950 px-5 hover:bg-slate-800">Sign in</Button>
        </div>
      </header>
      <main>
        <section className="container grid min-h-[560px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"><ShieldCheck className="h-3.5 w-3.5 text-cyan-700" /> Consent-based privacy intelligence</div>
            <h1 className="text-balance text-5xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl">Know what’s connected.<br /><span className="text-cyan-700">Know what needs attention.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Watchtower brings authorized digital-exposure signals into one calm, understandable workspace. It distinguishes verified data, detected indicators, assessment, and items only you can investigate.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => startLogin()} size="lg" className="rounded-xl bg-slate-950 px-6 shadow-lg shadow-slate-950/10 hover:bg-slate-800">Open your Watchtower <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Link href="/onboarding"><Button size="lg" variant="outline" className="w-full rounded-xl border-slate-300 bg-white px-6 sm:w-auto">See product limits</Button></Link>
            </div>
            <div className="mt-10 grid max-w-lg gap-4 border-t border-slate-200 pt-7 sm:grid-cols-3">
              {[["Authorized", "connections only"], ["Transparent", "risk rules"], ["Separated", "demo experience"]].map(([heading, copy]) => <div key={heading}><p className="font-semibold text-slate-900">{heading}</p><p className="text-sm text-slate-500">{copy}</p></div>)}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -inset-8 -z-0 rounded-[3rem] bg-gradient-to-br from-cyan-200/65 via-sky-100 to-indigo-100 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div className="flex items-center gap-2 text-sm font-semibold"><Eye className="h-4 w-4 text-cyan-700" /> Your privacy status</div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950">Review needed</span></div>
              <div className="mt-5 grid grid-cols-[126px_1fr] gap-5"><div className="grid aspect-square place-items-center rounded-2xl bg-slate-950 text-white"><div className="text-center"><div className="text-4xl font-semibold tracking-tight">72</div><div className="mt-1 text-xs text-slate-300">of 100 · High</div></div></div><div className="space-y-3">{[["Breach exposure", "Review"], ["Sensitive permissions", "7 items"], ["Known devices", "3 devices"]].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"><span className="text-xs text-slate-500">{label}</span><span className="text-xs font-semibold text-slate-900">{value}</span></div>)}</div></div>
              <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4"><div className="flex gap-3"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-cyan-800" /><div><p className="text-sm font-semibold text-cyan-950">Evidence before assumptions</p><p className="mt-1 text-xs leading-5 text-cyan-900">Every signal carries a source and evidence classification, so you can judge what deserves action.</p><div className="mt-3"><DemoDisclosure compact /></div></div></div></div>
            </div>
          </div>
        </section>
        <section className="border-y border-slate-200 bg-white"><div className="container grid gap-7 py-14 md:grid-cols-3">{[["Clear scope", "Watchtower shows only authorized signals or clearly marked simulations. It does not access private data without a supported flow."], ["Useful context", "Follow the exposure timeline from what changed to why it matters, including a source, evidence class, and recommended next step."], ["You remain in control", "Review connections, request data export, begin account-deletion workflows, and disconnect services through supported provider flows."]].map(([title, copy]) => <article key={title} className="rounded-2xl border border-slate-100 p-6 shadow-sm"><CheckCircle2 className="h-5 w-5 text-cyan-700" /><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></article>)}</div></section>
      </main>
    </div>
  );
}
