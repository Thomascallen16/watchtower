import { demoDisclosure } from "@shared/watchtower";
import { FlaskConical } from "lucide-react";

export function DemoDisclosure({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-amber-950 ${compact ? "" : "whitespace-normal"}`}>
      <FlaskConical className="h-3 w-3 shrink-0" aria-hidden="true" />
      {demoDisclosure}
    </span>
  );
}
