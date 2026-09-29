"use client";

import { useState, type ComponentType } from "react";
import { story, getMentor, type Chapter, type DecisionResult, type Option } from "@/lib/story";
import { PhishingLoginScene } from "./scenes/PhishingLoginScene";
import { AccountLockedScene } from "./scenes/AccountLockedScene";
import { ChatPanel, type ChatMessage } from "@/components/chat/ChatPanel";

// 场景化改造：左边是可交互的模拟界面(调查线索+拍板动作)，
// 右边是贯穿全程的侧边栏聊天——带教同事在这里"远程支援"，
// 唯一一次"为什么这么选"的理由输入也嵌在这个聊天里，不再是单独一屏的表单。
// 🧭参考卡、🫁暂停都是Should项，这里先不做，见DEV_PLAN.md。

type SceneChoice = "safe" | "danger" | "unsure";

type SceneComponent = ComponentType<{
  onChoose: (choice: SceneChoice) => void;
  onInvestigate: (note: string) => void;
}>;

// 目前只有篇章①③接了真实场景；篇章②(Should项)还没做，暂时不会走到这个组件。
const SCENES: Record<string, SceneComponent> = {
  chapter1: PhishingLoginScene,
  chapter3: AccountLockedScene,
};

function fallbackFeedback(choiceId: string | undefined): string {
  return choiceId === "danger" ? story.fallback.danger : story.fallback.safe;
}

let msgSeq = 0;
function nextId(): string {
  msgSeq += 1;
  return `msg-${msgSeq}`;
}

export function DecisionScreen({
  chapter,
  onNext,
}: {
  chapter: Chapter;
  onNext: (result: DecisionResult) => void;
}) {
  const mentor = getMentor(chapter.mentorId);
  const Scene = SCENES[chapter.id];

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: nextId(), role: "mentor", text: mentor.line },
  ]);
  const [pendingChoice, setPendingChoice] = useState<Option | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [done, setDone] = useState(false);
  const [lastReason, setLastReason] = useState("");
  const [lastFeedback, setLastFeedback] = useState("");

  function appendMessage(role: ChatMessage["role"], text: string) {
    setMessages((prev) => [...prev, { id: nextId(), role, text }]);
  }

  function handleInvestigate(note: string) {
    appendMessage("system", note);
  }

  function handleChoose(choiceId: SceneChoice) {
    if (choiceId === "unsure") {
      const option = chapter.options.find((o) => o.id === "unsure");
      appendMessage("player", option?.label ?? "我不确定，能再讲清楚一点吗？");
      appendMessage("mentor", story.fallback.unsure);
      return; // 不算拍板，玩家还能回场景里继续操作
    }

    const option = chapter.options.find((o) => o.id === choiceId);
    if (!option) return;
    setPendingChoice(option);
    appendMessage("player", option.label);
    appendMessage("mentor", "为什么你决定这么做？打几句告诉我你当时是怎么想的。");
  }

  async function handleSend() {
    if (!pendingChoice || inputValue.trim().length === 0 || isSending) return;
    const reason = inputValue.trim();
    appendMessage("player", reason);
    setInputValue("");
    setIsSending(true);

    let feedback: string;
    try {
      const res = await fetch("/api/get-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapter.id,
          choice: pendingChoice.id,
          reason,
        }),
      });
      const json = await res.json();
      feedback =
        json?.success && json?.data?.feedback
          ? json.data.feedback
          : fallbackFeedback(pendingChoice.id);
    } catch {
      // 兜底机制（Must项）：网络请求本身失败时，前端也不卡死，直接用预设文案。
      feedback = fallbackFeedback(pendingChoice.id);
    }

    appendMessage("mentor", feedback);
    setLastReason(reason);
    setLastFeedback(feedback);
    setIsSending(false);
    setDone(true);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-6 text-center">
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          {chapter.threatType}
        </span>
        <h1 className="max-w-lg text-2xl font-semibold">{chapter.title}</h1>
        <p className="max-w-lg text-zinc-600">{chapter.scenario}</p>

        {Scene && !pendingChoice && (
          <Scene onChoose={handleChoose} onInvestigate={handleInvestigate} />
        )}

        {pendingChoice && !done && (
          <p className="text-sm text-zinc-500">
            已经做出决定了，去右边跟{mentor.name}说说你当时是怎么想的 →
          </p>
        )}

        {done && (
          <button
            onClick={() =>
              onNext({
                choiceId: pendingChoice!.id,
                choiceLabel: pendingChoice!.label,
                reason: lastReason,
                feedback: lastFeedback,
              })
            }
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
          >
            下一步
          </button>
        )}
      </div>

      <ChatPanel
        mentorName={`${mentor.name} · ${mentor.role}`}
        messages={messages}
        inputEnabled={!!pendingChoice && !done}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        isSending={isSending}
        placeholder={pendingChoice ? "打几句你当时的想法……" : "先在左边做出决定"}
      />
    </div>
  );
}
