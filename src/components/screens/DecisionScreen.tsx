"use client";

import { useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  getStory,
  type Chapter,
  type DecisionResult,
  type EvidenceItem,
  type IncidentStatus,
  type Option,
  type RoleId,
  type SceneAction,
  type ChapterEvidence,
  type HintLevel,
  type Locale,
  type MatchedClue,
} from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";
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
  overlay?: ReactNode;
  topBar?: ReactNode;
}>;

const SCENES: Record<string, SceneComponent> = {
  chapter1: PhishingLoginScene,
  chapter2: MaliciousFileScene,
  chapter3: AccountLockedScene,
};

function fallbackFeedback(choiceId: string | undefined, locale: "zh" | "en"): string {
  const localizedStory = getStory(locale);
  return choiceId === "danger" ? localizedStory.fallback.danger : localizedStory.fallback.safe;
}

let msgSeq = 0;
function nextId(): string {
  msgSeq += 1;
  return `msg-${msgSeq}`;
}

function hasReportAction(actions: string[]): boolean {
  return actions.some((action) =>
    /(上报|报告|内部渠道|官方流程|联系\s*IT|report|helpdesk|official channel)/i.test(action),
  );
}

function followUpMatchesLocale(value: string, locale: Locale): boolean {
  const hasCjk = /[\u3400-\u9fff]/.test(value);
  return locale === "en" ? !hasCjk : hasCjk;
}

function parseMatchedClues(value: unknown): MatchedClue[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is MatchedClue => {
    if (!item || typeof item !== "object") return false;
    const clue = item as Partial<MatchedClue>;
    return typeof clue.pointId === "string"
      && Array.isArray(clue.keywords)
      && clue.keywords.every((keyword) => typeof keyword === "string")
      && Array.isArray(clue.evidenceIds)
      && clue.evidenceIds.every((evidenceId) => typeof evidenceId === "string");
  });
}

export function DecisionScreen({
  chapter,
  priorEvidence,
  priorAnswers,
  incidentStatus,
  onEvidence,
  onNext,
}: {
  chapter: Chapter;
  priorEvidence: EvidenceItem[];
  priorAnswers: { chapterId: string; choiceId: string; reasonQuality?: number }[];
  incidentStatus: IncidentStatus;
  onEvidence: (text: string) => void;
  onNext: (result: DecisionResult) => void;
}) {
  const { locale } = useLocale();
  const localizedStory = getStory(locale);
  const mentor = localizedStory.mentors[chapter.mentorId];
  const role = localizedStory.roles[chapter.mentorId as RoleId];
  const Scene = SCENES[chapter.id];
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const context: ChatMessage[] = [{ id: nextId(), role: "mentor", text: mentor.line, locale }];
    if (chapter.continuityLine && priorEvidence.length > 0) {
      context.push({
        id: nextId(),
        role: "system",
        text: `${tr(locale, "CASE FILE UPDATE", "案件档案更新")} · ${priorEvidence.length} ${tr(locale, "evidence items carried into this scene", "条现场记录已带入当前节点")}`,
        locale,
      });
      context.push({ id: nextId(), role: "mentor", text: chapter.continuityLine, locale });
    }
    if (incidentStatus === "containment-risk") {
      context.push({
        id: nextId(),
        role: "system",
        text: tr(locale, "ALERT · The previous response still carries a spread risk", "警报 · 前一节点的处置仍存在扩散风险"),
        locale,
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
  const [lastFollowUp, setLastFollowUp] = useState<string | null>(null);
  const [lastReasonQuality, setLastReasonQuality] = useState<number | undefined>();
  const [lastMatchedPoints, setLastMatchedPoints] = useState<string[]>([]);
  const [lastMissedPoints, setLastMissedPoints] = useState<string[]>([]);
  const [lastMatchedClues, setLastMatchedClues] = useState<MatchedClue[]>([]);
  const [feedbackLocale, setFeedbackLocale] = useState<Locale | null>(null);
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [unsureCount, setUnsureCount] = useState(0);
  const [seenEvidence, setSeenEvidence] = useState<Set<string>>(
    () => new Set(priorEvidence.map((item) => item.text)),
  );
  const decisionStartedAt = useRef<number | null>(null);
  const feedbackIsCurrentLocale = feedbackLocale === locale;

  function getDecisionStartedAt(): number {
    return decisionStartedAt.current ?? 0;
  }

  function appendMessage(role: ChatMessage["role"], text: string) {
    setMessages((prev) => [...prev, { id: nextId(), role, text, locale }]);
  }

  function handleAction(action: SceneAction) {
    appendMessage("system", `${tr(locale, "ACTION LOG", "行动日志")} · ${action.summary}`);
    appendMessage("mentor", action.explanation);
    setActionHistory((prev) => [...prev, action.summary]);
    if (action.evidence) {
      setSeenEvidence((previous) => {
        const next = new Set(previous);
        next.add(action.evidence!);
        return next;
      });
      onEvidence(action.evidence);
    }
  }

  function handleChoose(choiceId: SceneChoice) {
    if (pendingChoice || done || isSending) return;
    // eslint-disable-next-line react-hooks/purity -- this handler runs only after a user action.
    if (decisionStartedAt.current === null) decisionStartedAt.current = Date.now();

    if (choiceId === "unsure") {
      const option = chapter.options.find((o) => o.id === "unsure");
      appendMessage("player", option?.label ?? tr(locale, "I'm not sure — can you explain more?", "我不确定，能再讲清楚一点吗？"));
      handleAction({
        summary: tr(locale, "You paused the response and requested remote support", "你暂停了处置，选择先请求远程支援"),
        explanation: tr(locale, "This does not submit credentials, run a file, or send a verification code. You kept room to investigate, so I will break down the risk in simpler terms.", "这个动作不会提交凭据、运行文件或发送验证码。你保留了继续调查的空间，我先用更简单的话拆解眼前的风险。"),
      });
      const nextHintLevel = Math.min(unsureCount + 1, 3) as 1 | 2 | 3;
      setUnsureCount(nextHintLevel);
      void (async () => {
        try {
          const res = await fetch("/api/get-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              locale,
              chapterId: chapter.id,
              choice: "unsure",
              reason: "",
              evidence: priorEvidence.map((item) => item.text),
              priorAnswers,
              hintLevel: nextHintLevel,
              reportUsed: hasReportAction(actionHistory),
              evidenceCount: seenEvidence.size,
              decisionLatencyMs: Math.min(Date.now() - getDecisionStartedAt(), 1_800_000),
            }),
          });
          const json = await res.json();
          const hint = typeof json?.data?.feedback === "string" && followUpMatchesLocale(json.data.feedback, locale)
            ? json.data.feedback
            : localizedStory.fallback.unsure;
          appendMessage("mentor", hint);
        } catch {
          appendMessage("mentor", localizedStory.fallback.unsure);
        }
      })();
      return;
    }

    const option = chapter.options.find((o) => o.id === choiceId);
    if (!option) return;
    setPendingChoice(option);
    appendMessage("player", option.label);
    handleAction({
      summary: `${tr(locale, "You executed the response action", "你执行了处置动作")}：${option.label}`,
      explanation:
        choiceId === "safe"
          ? tr(locale, "The scene stays preserved and the request goes to the formal internal process. This does not hand credentials, files, or codes to an unknown source.", "系统会保留当前现场，并把请求交给正式的内部处理流程。这个动作不会把凭据、文件或验证码交给未知来源。")
          : tr(locale, "This action takes you to an unknown page or program and may expand the incident. I marked the risk first; now explain the clues behind your decision.", "这个动作会把你带到未知来源的页面或程序。它可能扩大事故影响，所以我先把风险状态标记出来，再听你说明判断依据。"),
    });
    appendMessage("mentor", tr(locale, "Action recorded. Tell me why you handled it this way, ideally using the clues you just checked.", "动作已经记录。现在告诉我你为什么这样处理，最好结合你刚才查到的线索。"));
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
    if (decisionStartedAt.current === null) decisionStartedAt.current = Date.now();
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
          locale,
          chapterId: chapter.id,
          choice: pendingChoice.id,
          reason,
          actions: actionHistory,
          evidence: priorEvidence.map((item) => item.text),
          priorAnswers,
          reportUsed: hasReportAction(actionHistory),
          evidenceCount: seenEvidence.size,
          hintLevel: Math.min(unsureCount, 3),
          decisionLatencyMs: Math.min(Date.now() - getDecisionStartedAt(), 1_800_000),
        }),
      });
      const json = await res.json();
      feedback =
        json?.success && typeof json?.data?.feedback === "string" && followUpMatchesLocale(json.data.feedback, locale)
          ? json.data.feedback
          : fallbackFeedback(pendingChoice.id, locale);
      const reasonQuality = typeof json?.data?.reasonQuality === "number" ? json.data.reasonQuality : undefined;
      setLastReasonQuality(reasonQuality);
      setLastMatchedPoints(Array.isArray(json?.data?.matchedPoints) ? json.data.matchedPoints : []);
      setLastMissedPoints(Array.isArray(json?.data?.missedPoints) ? json.data.missedPoints : []);
      setLastMatchedClues(parseMatchedClues(json?.data?.matchedClues));
      const returnedFollowUp = typeof json?.data?.followUp === "string" ? json.data.followUp.trim() : null;
      const localizedFollowUp = pendingChoice.id === "safe" || pendingChoice.id === "danger"
        ? chapter.followUp[pendingChoice.id]
        : null;
      const followUp = returnedFollowUp && followUpMatchesLocale(returnedFollowUp, locale)
        ? returnedFollowUp
        : reasonQuality !== undefined && reasonQuality <= 1
          ? localizedFollowUp
          : null;
      setLastFollowUp(followUp);
      setFeedbackLocale(locale);
    } catch {
      feedback = fallbackFeedback(pendingChoice.id, locale);
      setLastReasonQuality(undefined);
      setLastMatchedPoints([]);
      setLastMissedPoints([]);
      setLastMatchedClues([]);
      setLastFollowUp(null);
      setFeedbackLocale(locale);
    }

    appendMessage("mentor", feedback);
    setLastReason(reason);
    setLastFeedback(feedback);
    setIsSending(false);
    setDone(true);
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-none flex-col overflow-visible bg-paper lg:flex-1 lg:flex-row lg:overflow-hidden">
      <div className="flex min-h-0 min-w-0 w-full flex-none flex-col items-center justify-start overflow-visible p-3 lg:flex-1 lg:overflow-hidden lg:p-5">
        {Scene && (
          <Scene
            onChoose={handleChoose}
            onAction={handleAction}
            choiceLocked={Boolean(pendingChoice) || done}
            overlay={
              pendingChoice ? (
                done && feedbackIsCurrentLocale ? (
                  <div className="w-full rounded-xl border border-teal/50 bg-surface p-5 text-left shadow-[0_20px_50px_rgba(30,28,20,0.24)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">{tr(locale, "AI feedback received · scene remains open", "AI 反馈已收到 · 现场仍保持开放")}</p>
                    <p className="mt-2 text-sm leading-6 text-emerald-900">{tr(locale, "The feedback is in the chat. You can keep checking the page and case file; confirm it when you are ready for the next incident.", "反馈已经写入聊天记录。你可以继续查看当前页面和案件档案；确认后再进入下一起事件。")}</p>
                    <p className="mt-2 text-xs text-emerald-700">{tr(locale, "AI text is coaching only; the score and teaching points are determined by rules.", "AI 文案只提供教练反馈；分数和教学点由规则判定。")}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em]">
                      <span className="rounded-full border border-teal/30 bg-white/60 px-2 py-1 text-teal">{tr(locale, "Reason clues recognized", "已识别理由线索")} · {lastMatchedClues.length}</span>
                      <span className="rounded-full border border-yellow/40 bg-white/60 px-2 py-1 text-ink">{tr(locale, "Teaching points to revisit", "待复习教学点")} · {lastMissedPoints.length}</span>
                      {lastReasonQuality !== undefined && <span className="rounded-full border border-rule bg-white/60 px-2 py-1 text-muted">{tr(locale, "Reason quality", "理由质量")} · {lastReasonQuality}/3</span>}
                    </div>
                    {lastMatchedClues.length > 0 && (
                      <div className="mt-4 rounded-lg border border-teal/30 bg-teal/5 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800">{tr(locale, "Evidence linked to your reasoning", "与你理由关联的证据")}</p>
                        <ul className="mt-2 space-y-2 text-xs leading-5 text-zinc-700">
                          {lastMatchedClues.map((clue) => {
                            const point = chapter.teachingPoints.find((item) => item.id === clue.pointId);
                            const evidence = chapter.evidence.filter((item) => clue.evidenceIds.includes(item.id));
                            return (
                              <li key={clue.pointId}>
                                <p className="font-medium">{point?.text ?? clue.pointId}</p>
                                {evidence.length > 0 && <p className="mt-0.5 text-zinc-500">{tr(locale, "Scene evidence: ", "现场证据：")}{evidence.map((item) => item.label).join(" · ")}</p>}
                                <p className="mt-0.5 text-zinc-400">{tr(locale, "Matched terms: ", "命中词：")}{clue.keywords.join(", ")}</p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {lastFollowUp && (
                      <p className="mt-3 border-l-2 border-emerald-400 pl-3 text-sm text-emerald-800">
                        <span className="font-semibold">{tr(locale, "Coach follow-up: ", "教练追问：")}</span>{lastFollowUp}
                      </p>
                    )}
                    <button
                      onClick={() =>
                        onNext({
                          locale,
                          choiceId: pendingChoice.id,
                          choiceLabel: pendingChoice.label,
                          reason: lastReason,
                          feedback: lastFeedback,
                          matchedClues: lastMatchedClues,
                          actionHistory,
                          reasonQuality: lastReasonQuality,
                          matchedPoints: lastMatchedPoints,
                          missedPoints: lastMissedPoints,
                          evidenceCount: seenEvidence.size,
                          hintLevel: Math.min(unsureCount, 3) as HintLevel,
                          reportUsed: hasReportAction(actionHistory),
                          decisionLatencyMs: Math.min(Date.now() - getDecisionStartedAt(), 1_800_000),
                          repeatedMistake: false,
                        })
                      }
                      className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
                    >
                      {tr(locale, "Confirm feedback and continue →", "确认反馈并进入下一事件 →")}
                    </button>
                  </div>
                ) : (
                  <div className="w-full rounded-lg border border-rule bg-surface p-5 text-left shadow-[0_18px_45px_rgba(30,28,20,0.2)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600">{tr(locale, "Decision staged · scene remains open", "决策已暂存 · 现场仍保持开放")}</p>
                    <p className="mt-2 text-sm font-medium text-zinc-800">{pendingChoice.label}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {pendingChoice.id === "safe"
                        ? tr(locale, "The scene is preserved and the formal process is taking over.", "现场已保留，正式处理流程正在接管。")
                        : tr(locale, "This is marked as a high-risk action. Do not submit more information; first explain which clues informed you.", "系统已标记为高风险动作。请不要继续提交更多资料，先说明你当时依据了哪些线索。")}
                    </p>
                    <p className="mt-4 text-xs text-zinc-400">{tr(locale, "You can still switch pages, inspect clues, and update the case file. You will leave the scene after confirming your reasoning.", "你仍然可以在左侧切换页面、查看线索和更新案件档案。确认理由后才会离开现场。")}</p>
                  </div>
                )
              ) : undefined
            }
            topBar={
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-coral">
                    {tr(locale, "Live incident", "实时事件")} / {chapter.id.replace("chapter", "0")} · {chapter.threatType}
                  </p>
                  <p className="mt-1 truncate text-base font-semibold text-ink">{chapter.title}</p>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-muted">
                  {actionHistory.length} {tr(locale, "actions logged", "个动作已记录")}
                </span>
              </div>
            }
          />
        )}

      </div>

      <ChatPanel
        mentorName={`${mentor.name} · ${mentor.role}`}
        messages={messages}
        inputEnabled={!!pendingChoice && !(done && feedbackIsCurrentLocale)}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        isSending={isSending}
        placeholder={pendingChoice ? tr(locale, "Write a few lines about your reasoning…", "打几句你当时的想法……") : tr(locale, "Investigate the scene in the browser first", "先在浏览器里调查现场")}
        safetyNote={tr(locale, "Use fictional exercise details only. Never enter real passwords, verification codes, tokens, or personal data.", "请只使用虚构演练信息，不要输入真实密码、验证码、Token 或个人资料。")}
        objectives={
          <ObjectivePanel
            tasks={role.tasks}
            completed={objectiveCompleted}
            evidence={chapter.evidence as ChapterEvidence[]}
            difficulty={chapter.difficulty}
            attackType={chapter.attackType}
          />
        }
      />
    </div>
  );
}
