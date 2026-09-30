export function chapterScore(choiceId: string, reasonQuality: number): number {
  const safeQuality = Math.max(0, Math.min(3, Math.round(reasonQuality)));
  const choicePart = choiceId === "safe" ? 60 : 0;
  const reasonPart = Math.round((safeQuality / 3) * 40);
  return choicePart + reasonPart;
}

export function getFallbackReasonQuality(choiceId: string, reasonQuality?: number): number {
  if (typeof reasonQuality === "number" && Number.isFinite(reasonQuality)) return reasonQuality;
  return choiceId === "safe" ? 2 : 1;
}

export function averageChapterScore(
  answers: { choiceId: string; reasonQuality?: number }[],
): number {
  if (answers.length === 0) return 0;
  const total = answers.reduce(
    (sum, answer) => sum + chapterScore(answer.choiceId, getFallbackReasonQuality(answer.choiceId, answer.reasonQuality)),
    0,
  );
  return Math.round(total / answers.length);
}
