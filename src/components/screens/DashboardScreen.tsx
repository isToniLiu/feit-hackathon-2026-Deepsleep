"use client";

import { useState } from "react";
import { story } from "@/lib/story";
import { ScreenShell } from "./ScreenShell";

// Could项：可选的"30秒入门速览"分支，见DEV_PLAN.md/PRD.md MoSCoW。
// 点"速览"先看一段科普卡片再继续；点"跳过"直接进入下一节点。

export function DashboardScreen({ onNext }: { onNext: () => void }) {
  const { dashboard } = story;
  const [showPrimer, setShowPrimer] = useState(false);

  if (showPrimer) {
    return (
      <ScreenShell
        eyebrow="30秒速览"
        title={dashboard.primerContent.title}
        ctaLabel={dashboard.primerContent.cta}
        onNext={onNext}
      >
        <p>{dashboard.primerContent.body}</p>
      </ScreenShell>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="text-xs uppercase tracking-wide text-zinc-400">
        {dashboard.greeting}
      </span>
      <h1 className="max-w-lg text-2xl font-semibold">{dashboard.incidentTitle}</h1>
      <p className="max-w-lg text-zinc-600">{dashboard.incidentSubtitle}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => setShowPrimer(true)}
          className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-100"
        >
          {dashboard.actions.primer}
        </button>
        <button
          onClick={onNext}
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
        >
          {dashboard.actions.skip}
        </button>
      </div>
    </div>
  );
}
