"use client";

import { useState } from "react";
import { story, type Chapter, type DecisionResult, type Option } from "@/lib/story";
import { PhishingLoginScene } from "./scenes/PhishingLoginScene";
import { AccountLockedScene } from "./scenes/AccountLockedScene";

// 阶段2/3 + 场景化改造：决策模块。
// 流程：在模拟界面里做出动作(不是选抽象选项) → 输入理由 → 调用/api/get-feedback获取反馈 → 下一步
// 🤔"我不确定"求助选项、🧭参考卡、🫁暂停都是Should项，这里先不做，见DEV_PLAN.md。

type Step = "scene" | "reason" | "submitting" | "feedback";

// chapter.id → 对应的模拟界面场景组件。目前只有篇章①③接了真实场景，
// 篇章②（Should项）还没做场景，暂时不会走到这个组件。
const SCENES: Record<string, React.ComponentType<{ onChoose: (id: "safe" | "danger") => void }>> = {
  chapter1: PhishingLoginScene,
  chapter3: AccountLockedScene,
};

function fallbackFeedback(choiceId: string | undefined): string {
  return choiceId === "danger" ? story.fallback.danger : story.fallback.safe;
}

export function DecisionScreen({
  chapter,
  onNext,
}: {
  chapter: Chapter;
  onNext: (result: DecisionResult) => void;
}) {
  const [step, setStep] = useState<Step>("scene");
  const [selected, setSelected] = useState<Option | null>(null);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");

  const Scene = SCENES[chapter.id];

  function handleChoose(optionId: "safe" | "danger") {
    const option = chapter.options.find((o) => o.id === optionId);
    if (!option) return;
    setSelected(option);
    setStep("reason");
  }

  async function submitReason() {
    if (!selected || reason.trim().length === 0) return;
    setStep("submitting");

    try {
      const res = await fetch("/api/get-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapter.id,
          choice: selected.id,
          reason,
        }),
      });
      const json = await res.json();
      setFeedback(
        json?.success && json?.data?.feedback
          ? json.data.feedback
          : fallbackFeedback(selected.id),
      );
    } catch {
      // 兜底机制（Must项）：网络请求本身失败时，前端也不卡死，直接用预设文案。
      setFeedback(fallbackFeedback(selected.id));
    }

    setStep("feedback");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="text-xs uppercase tracking-wide text-zinc-400">
        {chapter.threatType}
      </span>
      <h1 className="max-w-lg text-2xl font-semibold">{chapter.title}</h1>

      {step === "scene" && (
        <>
          <p className="max-w-lg text-zinc-600">{chapter.scenario}</p>
          {Scene ? (
            <Scene onChoose={handleChoose} />
          ) : (
            <p className="text-sm text-red-500">
              这个篇章还没接真实场景（缺 SCENES[{chapter.id}]）
            </p>
          )}
        </>
      )}

      {(step === "reason" || step === "submitting") && selected && (
        <div className="flex w-full max-w-md flex-col gap-3">
          <p className="text-sm text-zinc-500">你刚才：{selected.label}</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="打一句为什么这么选……"
            className="w-full rounded border border-zinc-300 p-3 text-sm"
            rows={3}
            disabled={step === "submitting"}
          />
          <button
            onClick={submitReason}
            disabled={reason.trim().length === 0 || step === "submitting"}
            className="self-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
          >
            {step === "submitting" ? "获取中……" : "获取AI教练反馈"}
          </button>
        </div>
      )}

      {step === "feedback" && (
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="rounded border border-zinc-300 p-4 text-left text-sm">
            {feedback}
          </div>
          <button
            onClick={() =>
              selected &&
              onNext({
                choiceId: selected.id,
                choiceLabel: selected.label,
                reason,
                feedback,
              })
            }
            className="self-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
          >
            下一步
          </button>
        </div>
      )}
    </div>
  );
}
