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
  continuityLine?: string;
  options: Option[];
}

export interface Mentor {
  name: string;
  role: string;
  line: string;
}

export type RoleId = "priya" | "marcus" | "aiko";

export interface RoleProfile {
  mentorId: string;
  type: string;
  label: string;
  description: string;
  focus: string;
  route: string;
  mission: string;
  tasks: string[];
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
  };
  fallback: { safe: string; danger: string; unsure: string };
}

export const story = storyData as unknown as Story;

// 阶段5：一次决策的结果，DecisionScreen完成后回传给page.tsx用于结局页统计。
export interface DecisionResult {
  choiceId: string;
  choiceLabel: string;
  reason: string;
  feedback: string;
  actionHistory: string[];
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
