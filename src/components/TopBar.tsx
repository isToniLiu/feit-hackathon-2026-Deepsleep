"use client";

import { useState } from "react";
import type { EvidenceItem, IncidentStatus } from "@/lib/story";

const statusCopy: Record<IncidentStatus, string> = {
  monitoring: "MONITORING",
  "containment-progress": "CONTAINMENT IN PROGRESS",
  "containment-risk": "CONTAINMENT AT RISK",
};

export function TopBar({
  evidence,
  incidentStatus,
}: {
  evidence: EvidenceItem[];
  incidentStatus: IncidentStatus;
}) {
  const [isCaseFileOpen, setIsCaseFileOpen] = useState(false);

  return (
    <header className="relative flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 text-sm sm:px-6">
      <div>
        <p className="font-semibold tracking-tight">Northlight Digital / IR-247</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          EduFlow service disruption
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:inline">
          {statusCopy[incidentStatus]}
        </span>
        <button
          onClick={() => setIsCaseFileOpen((open) => !open)}
          className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
          aria-expanded={isCaseFileOpen}
        >
          CASE FILE · {evidence.length.toString().padStart(2, "0")}
        </button>
        <span className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs">23:47:18</span>
      </div>

      {isCaseFileOpen && (
        <div className="absolute right-4 top-16 z-20 w-[min(22rem,calc(100vw-2rem))] rounded border border-zinc-300 bg-white p-4 text-left shadow-xl sm:right-6">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Evidence log</p>
              <p className="mt-1 text-xs text-zinc-400">只记录你亲自核对过的现场信息。</p>
            </div>
            <span className="font-mono text-xs text-zinc-400">IR-247</span>
          </div>
          {evidence.length === 0 ? (
            <p className="border-t border-dashed border-zinc-200 pt-3 text-sm text-zinc-500">
              还没有记录。先在当前场景里检查网址、来源或提交地址。
            </p>
          ) : (
            <ol className="flex flex-col gap-3 border-t border-zinc-200 pt-3">
              {evidence.map((item, index) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <span className="font-mono text-xs text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-zinc-700">{item.text.replace(/^🔍\s*/, "")}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </header>
  );
}
