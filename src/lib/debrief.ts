import { getLocalizedChapter, type Locale } from "@/lib/story";

export interface DebriefAnswer {
  chapterId: string;
  choiceId: string;
  reasonQuality?: number;
  matchedPoints?: string[];
  missedPoints?: string[];
  evidenceCount?: number;
  hintLevel?: number;
  reportUsed?: boolean;
  decisionLatencyMs?: number;
  repeatedMistake?: boolean;
}

export interface MissedPoint {
  chapterId: string;
  chapterTitle: string;
  pointId: string;
  text: string;
  repeated: boolean;
}

export interface Consequence {
  chapterId: string;
  chapterTitle: string;
  choiceId: "safe" | "danger";
  text: string;
}

export interface NextExercise {
  title: string;
  prompt: string;
}

export interface BehaviorSummary {
  chaptersCompleted: number;
  reportUsedCount: number;
  evidenceCount: number;
  averageReasonQuality: number;
  averageDecisionLatencyMs: number;
  hintsUsed: number;
  repeatedMistakes: number;
}

export interface DebriefSections {
  evidenceUsed: string[];
  missedPoints: MissedPoint[];
  consequences: Consequence[];
  nextExercise: NextExercise;
  behavior: BehaviorSummary;
}

function normalized(value: string): string {
  return value.replace(/^🔍\s*/, "").trim().toLowerCase();
}

export function buildDebriefSections(
  answers: DebriefAnswer[],
  evidence: string[],
  locale: Locale = "zh",
): DebriefSections {
  const evidenceUsed = new Set<string>();
  const missedPoints: MissedPoint[] = [];
  const consequences: Consequence[] = [];
  const seenMissed = new Set<string>();
  const previouslyMissed = new Set<string>();

  for (const answer of answers) {
    const chapter = getLocalizedChapter(locale, answer.chapterId);
    if (!chapter || !["safe", "danger"].includes(answer.choiceId)) continue;

    const pointById = new Map(chapter.teachingPoints.map((point) => [point.id, point]));
    const matchedIds = new Set(
      (answer.matchedPoints ?? []).filter((pointId) => pointById.has(pointId)),
    );
    const requestedMissedIds = new Set(
      (answer.missedPoints ?? []).filter((pointId) => pointById.has(pointId)),
    );
    const missedIds = requestedMissedIds.size > 0
      ? requestedMissedIds
      : new Set(chapter.teachingPoints
        .filter((point) => !matchedIds.has(point.id))
        .map((point) => point.id));

    for (const pointId of matchedIds) {
      const point = pointById.get(pointId);
      if (!point) continue;
      const keywords = [point.text, ...point.keywords].map(normalized).filter(Boolean);
      for (const item of evidence) {
        const evidenceText = normalized(item);
        if (keywords.some((keyword) => evidenceText.includes(keyword))) {
          evidenceUsed.add(item);
        }
      }
    }

    for (const pointId of missedIds) {
      if (matchedIds.has(pointId) || seenMissed.has(`${answer.chapterId}:${pointId}`)) continue;
      const point = pointById.get(pointId);
      if (!point) continue;
      seenMissed.add(`${answer.chapterId}:${pointId}`);
      missedPoints.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        pointId: point.id,
        text: point.text,
        repeated: previouslyMissed.has(point.id),
      });
    }

    for (const pointId of missedIds) previouslyMissed.add(pointId);

    consequences.push({
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      choiceId: answer.choiceId as "safe" | "danger",
      text: chapter.outcome[answer.choiceId as "safe" | "danger"],
    });
  }

  const firstMissed = missedPoints.find((point) => point.repeated) ?? missedPoints[0];
  const nextExercise = firstMissed
    ? firstMissed.repeated
      ? locale === "en"
        ? {
            title: `Focused practice: ${firstMissed.chapterTitle}`,
            prompt: `You missed “${firstMissed.text}” again. Review the related evidence, write down two concrete clues, then explain why the formal channel is the safer next step.`,
          }
        : {
            title: `强化练习：${firstMissed.chapterTitle}`,
            prompt: `你再次遗漏了“${firstMissed.text}”。先回看相关证据，再写出两个具体线索，最后说明为什么要走正式渠道。`,
          }
      : locale === "en"
        ? {
            title: `Micro-exercise: ${firstMissed.chapterTitle}`,
            prompt: `Review the scene evidence related to “${firstMissed.text}”, then explain in one sentence what you will check first next time.`,
          }
        : {
            title: `微练习：${firstMissed.chapterTitle}`,
            prompt: `重新查看与“${firstMissed.text}”相关的现场证据，然后用一句话说明你下一次会先核对什么。`,
          }
    : {
        title: locale === "en" ? "Advanced practice: evidence before action" : "进阶练习：先说证据，再做决定",
        prompt: locale === "en"
          ? "Use fewer hints next time: write down two concrete clues before choosing the safe response."
          : "下一次减少提示，先写出两个具体线索，再选择安全处置方式。",
      };

  const qualities = answers.map((answer) => (
    typeof answer.reasonQuality === "number"
      ? Math.max(0, Math.min(3, Math.round(answer.reasonQuality)))
      : answer.choiceId === "safe" ? 2 : 1
  ));

  return {
    evidenceUsed: [...evidenceUsed],
    missedPoints,
    consequences,
    nextExercise,
    behavior: {
      chaptersCompleted: answers.length,
      reportUsedCount: answers.filter((answer) => answer.reportUsed).length,
      evidenceCount: evidence.length,
      averageReasonQuality: qualities.length > 0
        ? Math.round((qualities.reduce((sum, quality) => sum + quality, 0) / qualities.length) * 10) / 10
        : 0,
      averageDecisionLatencyMs: answers.length > 0
        ? Math.round(answers.reduce((sum, answer) => sum + Math.max(0, Math.min(1_800_000, answer.decisionLatencyMs ?? 0)), 0) / answers.length)
        : 0,
      hintsUsed: answers.filter((answer) => (answer.hintLevel ?? 0) > 0).length,
      repeatedMistakes: answers.filter((answer) => answer.repeatedMistake).length,
    },
  };
}
