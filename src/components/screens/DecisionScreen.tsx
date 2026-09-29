"use client";

import { useState, type ComponentType } from "react";
import {
  story,
  getRole,
  getMentor,
  type Chapter,
  type DecisionResult,
  type EvidenceItem,
  type IncidentStatus,
  type Option,
  type RoleId,
  type SceneAction,
} from "@/lib/story";
import { PhishingLoginScene } from "./scenes/PhishingLoginScene";
import { MaliciousFileScene } from "./scenes/MaliciousFileScene";
import { AccountLockedScene } from "./scenes/AccountLockedScene";
import { ChatPanel, type ChatMessage } from "@/components/chat/ChatPanel";
import { ObjectivePanel } from "./ObjectivePanel";

type SceneChoice = "safe" | "danger" | "unsure";

type SceneComponent = ComponentType<{
  onChoose: (choice: SceneChoice) => void;
  onAction: (action: SceneAction) => void;
  choiceLocked: boolean;
}>;

const SCENES: Record<string, SceneComponent> = {
  chapter1: PhishingLoginScene,
  chapter2: MaliciousFileScene,
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
  priorEvidence,
  incidentStatus,
  onEvidence,
  onNext,
}: {
  chapter: Chapter;
  priorEvidence: EvidenceItem[];
  incidentStatus: IncidentStatus;
  onEvidence: (text: string) => void;
  onNext: (result: DecisionResult) => void;
}) {
  const mentor = getMentor(chapter.mentorId);
  const role = getRole(chapter.mentorId as RoleId);
  const Scene = SCENES[chapter.id];
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const context: ChatMessage[] = [{ id: nextId(), role: "mentor", text: mentor.line }];
    if (chapter.continuityLine && priorEvidence.length > 0) {
      context.push({
        id: nextId(),
        role: "system",
        text: `CASE FILE UPDATE · ${priorEvidence.length} 条现场记录已带入当前节点`,
      });
      context.push({ id: nextId(), role: "mentor", text: chapter.continuityLine });
    }
    if (incidentStatus === "containment-risk") {
      context.push({
        id: nextId(),
        role: "system",
        text: "ALERT · 前一节点的处置仍存在扩散风险",
      });
    }
    return context;
  });
  const [pendingChoice, setPendingChoice] = useState<Option | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [done, setDone] = useState(false);
  const [lastReason, setLastReason] = useState("");
  const [lastFeedback, setLastFeedback] = useState("");
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  function appendMessage(role: ChatMessage["role"], text: string) {
    setMessages((prev) => [...prev, { id: nextId(), role, text }]);
  }

  function handleAction(action: SceneAction) {
    appendMessage("system", `ACTION LOG · ${action.summary}`);
    appendMessage("mentor", action.explanation);
    setActionHistory((prev) => [...prev, action.summary]);
    if (action.evidence) onEvidence(action.evidence);
  }

  function handleChoose(choiceId: SceneChoice) {
    if (pendingChoice || done || isSending) return;

    if (choiceId === "unsure") {
      const option = chapter.options.find((o) => o.id === "unsure");
      appendMessage("player", option?.label ?? "我不确定，能再讲清楚一点吗？");
      handleAction({
        summary: "你暂停了处置，选择先请求远程支援",
        explanation: "这个动作不会提交凭据、运行文件或发送验证码。你保留了继续调查的空间，我先用更简单的话拆解眼前的风险。",
      });
      appendMessage("mentor", story.fallback.unsure);
      return;
    }

    const option = chapter.options.find((o) => o.id === choiceId);
    if (!option) return;
    setPendingChoice(option);
    appendMessage("player", option.label);
    handleAction({
      summary: `你执行了处置动作：${option.label}`,
      explanation:
        choiceId === "safe"
          ? "系统会保留当前现场，并把请求交给正式的内部处理流程。这个动作不会把凭据、文件或验证码交给未知来源。"
          : "这个动作会把你带到未知来源的页面或程序。它可能扩大事故影响，所以我先把风险状态标记出来，再听你说明判断依据。",
    });
    appendMessage("mentor", "动作已经记录。现在告诉我你为什么这样处理，最好结合你刚才查到的线索。 ");
  }

  const currentEvidenceCount = priorEvidence.filter(
    (item) => item.chapterId === chapter.id,
  ).length;
  const objectiveCompleted = role.tasks.map((_, index) => {
    if (index === 0) return actionHistory.length > 0;
    if (index === 1) return currentEvidenceCount >= 2;
    return done;
  });

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
          actions: actionHistory,
        }),
      });
      const json = await res.json();
      feedback =
        json?.success && json?.data?.feedback
          ? json.data.feedback
          : fallbackFeedback(pendingChoice.id);
    } catch {
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
        <div className="flex w-full max-w-lg items-center justify-between text-[10px] uppercase tracking-[0.16em] text-zinc-400">
          <span>Live incident / {chapter.id.replace("chapter", "0")}</span>
          <span>{actionHistory.length} actions logged</span>
        </div>
        <span className="text-xs uppercase tracking-wide text-zinc-400">{chapter.threatType}</span>
        <h1 className="max-w-lg text-2xl font-semibold">{chapter.title}</h1>
        <p className="max-w-lg text-zinc-600">{chapter.scenario}</p>

        <ObjectivePanel tasks={role.tasks} completed={objectiveCompleted} />

        {Scene && (
          <Scene
            onChoose={handleChoose}
            onAction={handleAction}
            choiceLocked={Boolean(pendingChoice) || done}
          />
        )}

        {pendingChoice && !done && (
          <div className="w-full max-w-lg rounded-lg border border-zinc-300 bg-white p-5 text-left shadow-lg">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600">Decision staged · scene remains open</p>
            <p className="mt-2 text-sm font-medium text-zinc-800">{pendingChoice.label}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {pendingChoice.id === "safe"
                ? "现场已保留，正式处理流程正在接管。"
                : "系统已标记为高风险动作。请不要继续提交更多资料，先说明你当时依据了哪些线索。"}
            </p>
            <p className="mt-4 text-xs text-zinc-400">你仍然可以在左侧切换页面、查看线索和更新案件档案。确认理由后才会离开现场。</p>
          </div>
        )}

        {done && (
          <div className="w-full max-w-lg rounded-lg border border-emerald-300 bg-emerald-50 p-5 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">AI feedback received · scene remains open</p>
            <p className="mt-2 text-sm leading-6 text-emerald-900">反馈已经写入聊天记录。你可以继续查看当前页面和案件档案；确认后再进入下一起事件。</p>
            <button
              onClick={() =>
                onNext({
                  choiceId: pendingChoice!.id,
                  choiceLabel: pendingChoice!.label,
                  reason: lastReason,
                  feedback: lastFeedback,
                  actionHistory,
                })
              }
              className="mt-4 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              确认反馈并进入下一事件 →
            </button>
          </div>
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
        placeholder={pendingChoice ? "打几句你当时的想法……" : "先在浏览器里调查现场"}
      />
    </div>
  );
}
