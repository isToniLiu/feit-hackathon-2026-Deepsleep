"use client";

import { getMentor, getRole, story, type RoleId } from "@/lib/story";

export function RoleWorkspaceScreen({
  roleId,
  onNext,
}: {
  roleId: RoleId;
  onNext: () => void;
}) {
  const role = getRole(roleId);
  const mentor = getMentor(role.mentorId);
  const chapter = story.chapters.find((candidate) => candidate.mentorId === role.mentorId);

  return (
    <main className="flex flex-1 flex-col justify-center bg-[#081321] px-5 py-10 text-zinc-100 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300">IR-247 / investigation workspace</p>
            <h1 className="mt-3 font-mono text-4xl font-semibold tracking-tight sm:text-5xl">接手这条调查线</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">{role.mission}</p>
          </div>
          <div className="rounded-lg border border-teal-300/40 bg-teal-300/10 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.16em] text-teal-200">assigned role</p>
            <p className="mt-1 font-mono text-lg font-semibold text-white">{role.type}</p>
            <p className="mt-1 text-xs text-slate-300">{mentor.name} · online</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
          <section className="rounded-xl border border-slate-600 bg-slate-900/80 p-6 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-700 pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Your first case file</p>
                <h2 className="mt-2 font-mono text-2xl font-semibold text-white">{chapter?.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{chapter?.scenario}</p>
              </div>
              <span className="rounded-full border border-slate-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">0 / 3 tasks</span>
            </div>

            <ol className="mt-5 grid gap-3">
              {role.tasks.map((task, index) => (
                <li key={task} className="flex gap-3 rounded-lg border border-slate-700 bg-slate-950/50 p-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-teal-300/60 font-mono text-xs text-teal-200">0{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{task}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">ready to investigate</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <aside className="rounded-xl border border-slate-600 bg-slate-950/70 p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">System access</p>
            <p className="mt-3 font-mono text-lg text-white">{role.route}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">你可以先核对与本岗位有关的线索，再决定是否把请求交给正式流程。</p>
            <div className="mt-6 border-t border-slate-700 pt-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Evidence focus</p>
              <p className="mt-2 text-sm text-slate-200">{role.focus}</p>
            </div>
            <div className="mt-6 rounded-lg border border-teal-300/30 bg-teal-300/5 p-4">
              <p className="text-xs font-semibold text-teal-200">远程支援已上线</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{mentor.line}</p>
            </div>
          </aside>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">One incident · one entry point · evidence stays in IR-247</p>
          <button
            onClick={onNext}
            className="rounded-full bg-teal-200 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-teal-100"
          >
            打开调查现场 →
          </button>
        </div>
      </div>
    </main>
  );
}
