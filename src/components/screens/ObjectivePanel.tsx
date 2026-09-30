"use client";

import { useState } from "react";
import type { ChapterEvidence, RoleTask } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";

const difficultyLabel: Record<string, { en: string; zh: string }> = {
  beginner: { en: "beginner", zh: "入门" },
  intermediate: { en: "intermediate", zh: "中级" },
  advanced: { en: "advanced", zh: "高级" },
};

export function ObjectivePanel({
  tasks,
  completed,
  evidence = [],
  difficulty,
  attackType,
}: {
  tasks: RoleTask[];
  completed: boolean[];
  evidence?: ChapterEvidence[];
  difficulty?: string;
  attackType?: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const { locale } = useLocale();
  const completedCount = completed.filter(Boolean).length;
  const activeIndex = completed.findIndex((isComplete) => !isComplete);
  const hintIndex = activeIndex === -1 ? Math.max(tasks.length - 1, 0) : activeIndex;
  const activeTask = tasks[hintIndex];

  return (
    <section className="w-full overflow-hidden border border-rule bg-surface text-left shadow-[0_12px_30px_rgba(30,28,20,0.08)]">
      <button
        onClick={() => setExpanded((isOpen) => !isOpen)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-paper"
      >
        <span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-coral">{tr(locale, "Case objectives", "案件目标")}</span>
          <span className="mt-1 block text-xs text-muted">
            {activeIndex === -1 ? tr(locale, "Investigation complete; the scene remains open", "调查任务已完成，现场仍保持开放") : `${tr(locale, "Current objective", "当前目标")} · ${activeTask?.label ?? tr(locale, "Continue checking the scene", "继续核对现场")}`}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-rule px-3 py-1 font-mono text-[11px] text-muted">
            {completedCount} / {tasks.length}
          </span>
          <span className="text-muted">{expanded ? "⌃" : "⌄"}</span>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-rule px-4 pb-4 pt-3">
          <ol className="grid gap-2">
            {tasks.map((task, index) => {
              const isComplete = completed[index];
              const isCurrent = index === activeIndex;
              return (
                <li
                  key={task.label}
                  className={`flex gap-3 rounded-lg border px-3 py-2.5 ${
                    isComplete
                      ? "border-teal/30 bg-teal/10"
                      : isCurrent
                        ? "border-yellow/50 bg-yellow/10"
                        : "border-rule bg-paper"
                  }`}
                >
                  <span className={`font-mono text-xs ${isComplete ? "text-teal" : isCurrent ? "text-yellow" : "text-muted"}`}>
                    {isComplete ? "✓" : `0${index + 1}`}
                  </span>
                  <div>
                    <p className={`text-xs font-medium ${isComplete ? "text-ink" : isCurrent ? "text-ink" : "text-muted"}`}>
                      {task.label}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                      {isComplete ? tr(locale, "evidence recorded", "已记录证据") : isCurrent ? tr(locale, "current objective", "当前目标") : tr(locale, "queued", "待处理")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {activeTask && activeIndex !== -1 && (
            <p className="mt-3 border-l-2 border-coral pl-3 text-xs leading-5 text-muted">
              <span className="font-semibold text-coral">{tr(locale, "Optional hint · ", "可选提示 · ")}</span>
              {activeTask.hint}
            </p>
          )}

          {(difficulty || attackType || evidence.length > 0) && (
            <div className="mt-4 border-t border-rule pt-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-coral">
                {tr(locale, "Scenario profile", "场景画像")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">
                {difficulty && <span className="rounded border border-rule px-2 py-1 text-muted">{difficultyLabel[difficulty] ? tr(locale, difficultyLabel[difficulty].en, difficultyLabel[difficulty].zh) : difficulty}</span>}
                {attackType && <span className="rounded border border-rule px-2 py-1 text-muted">{attackType}</span>}
              </div>
              {evidence.length > 0 && (
                <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-muted">
                    {tr(locale, "Evidence available in this scene", "本场景可核对的证据")} ({evidence.length})
                  </summary>
                  <ul className="mt-2 space-y-2 text-[11px] text-muted">
                    {evidence.map((item) => (
                      <li key={item.id}>
                        <span className="font-medium text-ink">{item.label}: </span>{item.detail}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
