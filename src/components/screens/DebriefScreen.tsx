import {
  getChapter,
  getMentor,
  story,
  type DecisionResult,
  type EvidenceItem,
} from "@/lib/story";

// 阶段5：评分环用纯CSS conic-gradient实现，先求"功能对"，不追求美观（后续UI素材到位再换皮）。

function scoreTier(percent: number): "high" | "mid" | "low" {
  if (percent >= 70) return "high";
  if (percent >= 40) return "mid";
  return "low";
}

export function DebriefScreen({
  answers,
  evidence,
  onRestart,
}: {
  answers: Record<string, DecisionResult>;
  evidence: EvidenceItem[];
  onRestart: () => void;
}) {
  const { debrief, mentors } = story;

  const answeredChapterIds = story.chapters
    .map((c) => c.id)
    .filter((id) => answers[id]);
  const safeCount = answeredChapterIds.filter(
    (id) => answers[id].choiceId === "safe",
  ).length;
  const total = answeredChapterIds.length;
  const percent = total > 0 ? Math.round((safeCount / total) * 100) : 0;
  const tier = scoreTier(percent);

  return (
    <div className="flex flex-1 flex-col items-center gap-8 p-8 text-center">
      <span className="text-xs uppercase tracking-wide text-zinc-400">
        {debrief.scoreLabel}
      </span>
      <h1 className="text-2xl font-semibold">{debrief.title}</h1>

      <div
        className="flex h-32 w-32 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#18181b ${percent * 3.6}deg, #e4e4e7 0deg)`,
        }}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-xl font-semibold">
          {percent}%
        </div>
      </div>
      <p className="max-w-md text-zinc-600">{debrief.flavorByTier[tier]}</p>

      <div className="w-full max-w-md text-left">
        <h2 className="mb-2 font-semibold">{debrief.evidenceTitle}</h2>
        <p className="mb-3 text-sm text-zinc-500">
          你在现场留下了 {evidence.length} 条记录。它们把三个看似独立的请求串成了同一条调查线索。
        </p>
        <ol className="flex flex-col gap-2">
          {evidence.map((item, index) => (
            <li key={item.id} className="flex gap-3 rounded border border-zinc-200 p-3 text-sm">
              <span className="font-mono text-xs text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
              <span>{item.text.replace(/^🔍\s*/, "")}</span>
            </li>
          ))}
          {evidence.length === 0 && (
            <li className="rounded border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
              没有留下调查记录。
            </li>
          )}
        </ol>
      </div>

      <div className="w-full max-w-md text-left">
        <h2 className="mb-2 font-semibold">关键决策回顾</h2>
        <ul className="flex flex-col gap-3">
          {answeredChapterIds.map((chapterId) => {
            const chapter = getChapter(chapterId);
            const answer = answers[chapterId];
            if (!chapter) return null;
            return (
              <li
                key={chapterId}
                className="rounded border border-zinc-300 p-3 text-sm"
              >
                <p className="font-medium">{chapter.title}</p>
                <p className="text-zinc-500">
                  你的选择：{answer.choiceLabel}
                </p>
                <p className="text-zinc-500">你的理由：{answer.reason}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-zinc-500">查看行动记录（{answer.actionHistory.length}）</summary>
                  <ol className="mt-2 flex list-decimal flex-col gap-1 pl-4 text-xs text-zinc-500">
                    {answer.actionHistory.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ol>
                </details>
                <p className="mt-1">{answer.feedback}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="w-full max-w-md text-left">
        <h2 className="mb-2 font-semibold">{debrief.rolesRecapTitle}</h2>
        <ul className="flex flex-col gap-1 text-sm text-zinc-600">
          {Object.keys(mentors).map((mentorId) => {
            const mentor = getMentor(mentorId);
            return (
              <li key={mentorId}>
                {mentor.name} · {mentor.role}
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={onRestart}
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
      >
        重新开始
      </button>
    </div>
  );
}
