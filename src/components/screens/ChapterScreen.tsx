import { getChapter } from "@/lib/story";
import { ScreenShell } from "./ScreenShell";

// 阶段1占位版：只展示场景文字，不含决策选项。
// 决策弹窗（安全/危险/🤔选项 + 输入理由 + AI反馈）在阶段2实现，见 DEV_PLAN.md。

export function ChapterScreen({
  chapterId,
  onNext,
}: {
  chapterId: string;
  onNext: () => void;
}) {
  const chapter = getChapter(chapterId);
  if (!chapter) return null;

  return (
    <ScreenShell eyebrow={chapter.threatType} title={chapter.title} ctaLabel="下一步（占位，阶段2会换成决策弹窗）" onNext={onNext}>
      <p>{chapter.scenario}</p>
    </ScreenShell>
  );
}
