import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getLocalizedChapter, getStory, isLocale, type Locale } from "@/lib/story";
import { averageChapterScore } from "@/lib/score";
import {
  buildDebriefSections,
  type DebriefAnswer,
  type DebriefSections,
} from "@/lib/debrief";
import { checkRateLimit, getForwardedIp, isAllowedOrigin } from "@/lib/rate-limit";

interface DebriefResult extends DebriefSections {
  summary: string;
  actionCards: { title: string; why: string; doNext: string }[];
}

function localizedError(locale: Locale, english: string, chinese: string): string {
  return locale === "zh" ? chinese : english;
}

function requestLocaleHint(request: Request): Locale {
  return request.headers.get("accept-language")?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function containsCjk(value: string): boolean {
  return /[一-鿿]/.test(value);
}

const debriefSchema = {
  name: "debrief_result",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "actionCards"],
    properties: {
      summary: { type: "string" },
      actionCards: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "why", "doNext"],
          properties: {
            title: { type: "string" },
            why: { type: "string" },
            doNext: { type: "string" },
          },
        },
      },
    },
  },
} as const;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function fallbackResult(score: number, answers: DebriefAnswer[], evidence: string[], locale: Locale): DebriefResult {
  const storyData = getStory(locale);
  const tier = score >= 70 ? "high" : score >= 40 ? "mid" : "low";
  return {
    summary: storyData.debrief.flavorByTier[tier],
    actionCards: storyData.debrief.fallbackActionCards,
    ...buildDebriefSections(answers, evidence, locale),
  };
}

function normalizeAnswers(value: unknown, locale: Locale): DebriefAnswer[] {
  if (!Array.isArray(value)) return [];
  const answers = value
    .filter((item): item is DebriefAnswer => Boolean(item) && typeof item === "object")
    .slice(0, 3)
    .map((item) => ({
      chapterId: typeof item.chapterId === "string" ? item.chapterId.slice(0, 80) : "",
      choiceId: typeof item.choiceId === "string" ? item.choiceId.slice(0, 40) : "",
      reasonQuality: typeof item.reasonQuality === "number" && item.reasonQuality >= 0 && item.reasonQuality <= 3
        ? Math.round(item.reasonQuality)
        : undefined,
      matchedPoints: Array.isArray(item.matchedPoints) ? item.matchedPoints.filter((id): id is string => typeof id === "string").slice(0, 8) : [],
      missedPoints: Array.isArray(item.missedPoints) ? item.missedPoints.filter((id): id is string => typeof id === "string").slice(0, 8) : [],
      evidenceCount: typeof item.evidenceCount === "number" && item.evidenceCount >= 0 && item.evidenceCount <= 50
        ? Math.round(item.evidenceCount)
        : 0,
      hintLevel: typeof item.hintLevel === "number" && item.hintLevel >= 0 && item.hintLevel <= 3
        ? Math.round(item.hintLevel)
        : 0,
      reportUsed: item.reportUsed === true,
      decisionLatencyMs: typeof item.decisionLatencyMs === "number" && item.decisionLatencyMs >= 0 && item.decisionLatencyMs <= 1_800_000
        ? Math.round(item.decisionLatencyMs)
        : 0,
    }))
    .filter((item) => Boolean(getLocalizedChapter(locale, item.chapterId)) && ["safe", "danger"].includes(item.choiceId));

  const missedSoFar = new Set<string>();
  return answers.map((answer) => {
    const repeatedMistake = (answer.missedPoints ?? []).some((pointId) => missedSoFar.has(pointId));
    (answer.missedPoints ?? []).forEach((pointId) => missedSoFar.add(pointId));
    return { ...answer, repeatedMistake };
  });
}

function validateResult(value: unknown, locale: Locale): Pick<DebriefResult, "summary" | "actionCards"> {
  if (!value || typeof value !== "object") throw new Error("invalid debrief result");
  const result = value as Partial<DebriefResult>;
  if (typeof result.summary !== "string" || result.summary.length === 0 || result.summary.length > 500) {
    throw new Error("invalid debrief summary");
  }
  if (locale === "en" && /[一-鿿]/.test(result.summary)) throw new Error("invalid debrief language");
  if (locale === "zh" && !containsCjk(result.summary)) throw new Error("invalid debrief language");
  if (!Array.isArray(result.actionCards) || result.actionCards.length !== 3) throw new Error("invalid action cards");
  const actionCards = result.actionCards.map((card) => {
    if (!card || typeof card.title !== "string" || typeof card.why !== "string" || typeof card.doNext !== "string") {
      throw new Error("invalid action card");
    }
    if (card.doNext.length > 100) throw new Error("action card is too long");
    if (locale === "en" && /[一-鿿]/.test(`${card.title}${card.why}${card.doNext}`)) {
      throw new Error("invalid action card language");
    }
    if (locale === "zh" && !containsCjk(`${card.title}${card.why}${card.doNext}`)) {
      throw new Error("invalid action card language");
    }
    return { title: card.title.slice(0, 80), why: card.why.slice(0, 180), doNext: card.doNext.slice(0, 100) };
  });
  return { summary: result.summary.trim(), actionCards };
}

export async function POST(request: Request) {
  const errorLocale = requestLocaleHint(request);
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ success: false, data: null, error: localizedError(errorLocale, "Origin is not allowed", "来源不受允许") }, { status: 403 });
  }
  if (!checkRateLimit(`debrief:${getForwardedIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ success: false, data: null, error: localizedError(errorLocale, "Too many requests", "请求太频繁，请稍后再试") }, { status: 429 });
  }

  let body: { locale?: unknown; answers?: unknown; evidence?: unknown };
  try {
    body = (await request.json()) as { locale?: unknown; answers?: unknown; evidence?: unknown };
  } catch {
    return NextResponse.json({ success: false, data: null, error: localizedError(errorLocale, "Invalid JSON body", "请求体不是合法JSON") }, { status: 400 });
  }

  const requestedLocale = body.locale === undefined ? "zh" : body.locale;
  if (!isLocale(requestedLocale)) {
    return NextResponse.json({ success: false, data: null, error: localizedError(errorLocale, "Invalid locale", "locale 非法") }, { status: 400 });
  }
  const locale = requestedLocale;
  const answers = normalizeAnswers(body.answers, locale);
  const evidence = Array.isArray(body.evidence)
    ? body.evidence.filter((item): item is string => typeof item === "string").slice(0, 8).map((item) => item.replace(/^🔍\s*/, "").slice(0, 120))
    : [];
  const score = averageChapterScore(answers);
  const fallback = fallbackResult(score, answers, evidence, locale);

  if (process.env.DEMO_MODE === "1" || !openai) {
    return NextResponse.json({ success: true, data: { ...fallback, source: process.env.DEMO_MODE === "1" ? "demo" : "fallback" }, error: null });
  }

  try {
    const missed = answers.flatMap((answer) => answer.missedPoints ?? []);
    const chapterContext = answers.map((answer) => {
      const chapter = getLocalizedChapter(locale, answer.chapterId);
      if (!chapter) return null;
      return {
        chapterId: chapter.id,
        difficulty: chapter.difficulty,
        attackType: chapter.attackType,
        evidence: chapter.evidence.map((item) => ({ id: item.id, label: item.label, teachingPointIds: item.teachingPointIds })),
        followUp: chapter.followUp,
      };
    }).filter(Boolean);
    const missedCounts = new Map<string, number>();
    missed.forEach((id) => missedCounts.set(id, (missedCounts.get(id) ?? 0) + 1));
    const missedSummary = [...missedCounts.entries()].sort((a, b) => b[1] - a[1]).map(([id, count]) => `${id} (${count} occurrence${count === 1 ? "" : "s"})`).join(", ") || "none";
    const completion = await openai.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are the DDL Lockdown debrief coach. Based on the chapters the learner actually encountered, recorded evidence, matched and missed teaching points, and behavior signals, generate a short summary and exactly three next-step action cards. If a point was missed repeatedly, prioritize practice for that point. Do not introduce a scene the learner did not encounter. Each doNext must be one concrete action beginning with a verb. Reply in ${locale === "zh" ? "Simplified Chinese" : "English"} and return only JSON.` },
          { role: "user", content: `Score: ${score}\nChapters the learner encountered: ${answers.map((answer) => answer.chapterId).join(", ") || "none"}\nMissed teaching points: ${missedSummary}\nRecorded evidence: ${evidence.join("; ") || "none"}\nStructured chapter context:\n${JSON.stringify(chapterContext)}\n\nDeterministic facts for the report (do not invent or contradict them):\n${JSON.stringify({ behavior: fallback.behavior, evidenceUsed: fallback.evidenceUsed, missedPoints: fallback.missedPoints, consequences: fallback.consequences, nextExercise: fallback.nextExercise })}` },
        ],
        response_format: { type: "json_schema", json_schema: debriefSchema },
        max_tokens: 500,
        temperature: 0.3,
      },
      { timeout: 8000, maxRetries: 0 },
    );
    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("LLM returned empty debrief");
    return NextResponse.json({ success: true, data: { ...fallback, ...validateResult(JSON.parse(content), locale), source: "llm" }, error: null });
  } catch (err) {
    console.error("getDebrief失败", { errorType: err instanceof Error ? err.name : "unknown" });
    return NextResponse.json({ success: true, data: { ...fallback, source: "fallback" }, error: null });
  }
}
