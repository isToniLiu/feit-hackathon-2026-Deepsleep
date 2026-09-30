import { story, type RoleId } from "./story";

// 页面状态机：角色入口 → 案件看板 → 简报 → 所选调查节点 → 结案复盘。

export type FlowNode =
  | { type: "roleSelect" }
  | { type: "roleWorkspace" }
  | { type: "dashboard" }
  | { type: "briefing" }
  | { type: "mentor"; chapterId: string }
  | { type: "chapter"; chapterId: string }
  | { type: "debrief" };

export type AppRouteScreen = "role-select" | "workspace" | "dashboard" | "briefing" | "mentor" | "chapter1" | "chapter2" | "chapter3" | "debrief";

export function routeScreenForNode(node: FlowNode): AppRouteScreen {
  if (node.type === "roleSelect") return "role-select";
  if (node.type === "roleWorkspace") return "workspace";
  if (node.type === "chapter") return node.chapterId as AppRouteScreen;
  return node.type;
}

// 三个篇章都在同一条事故链里，全部使用场景化决策模块。
export const DECISION_ENABLED_CHAPTER_IDS = ["chapter1", "chapter2", "chapter3"];

export function buildFlow(roleId?: RoleId): FlowNode[] {
  if (!roleId) {
    return [{ type: "roleSelect" }];
  }

  const selectedChapterId = story.roles[roleId]?.mentorId
    ? story.chapters.find((chapter) => chapter.mentorId === story.roles[roleId].mentorId)?.id
    : undefined;

  if (!selectedChapterId) {
    return [{ type: "roleSelect" }];
  }

  return [
    { type: "roleWorkspace" },
    { type: "dashboard" },
    { type: "briefing" },
    { type: "chapter", chapterId: selectedChapterId },
    { type: "debrief" },
  ];
}

export function buildFullFlow(): FlowNode[] {
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
