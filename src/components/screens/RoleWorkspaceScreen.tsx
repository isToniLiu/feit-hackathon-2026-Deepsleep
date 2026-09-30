"use client";

import { getStory, type RoleId } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";
import { RoleLinePortrait } from "@/components/ui/RoleLinePortrait";

const roleAccent: Record<RoleId, string> = { priya: "text-blue", marcus: "text-yellow", aiko: "text-coral" };

export function RoleWorkspaceScreen({ roleId, onNext }: { roleId: RoleId; onNext: () => void }) {
  const { locale } = useLocale();
  const story = getStory(locale);
  const role = story.roles[roleId];
  const mentor = story.mentors[role.mentorId];
  const chapter = story.chapters.find((candidate) => candidate.mentorId === role.mentorId);

  return (
    <main className="flex flex-1 flex-col bg-paper px-5 py-10 text-ink sm:px-10 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 border-b border-rule pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${roleAccent[roleId]}`}>IR-247 / {tr(locale, "investigation workspace", "调查工作台")}</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] tracking-[-0.045em] sm:text-6xl">{tr(locale, "Take over this investigation.", "接手这条调查线。")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{role.mission}</p>
          </div>
          <div className="flex items-center gap-4 lg:pb-1"><RoleLinePortrait roleId={roleId} /><div><p className="text-[10px] uppercase tracking-[0.18em] text-muted">{tr(locale, "Assigned perspective", "当前视角")}</p><p className="mt-1 font-display text-2xl">{role.type}</p><p className="mt-1 text-xs text-muted">{mentor.name} · {tr(locale, "online", "在线")}</p></div></div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
          <section className="border border-rule bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{tr(locale, "Your first case file", "你的第一份案件档案")}</p><h2 className="mt-2 font-display text-3xl tracking-[-0.03em]">{chapter?.title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted">{chapter?.scenario}</p></div><span className="rounded-full border border-rule px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">0 / 3 {tr(locale, "tasks", "任务")}</span></div>
            <ol className="mt-5 grid gap-3">{role.tasks.map((task, index) => <li key={task.label} className="flex gap-4 border-b border-rule py-4 last:border-b-0"><span className={`font-display text-2xl ${roleAccent[roleId]}`}>0{index + 1}</span><div><p className="text-sm font-medium">{task.label}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">{tr(locale, "Ready to investigate", "待调查")}</p></div></li>)}</ol>
          </section>

          <aside className="border border-rule bg-surface p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{tr(locale, "System access", "系统访问")}</p><p className="mt-3 font-mono text-lg">{role.route}</p><p className="mt-2 text-sm leading-6 text-muted">{tr(locale, "Check the clues relevant to this role before deciding whether to hand the request to the formal process.", "你可以先核对与本岗位有关的线索，再决定是否把请求交给正式流程。")}</p><div className="mt-6 border-t border-rule pt-5"><p className="text-[10px] uppercase tracking-[0.16em] text-muted">{tr(locale, "Evidence focus", "证据重点")}</p><p className="mt-2 text-sm">{role.focus}</p></div><div className="mt-6 border-l-2 border-coral bg-paper p-4"><p className="text-xs font-semibold">{tr(locale, "Remote support online", "远程支援已上线")}</p><p className="mt-2 text-sm leading-6 text-muted">{mentor.line}</p></div></aside>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><p className="text-xs uppercase tracking-[0.14em] text-muted">{tr(locale, "One incident · one entry point · evidence stays in IR-247", "一个事故 · 一个入口 · 证据留在 IR-247")}</p><button onClick={onNext} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700">{tr(locale, "Open the investigation →", "打开调查现场 →")}</button></div>
      </div>
    </main>
  );
}
