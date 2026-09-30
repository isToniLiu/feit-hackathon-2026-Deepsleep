"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getLocalizedChapter,
  getLocalizedMentor,
  getStory,
  type DecisionResult,
  type EvidenceItem,
  type RoleId,
} from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";
import { averageChapterScore, getFallbackReasonQuality } from "@/lib/score";
import { buildDebriefSections, type DebriefSections } from "@/lib/debrief";

// 结局页保持报告感：评分、证据、后果和下一步练习按调查报告层级呈现。

function scoreTier(percent: number): "high" | "mid" | "low" {
  if (percent >= 70) return "high";
  if (percent >= 40) return "mid";
  return "low";
}

function containsCjk(value: string): boolean {
  return /[\u3400-\u9fff]/u.test(value);
}

function textMatchesLocale(value: string, locale: "en" | "zh"): boolean {
  return locale === "zh" ? containsCjk(value) : !containsCjk(value);
}

function storedTextMatchesLocale(value: string, storedLocale: "en" | "zh" | undefined, locale: "en" | "zh"): boolean {
  return storedLocale ? storedLocale === locale : textMatchesLocale(value, locale);
}

export function DebriefScreen({
  answers,
  evidence,
  selectedRole,
  onRestart,
  onChooseRole,
}: {
  answers: Record<string, DecisionResult>;
  evidence: EvidenceItem[];
  selectedRole: RoleId | null;
  onRestart: () => void;
  onChooseRole: (roleId: RoleId) => void;
}) {
  const { locale } = useLocale();
  const story = getStory(locale);
  const { debrief, mentors } = story;
  const role = selectedRole ? story.roles[selectedRole] : null;

  const answeredChapterIds = useMemo(
    () => story.chapters.map((c) => c.id).filter((id) => answers[id]),
    [answers, story.chapters],
  );
  const percent = averageChapterScore(answeredChapterIds.map((id) => ({
    choiceId: answers[id].choiceId,
    reasonQuality: getFallbackReasonQuality(answers[id].choiceId, answers[id].reasonQuality),
  })));
  const tier = scoreTier(percent);
  const debriefAnswers = useMemo(
    () => answeredChapterIds.map((chapterId) => ({
      chapterId,
      choiceId: answers[chapterId].choiceId,
      reasonQuality: answers[chapterId].reasonQuality,
      matchedPoints: answers[chapterId].matchedPoints ?? [],
      missedPoints: answers[chapterId].missedPoints ?? [],
      evidenceCount: answers[chapterId].evidenceCount,
      hintLevel: answers[chapterId].hintLevel,
      reportUsed: answers[chapterId].reportUsed,
      decisionLatencyMs: answers[chapterId].decisionLatencyMs,
      repeatedMistake: answers[chapterId].repeatedMistake,
    })),
    [answers, answeredChapterIds],
  );
  const visibleEvidence = useMemo(
    () => evidence.filter((item) => storedTextMatchesLocale(item.text, item.locale, locale)),
    [evidence, locale],
  );
  const evidenceTexts = useMemo(() => visibleEvidence.map((item) => item.text), [visibleEvidence]);
  const localSections = useMemo(
    () => buildDebriefSections(debriefAnswers, evidenceTexts, locale),
    [debriefAnswers, evidenceTexts, locale],
  );
  const debriefRequest = useMemo(
    () => JSON.stringify({ locale, answers: debriefAnswers, evidence: evidenceTexts }),
    [debriefAnswers, evidenceTexts, locale],
  );
  type DebriefReport = {
    summary: string;
    actionCards: { title: string; why: string; doNext: string }[];
  } & DebriefSections;
  const localizedFallback = useMemo<DebriefReport>(() => ({
    summary: debrief.flavorByTier[tier],
    actionCards: debrief.fallbackActionCards,
    ...localSections,
  }), [debrief, localSections, tier]);
  const [reportState, setReportState] = useState<DebriefReport>(() => localizedFallback);
  const [reportLocale, setReportLocale] = useState(locale);
  const report = reportLocale === locale ? reportState : localizedFallback;

  useEffect(() => {
    let active = true;
    void fetch("/api/get-debrief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: debriefRequest,
    })
      .then((response) => response.json())
      .then((json) => {
        if (
          active &&
          json?.success &&
          json?.data?.summary &&
          Array.isArray(json.data.actionCards) &&
          Array.isArray(json.data.evidenceUsed) &&
          Array.isArray(json.data.missedPoints) &&
          Array.isArray(json.data.consequences) &&
          json.data.nextExercise &&
          json.data.behavior
        ) {
          setReportState({
            ...localizedFallback,
            summary: json.data.summary,
            actionCards: json.data.actionCards,
          });
          setReportLocale(locale);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [debriefRequest, locale, localizedFallback]);

  return (
    <main className="flex flex-1 flex-col bg-paper px-5 py-12 text-ink sm:px-10 lg:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 text-center">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
        {debrief.scoreLabel}
      </span>
      <h1 className="font-display text-5xl leading-none tracking-[-0.045em] sm:text-7xl">{debrief.title}</h1>

      <div
        className="flex h-32 w-32 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#d9574d ${percent * 3.6}deg, #dedbd3 0deg)`,
        }}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface text-xl font-semibold">
          {percent}%
        </div>
      </div>
      <p className="max-w-2xl text-lg leading-8 text-muted">{report.summary}</p>

      <div className="w-full text-left">
        <h2 className="mb-3 border-b border-rule pb-3 font-display text-3xl tracking-[-0.03em]">{tr(locale, "After Action Report", "行动复盘")}</h2>
        <div className="flex flex-col gap-3 text-sm">
          <section className="grid grid-cols-2 gap-2">
            <div className="border border-rule bg-surface p-3">
              <p className="text-xs text-zinc-500">{tr(locale, "Reports made", "主动报告")}</p>
              <p className="mt-1 font-semibold">{report.behavior.reportUsedCount} / {report.behavior.chaptersCompleted} {tr(locale, "chapters", "章")}</p>
            </div>
            <div className="border border-rule bg-surface p-3">
              <p className="text-xs text-zinc-500">{tr(locale, "Scene evidence", "现场证据")}</p>
              <p className="mt-1 font-semibold">{report.behavior.evidenceCount} {tr(locale, "items", "条")}</p>
            </div>
            <div className="border border-rule bg-surface p-3">
              <p className="text-xs text-zinc-500">{tr(locale, "Average reason quality", "平均理由质量")}</p>
              <p className="mt-1 font-semibold">{report.behavior.averageReasonQuality} / 3</p>
            </div>
            <div className="border border-rule bg-surface p-3">
              <p className="text-xs text-zinc-500">{tr(locale, "Hints / repeated misses", "提示章节 / 重复遗漏")}</p>
              <p className="mt-1 font-semibold">{report.behavior.hintsUsed} / {report.behavior.repeatedMistakes}</p>
            </div>
            <div className="border border-rule bg-surface p-3">
              <p className="text-xs text-zinc-500">{tr(locale, "Average decision time", "平均决策耗时")}</p>
              <p className="mt-1 font-semibold">{Math.round(report.behavior.averageDecisionLatencyMs / 1000)} {tr(locale, "sec", "秒")}</p>
            </div>
          </section>

          <section className="border border-rule bg-surface p-4">
            <h3 className="font-medium">{tr(locale, "Evidence used this run", "本次用上的证据")}</h3>
            {report.evidenceUsed.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-600">
                {report.evidenceUsed.map((item) => <li key={item}>{item.replace(/^🔍\s*/, "")}</li>)}
              </ul>
            ) : (
              <p className="mt-2 text-zinc-500">{tr(locale, "There was not enough information to confirm that your reasoning used scene evidence.", "没有足够信息确认你在理由中引用了现场证据。")}</p>
            )}
          </section>

          <section className="border border-yellow/40 bg-yellow/10 p-4">
            <h3 className="font-medium">{tr(locale, "Missed teaching points", "遗漏的教学点")}</h3>
            {report.missedPoints.length > 0 ? (
              <ul className="mt-2 space-y-2 text-zinc-600">
                {report.missedPoints.map((point) => (
                  <li key={`${point.chapterId}:${point.pointId}`}>
                    <span className="font-medium text-zinc-700">{point.chapterTitle} · </span>{point.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-zinc-500">{tr(locale, "No missed teaching points were recorded this run.", "本次没有记录到遗漏的教学点。")}</p>
            )}
          </section>

          <section className="border border-rule bg-surface p-4">
            <h3 className="font-medium">{tr(locale, "Consequences of your choices", "选择带来的后果")}</h3>
            <ul className="mt-2 space-y-2 text-zinc-600">
              {report.consequences.map((consequence) => (
                <li key={consequence.chapterId}>
                  <span className="font-medium text-zinc-700">{consequence.chapterTitle} · {consequence.choiceId === "safe" ? tr(locale, "safe response", "安全处置") : tr(locale, "high-risk response", "高风险处置")}:</span> {consequence.text}
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-teal/30 bg-teal/10 p-4">
            <h3 className="font-medium">{tr(locale, "Next micro-exercise: ", "下一步微练习：")}{report.nextExercise.title.replace(/^微练习：|^进阶练习：|^Micro-exercise:\s*|^Advanced exercise:\s*/i, "")}</h3>
            <p className="mt-2 text-zinc-600">{report.nextExercise.prompt}</p>
          </section>
        </div>
      </div>

      <div className="w-full max-w-md text-left">
        <h2 className="mb-2 font-semibold">{tr(locale, "Next training moves", "下一步训练建议")}</h2>
        <ul className="flex flex-col gap-2">
          {report.actionCards.map((card) => (
            <li key={card.title} className="border border-rule bg-surface p-4 text-sm">
              <p className="font-medium">{card.title}</p>
              <p className="mt-1 text-zinc-500">{card.why}</p>
              <p className="mt-2 text-zinc-700">{tr(locale, "Next: ", "下一步：")}{card.doNext}</p>
            </li>
          ))}
        </ul>
      </div>

      {role && (
        <div className="w-full border border-rule bg-surface p-4 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{tr(locale, "Your investigation entry point", "你的调查入口")}</p>
          <p className="mt-2 font-medium">{role.type} · {role.label}</p>
        <p className="mt-1 text-sm text-zinc-500">{tr(locale, "This role gave you one view of IR-247. Choose another role to enter the same incident through a different system and evidence set.", "你从这个岗位看到的是 IR-247 的一个切面。换一个角色，会进入同一事故的另一组系统和证据。")}</p>
        </div>
      )}

      <div className="w-full max-w-md text-left">
        <h2 className="mb-2 font-semibold">{debrief.evidenceTitle}</h2>
        <p className="mb-3 text-sm text-zinc-500">
          {tr(locale, `You left ${visibleEvidence.length} evidence item(s) in the scene. They preserve this role's view of the anomaly in case IR-247.`, `你在现场留下了 ${visibleEvidence.length} 条记录。它们把当前岗位看到的异常固定进 IR-247 案件档案。`)}
        </p>
        <ol className="flex flex-col gap-2">
          {visibleEvidence.map((item, index) => (
            <li key={item.id} className="flex gap-3 border border-rule bg-surface p-3 text-sm">
              <span className="font-mono text-xs text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
              <span>{item.text.replace(/^🔍\s*/, "")}</span>
            </li>
          ))}
          {visibleEvidence.length === 0 && (
            <li className="rounded border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
              {tr(locale, "No investigation records were left.", "没有留下调查记录。")}
            </li>
          )}
        </ol>
      </div>

      <div className="w-full max-w-md text-left">
        <h2 className="mb-2 font-semibold">{tr(locale, "Key decision review", "关键决策回顾")}</h2>
        <ul className="flex flex-col gap-3">
          {answeredChapterIds.map((chapterId) => {
            const chapter = getLocalizedChapter(locale, chapterId);
            const answer = answers[chapterId];
            if (!chapter) return null;
            const storedText = [answer.reason, answer.feedback, ...answer.actionHistory].join(" ");
            const answerMatchesLocale = storedTextMatchesLocale(storedText, answer.locale, locale);
            const choiceLabel = chapter.options.find((choice) => choice.id === answer.choiceId)?.label ?? answer.choiceLabel;
            return (
              <li
                key={chapterId}
                className="rounded border border-zinc-300 p-3 text-sm"
              >
                <p className="font-medium">{chapter.title}</p>
                <p className="text-zinc-500">
                  {tr(locale, "Your choice: ", "你的选择：")}{choiceLabel}
                </p>
                {answerMatchesLocale ? (
                  <>
                    <p className="text-zinc-500">{tr(locale, "Your reasoning: ", "你的理由：")}{answer.reason}</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-zinc-500">{tr(locale, "View action log", "查看行动记录")} ({answer.actionHistory.length})</summary>
                      <ol className="mt-2 flex list-decimal flex-col gap-1 pl-4 text-xs text-zinc-500">
                        {answer.actionHistory.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ol>
                    </details>
                    <p className="mt-1">{answer.feedback}</p>
                  </>
                ) : (
                  <p className="mt-2 text-zinc-500">{tr(locale, "The written response was recorded in another language and is hidden here to keep this review consistent.", "这条文字回答是在另一语言下记录的，为保持当前复盘语言一致，原文已隐藏。")}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="w-full max-w-md text-left">
        <h2 className="mb-2 font-semibold">{role ? tr(locale, "Other role perspectives", "其他可调查的岗位视角") : debrief.rolesRecapTitle}</h2>
        <ul className="flex flex-col gap-2 text-sm text-zinc-600">
          {Object.keys(mentors).map((mentorId) => {
            const mentor = getLocalizedMentor(locale, mentorId);
            if (!mentor) return null;
            const roleId = (Object.keys(story.roles) as RoleId[]).find(
              (id) => story.roles[id].mentorId === mentorId,
            );
            const isCurrent = roleId === selectedRole;
            return (
            <li key={mentorId} className="flex items-center justify-between gap-3 border border-rule bg-surface p-3">
                <span>{mentor.name} · {mentor.role}</span>
                {roleId && !isCurrent && (
                  <button
                    onClick={() => onChooseRole(roleId)}
                    className="shrink-0 rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    {tr(locale, "Restart as this role", "以此岗位重开")}
                  </button>
                )}
                {isCurrent && <span className="shrink-0 text-xs text-zinc-400">{tr(locale, "Current perspective", "当前视角")}</span>}
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={onRestart}
        className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
      >
        {tr(locale, "Start over", "重新开始")}
      </button>
      </div>
    </main>
  );
}
