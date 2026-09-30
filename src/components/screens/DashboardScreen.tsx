"use client";

import { useState } from "react";
import { getStory } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";
import { ScreenShell } from "./ScreenShell";

export function DashboardScreen({ onNext }: { onNext: () => void }) {
  const { locale } = useLocale();
  const story = getStory(locale);
  const { dashboard } = story;
  const [showPrimer, setShowPrimer] = useState(false);

  if (showPrimer) return <ScreenShell eyebrow={tr(locale, "30-second primer", "30秒速览")} title={dashboard.primerContent.title} ctaLabel={dashboard.primerContent.cta} onNext={onNext}><p>{dashboard.primerContent.body}</p></ScreenShell>;

  return (
    <main className="flex flex-1 flex-col bg-paper px-5 py-12 text-ink sm:px-10 lg:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
        <section><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">{dashboard.greeting} · IR-247</p><h1 className="mt-5 max-w-3xl font-display text-6xl leading-[0.9] tracking-[-0.055em] sm:text-8xl">{tr(locale, "Investigate the case.", "调查这起事故。")}<br /><span className="text-coral">{tr(locale, "Make the call.", "做出判断。")}</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted">{dashboard.incidentSubtitle}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button onClick={() => setShowPrimer(true)} className="rounded-full border border-rule px-6 py-3 text-sm font-medium transition hover:border-ink hover:bg-surface">{dashboard.actions.primer}</button><button onClick={onNext} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-700">{dashboard.actions.skip}</button></div></section>
        <section className="border border-rule bg-surface p-5 shadow-[0_18px_40px_rgba(30,28,20,0.08)]"><div className="flex items-center justify-between border-b border-rule pb-3 text-[10px] uppercase tracking-[0.16em] text-muted"><span>Northlight Digital</span><span>{tr(locale, "Incident 247", "事故 247")}</span></div><div className="mt-5 grid gap-3"><div className="border-l-4 border-blue bg-blue/10 p-4"><p className="text-[10px] uppercase tracking-[0.15em] text-muted">{tr(locale, "Current signal", "当前信号")}</p><p className="mt-2 font-display text-2xl">{tr(locale, "EduFlow access anomaly", "EduFlow 访问异常")}</p></div><div className="grid grid-cols-2 gap-3"><div className="border border-rule p-4"><p className="text-[10px] uppercase tracking-[0.15em] text-muted">{tr(locale, "Systems", "系统")}</p><p className="mt-2 text-sm">{tr(locale, "3 internal views", "3 个内部视图")}</p></div><div className="border border-rule p-4"><p className="text-[10px] uppercase tracking-[0.15em] text-muted">{tr(locale, "Status", "状态")}</p><p className="mt-2 text-sm text-coral">{tr(locale, "Needs review", "待核查")}</p></div></div><div className="border-t border-rule pt-4 text-sm leading-6 text-muted">{tr(locale, "One incident can look different from every system. Your reasoning is part of the evidence.", "同一事故在不同系统里会呈现不同面貌。你的判断本身也是证据。")}</div></div></section>
      </div>
      <div className="mx-auto mt-auto flex w-full max-w-6xl flex-wrap gap-x-10 gap-y-2 border-t border-rule pt-5 text-[10px] uppercase tracking-[0.18em] text-muted"><span>{tr(locale, "Real incidents", "真实事故")}</span><span>{tr(locale, "Practical skills", "实用技能")}</span><span>{tr(locale, "Built for educators", "为教育者打造")}</span><span>{tr(locale, "Reasoning first", "先讲判断")}</span></div>
    </main>
  );
}
