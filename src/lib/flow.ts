import { story } from "./story";

// 页面状态机：节点顺序对应 PRD.md 1.1节逐屏流程表
// dashboard → briefing → mentor1 → chapter1 → mentor2 → chapter2 → mentor3 → chapter3 → debrief
// "30秒入门速览"是Could项，先不进状态机。

export type FlowNode =
  | { type: "dashboard" }
  | { type: "briefing" }
  | { type: "mentor"; chapterId: string }
  | { type: "chapter"; chapterId: string }
  | { type: "debrief" };

// Must范围先只做篇章①③的真实决策模块（PRD.md MVP范围）；篇章②是Should项，
// 暂时还是阶段1的占位screen，等Must跑通后再升级成DecisionScreen。
export const DECISION_ENABLED_CHAPTER_IDS = ["chapter1", "chapter3"];

export function buildFlow(): FlowNode[] {
  // 决策已启用的篇章(①③)现在把带教同事做成贯穿全程的侧边栏聊天角色，
  // 不再需要单独一屏"自我介绍"——mentor的开场白直接在DecisionScreen里的聊天窗口出现。
  // 篇章②还没做场景化，继续走旧的"mentor介绍屏 + 占位chapter屏"两步。
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
