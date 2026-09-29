import {
  getChapter,
  getMentor,
  getRole,
  story,
  type DecisionResult,
  type EvidenceItem,
  type RoleId,
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
  const { debrief, mentors } = story;
  const role = selectedRole ? getRole(selectedRole) : null;

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

      {role && (
        <div className="w-full max-w-md rounded border border-zinc-200 bg-zinc-50 p-4 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Your investigation entry point</p>
          <p className="mt-2 font-medium">{role.type} · {role.label}</p>
          <p className="mt-1 text-sm text-zinc-500">你从这个岗位看到的是 IR-247 的一个切面。换一个角色，会进入同一事故的另一组系统和证据。</p>
        </div>
      )}

      <div className="w-full max-w-md text-left">
        <h2 className="mb-2 font-semibold">{debrief.evidenceTitle}</h2>
        <p className="mb-3 text-sm text-zinc-500">
          你在现场留下了 {evidence.length} 条记录。它们把当前岗位看到的异常固定进 IR-247 案件档案。
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
        <h2 className="mb-2 font-semibold">{role ? "其他可调查的岗位视角" : debrief.rolesRecapTitle}</h2>
        <ul className="flex flex-col gap-2 text-sm text-zinc-600">
          {Object.keys(mentors).map((mentorId) => {
            const mentor = getMentor(mentorId);
            const roleId = (Object.keys(story.roles) as RoleId[]).find(
              (id) => story.roles[id].mentorId === mentorId,
            );
            const isCurrent = roleId === selectedRole;
            return (
              <li key={mentorId} className="flex items-center justify-between gap-3 rounded border border-zinc-200 p-3">
                <span>{mentor.name} · {mentor.role}</span>
                {roleId && !isCurrent && (
                  <button
                    onClick={() => onChooseRole(roleId)}
                    className="shrink-0 rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    以此岗位重开
                  </button>
                )}
                {isCurrent && <span className="shrink-0 text-xs text-zinc-400">当前视角</span>}
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
