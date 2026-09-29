import { story } from "./story";

// 页面状态机：案件看板 → 简报 → 三个连续事故节点 → 结案复盘。

export type FlowNode =
  | { type: "dashboard" }
  | { type: "briefing" }
  | { type: "mentor"; chapterId: string }
  | { type: "chapter"; chapterId: string }
  | { type: "debrief" };

// 三个篇章都在同一条事故链里，全部使用场景化决策模块。
export const DECISION_ENABLED_CHAPTER_IDS = ["chapter1", "chapter2", "chapter3"];

export function buildFlow(): FlowNode[] {
  // 带教同事作为远程支援出现在每个决策场景的聊天窗口中，
  // 不再插入会打断事故节奏的单独mentor介绍屏。
  const chapterNodes = story.chapters.flatMap<FlowNode>((chapter) =>
    DECISION_ENABLED_CHAPTER_IDS.includes(chapter.id)
      ? [{ type: "chapter", chapterId: chapter.id }]
      : [
          { type: "mentor", chapterId: chapter.id },
          { type: "chapter", chapterId: chapter.id },
        ],
  );

  return [
    { type: "dashboard" },
    { type: "briefing" },
    ...chapterNodes,
    { type: "debrief" },
  ];
}
