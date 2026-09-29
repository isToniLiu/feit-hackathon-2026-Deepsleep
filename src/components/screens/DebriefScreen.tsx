import { story } from "@/lib/story";
import { ScreenShell } from "./ScreenShell";

// 阶段1占位版：真正的评分环+决策回顾列表在阶段5实现，见 DEV_PLAN.md。

export function DebriefScreen({ onRestart }: { onRestart: () => void }) {
  const { debrief } = story;
  return (
    <ScreenShell eyebrow={debrief.scoreLabel} title={debrief.title} ctaLabel="重新开始" onNext={onRestart}>
      <p>占位：评分环、关键决策回顾、{debrief.rolesRecapTitle} 在阶段5实现。</p>
    </ScreenShell>
  );
}
