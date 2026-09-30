import storyData from "../../content/story.json";
import storyEnData from "../../content/story.en.json";

// 类型定义对应 content/story.json 的结构。
// 文案内容后续会被P3替换，字段结构不变时这里不用改。

export interface Option {
  id: string;
  label: string;
}

export interface Chapter {
  id: string;
  mentorId: string;
  threatType: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  attackType: string;
  title: string;
  scenario: string;
  evidence: ChapterEvidence[];
  hints: ChapterHint[];
  teachingPoints: TeachingPoint[];
  outcome: { safe: string; danger: string };
  followUp: { safe: string; danger: string; unsure: string };
  continuityLine?: string;
  options: Option[];
}

export interface ChapterEvidence {
  id: string;
  label: string;
  detail: string;
  teachingPointIds: string[];
}

export interface ChapterHint {
  level: 1 | 2 | 3;
  text: string;
}

export interface TeachingPoint {
  id: string;
  text: string;
  keywords: string[];
}

export interface Mentor {
  name: string;
  role: string;
  line: string;
}

export interface RoleTask {
  label: string;
  hint: string;
}

export type RoleId = "priya" | "marcus" | "aiko";
export type Locale = "zh" | "en";

export interface RoleProfile {
  mentorId: string;
  type: string;
  label: string;
  description: string;
  focus: string;
  route: string;
  mission: string;
  tasks: RoleTask[];
}

export interface Story {
  dashboard: {
    greeting: string;
    incidentTitle: string;
    incidentSubtitle: string;
    actions: { primer: string; skip: string };
    primerContent: { title: string; body: string; cta: string };
  };
  briefing: { title: string; body: string; cta: string };
  roles: Record<RoleId, RoleProfile>;
  mentors: Record<string, Mentor>;
  chapters: Chapter[];
  referenceCard: Record<string, string[]>;
  debrief: {
    title: string;
    scoreLabel: string;
    rolesRecapTitle: string;
    evidenceTitle: string;
    flavorByTier: { high: string; mid: string; low: string };
    fallbackActionCards: { title: string; why: string; doNext: string }[];
  };
  fallback: { safe: string; danger: string; unsure: string };
  fallbackByChapter: Record<string, {
    safe: { low: string; high: string };
    danger: { low: string; high: string };
    unsure: { level1: string; level2: string; level3: string };
  }>;
}

export const story = storyData as unknown as Story;
const stories: Record<Locale, Story> = {
  zh: story,
  en: storyEnData as unknown as Story,
};

export function isLocale(value: unknown): value is Locale {
  return value === "zh" || value === "en";
}

export function getStory(locale: Locale = "zh"): Story {
  return stories[locale];
}

export function maxReasonLen(locale: Locale): number {
  return locale === "en" ? 800 : 400;
}

// 阶段5：一次决策的结果，DecisionScreen完成后回传给page.tsx用于结局页统计。
export interface DecisionResult {
  locale?: Locale;
  choiceId: string;
  choiceLabel: string;
  reason: string;
  feedback: string;
  matchedClues?: MatchedClue[];
  actionHistory: string[];
  reasonQuality?: number;
  matchedPoints?: string[];
  missedPoints?: string[];
  evidenceCount: number;
  hintLevel: HintLevel;
  reportUsed: boolean;
  decisionLatencyMs: number;
  repeatedMistake: boolean;
}

export type HintLevel = 0 | 1 | 2 | 3;

export interface BehaviorEvent {
  chapterId: string;
  choiceId: "safe" | "danger" | "unsure";
  reasonQuality: 0 | 1 | 2 | 3;
  matchedPoints: string[];
  missedPoints: string[];
  evidenceCount: number;
  hintLevel: HintLevel;
  reportUsed: boolean;
  decisionLatencyMs: number;
  repeatedMistake: boolean;
}

export interface FeedbackResult {
  feedback: string;
  reasonQuality: 0 | 1 | 2 | 3;
  matchedPoints: string[];
  missedPoints: string[];
  matchedClues: MatchedClue[];
  followUp: string | null;
}

export interface MatchedClue {
  pointId: string;
  keywords: string[];
  evidenceIds: string[];
}

export interface SceneAction {
  summary: string;
  explanation: string;
  evidence?: string;
}

export interface EvidenceItem {
  id: string;
  chapterId: string;
  text: string;
  locale?: Locale;
}

export type IncidentStatus = "monitoring" | "containment-risk" | "containment-progress";

export function getMentor(mentorId: string): Mentor {
  return story.mentors[mentorId];
}

export function getRole(roleId: RoleId): RoleProfile {
  return story.roles[roleId];
}

export function getChapter(chapterId: string): Chapter | undefined {
  return story.chapters.find((c) => c.id === chapterId);
}

export function getLocalizedChapter(locale: Locale, chapterId: string): Chapter | undefined {
  return getStory(locale).chapters.find((c) => c.id === chapterId);
}

export function getLocalizedMentor(locale: Locale, mentorId: string): Mentor | undefined {
  return getStory(locale).mentors[mentorId];
}

export function assertStory(input: Story = story): void {
  if (!input || !Array.isArray(input.chapters) || input.chapters.length === 0) {
    throw new Error("Story must contain at least one chapter");
  }

  for (const chapter of input.chapters) {
    if (!["beginner", "intermediate", "advanced"].includes(chapter.difficulty) || !chapter.attackType) {
      throw new Error(`Chapter ${chapter.id} is missing difficulty or attackType`);
    }
    if (!Array.isArray(chapter.evidence) || chapter.evidence.length === 0) {
      throw new Error(`Chapter ${chapter.id} is missing evidence`);
    }
    const teachingPointIds = new Set(chapter.teachingPoints?.map((point) => point.id));
    for (const item of chapter.evidence) {
      if (!item.id || !item.label || !item.detail || !Array.isArray(item.teachingPointIds) || item.teachingPointIds.some((id) => !teachingPointIds.has(id))) {
        throw new Error(`Chapter ${chapter.id} has invalid evidence`);
      }
    }
    if (!Array.isArray(chapter.hints) || chapter.hints.length !== 3 || chapter.hints.map((hint) => hint.level).join(",") !== "1,2,3") {
      throw new Error(`Chapter ${chapter.id} must contain level 1-3 hints`);
    }
    if (!chapter.followUp?.safe || !chapter.followUp?.danger || !chapter.followUp?.unsure) {
      throw new Error(`Chapter ${chapter.id} is missing followUp copy`);
    }
    if (!Array.isArray(chapter.teachingPoints) || chapter.teachingPoints.length === 0) {
      throw new Error(`Chapter ${chapter.id} is missing teachingPoints`);
    }
    if (!chapter.outcome?.safe || !chapter.outcome?.danger) {
      throw new Error(`Chapter ${chapter.id} is missing outcome text`);
    }
    const ids = new Set<string>();
    for (const point of chapter.teachingPoints) {
      if (!point.id || ids.has(point.id) || !point.text || !Array.isArray(point.keywords)) {
        throw new Error(`Chapter ${chapter.id} has an invalid teaching point`);
      }
      ids.add(point.id);
    }
  }
}

assertStory();
assertStory(getStory("en"));
