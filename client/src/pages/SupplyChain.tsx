import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowRight, CheckCircle2, GitBranch, ShieldAlert } from "lucide-react";

const severityClass: Record<string, string> = { critical: "bg-rose-100 text-rose-900", high: "bg-orange-100 text-orange-900", medium: "bg-amber-100 text-amber-900", low: "bg-slate-100 text-slate-700" };

export default function SupplyChain() {
  const query = trpc.watchtower.supplyChain.useQuery();
  const data = query.data;
  return <DashboardLayout currentPage="Supply Chain Intelligence" mode="live">
    <div className="space-y-7">
      <header><p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">Watchtower · Supply Chain Intelligence</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">See it. Investigate it. Act on it.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Repository risk is presented as evidence and disposition, not a pile of CVE numbers. Findings distinguish observed evidence from assessment and keep consolidation decisions explicit.</p></header>
      {query.isLoading ? <Card><CardContent className="p-6 text-sm text-slate-500">Loading the repository audit…</CardContent></Card> : null}
      {query.error ? <Card><CardContent className="p-6 text-sm text-rose-700">Unable to load the authenticated supply-chain console.</CardContent></Card> : null}
      {data ? <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Repositories", data.counts.repositories, GitBranch],["Findings", data.counts.findings, AlertTriangle],["Critical", data.counts.critical, ShieldAlert],["High", data.counts.high, ShieldAlert],["Canonical", data.counts.canonical, CheckCircle2]].map(([label,value,Icon]) => <Card key={String(label)}><CardContent className="p-5"><Icon className="h-5 w-5 text-slate-500"/><p className="mt-4 text-3xl font-semibold">{value as number}</p><p className="mt-1 text-sm text-slate-500">{label}</p></CardContent></Card>)}</div>
        <Card><CardContent className="p-0"><div className="border-b border-slate-200 p-5"><h2 className="font-semibold text-slate-950">Repository disposition</h2><p className="mt-1 text-sm text-slate-500">The target architecture is two canonical products plus Watchtower as the security instrument.</p></div><div className="divide-y divide-slate-100">{data.repositories.map(repo => <div key={repo.name} className="p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold text-slate-950">{repo.name}</p><p className="mt-1 text-sm text-slate-500">{repo.role}</p></div><Badge className="w-fit border-0 bg-slate-100 text-slate-700">{repo.disposition.replaceAll("-", " ")}</Badge></div>{repo.findings.length ? <div className="mt-4 space-y-3">{repo.findings.map(finding => <div key={finding.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center gap-2"><Badge className={`border-0 ${severityClass[finding.severity]}`}>{finding.severity}</Badge><span className="text-sm font-semibold text-slate-900">{finding.title}</span></div><p className="mt-3 text-sm leading-6 text-slate-600"><strong>Evidence:</strong> {finding.evidence}</p><p className="mt-2 text-sm leading-6 text-slate-600"><strong>Action:</strong> {finding.recommendedAction}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No issue was observed by this audit. That is not a certification of security.</p>}</div>)}</div></CardContent></Card>
        <Card className="bg-slate-950 text-white"><CardContent className="p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Target architecture</p><div className="mt-5 flex flex-wrap items-center gap-3 text-sm"><span className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950">The Citizen's Record</span><ArrowRight className="h-4 w-4 text-slate-500"/><span className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950">Open the Record</span><ArrowRight className="h-4 w-4 text-slate-500"/><span className="rounded-lg border border-white/20 px-4 py-3">Watchtower security intelligence</span></div></CardContent></Card>
      </> : null}
    </div>
  </DashboardLayout>;
}
