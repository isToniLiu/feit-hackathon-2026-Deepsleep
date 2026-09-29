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

export function buildFlow(): FlowNode[] {
  const chapterNodes = story.chapters.flatMap<FlowNode>((chapter) => [
    { type: "mentor", chapterId: chapter.id },
    { type: "chapter", chapterId: chapter.id },
  ]);

  return [
    { type: "dashboard" },
    { type: "briefing" },
    ...chapterNodes,
    { type: "debrief" },
  ];
}
