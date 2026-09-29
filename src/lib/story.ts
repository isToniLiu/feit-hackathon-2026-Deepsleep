import storyData from "../../content/story.json";

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
  title: string;
  scenario: string;
  options: Option[];
}

export interface Mentor {
  name: string;
  role: string;
  line: string;
}

export interface Story {
  dashboard: {
    greeting: string;
    incidentTitle: string;
    incidentSubtitle: string;
    actions: { primer: string; skip: string };
  };
  briefing: { title: string; body: string; cta: string };
  mentors: Record<string, Mentor>;
  chapters: Chapter[];
  referenceCard: Record<string, string[]>;
  debrief: {
    title: string;
    scoreLabel: string;
    rolesRecapTitle: string;
    flavorByTier: { high: string; mid: string; low: string };
  };
  fallback: { safe: string; danger: string; unsure: string };
}

export const story = storyData as unknown as Story;

export function getMentor(mentorId: string): Mentor {
  return story.mentors[mentorId];
}

export function getChapter(chapterId: string): Chapter | undefined {
  return story.chapters.find((c) => c.id === chapterId);
}
