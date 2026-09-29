"use client";

import { useState } from "react";
import type { RoleTask } from "@/lib/story";

export function ObjectivePanel({
  tasks,
  completed,
}: {
  tasks: RoleTask[];
  completed: boolean[];
}) {
  const [expanded, setExpanded] = useState(true);
  const completedCount = completed.filter(Boolean).length;
  const activeIndex = completed.findIndex((isComplete) => !isComplete);
  const hintIndex = activeIndex === -1 ? Math.max(tasks.length - 1, 0) : activeIndex;
  const activeTask = tasks[hintIndex];

  return (
    <section className="sticky top-0 z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-slate-500 bg-[#0d2033]/95 text-left shadow-xl backdrop-blur">
      <button
        onClick={() => setExpanded((isOpen) => !isOpen)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-800/80"
      >
        <span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Case objectives</span>
          <span className="mt-1 block text-xs text-slate-300">
            {activeIndex === -1 ? "调查任务已完成，现场仍保持开放" : `当前目标 · ${activeTask?.label ?? "继续核对现场"}`}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-teal-300/60 px-3 py-1 font-mono text-[11px] text-teal-200">
            {completedCount} / {tasks.length}
          </span>
          <span className="text-slate-400">{expanded ? "⌃" : "⌄"}</span>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 px-4 pb-4 pt-3">
          <ol className="grid gap-2">
            {tasks.map((task, index) => {
              const isComplete = completed[index];
              const isCurrent = index === activeIndex;
              return (
                <li
                  key={task.label}
                  className={`flex gap-3 rounded-lg border px-3 py-2.5 ${
                    isComplete
                      ? "border-emerald-300/40 bg-emerald-300/10"
                      : isCurrent
                        ? "border-amber-300/50 bg-amber-300/10"
                        : "border-slate-700 bg-slate-950/30"
                  }`}
                >
                  <span className={`font-mono text-xs ${isComplete ? "text-emerald-200" : isCurrent ? "text-amber-200" : "text-slate-500"}`}>
                    {isComplete ? "✓" : `0${index + 1}`}
                  </span>
                  <div>
                    <p className={`text-xs font-medium ${isComplete ? "text-emerald-100" : isCurrent ? "text-amber-100" : "text-slate-400"}`}>
                      {task.label}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      {isComplete ? "evidence recorded" : isCurrent ? "current objective" : "queued"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {activeTask && activeIndex !== -1 && (
            <p className="mt-3 border-l-2 border-teal-300/60 pl-3 text-xs leading-5 text-slate-300">
              <span className="font-semibold text-teal-200">Optional hint · </span>
              {activeTask.hint}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
