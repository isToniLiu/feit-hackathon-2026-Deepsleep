import { getChapter } from "@/lib/story";
import { ScreenShell } from "./ScreenShell";

// 兼容未接入场景的旧节点；当前三个篇章都由 DecisionScreen 渲染。

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
    <ScreenShell eyebrow={chapter.threatType} title={chapter.title} ctaLabel="继续进入现场" onNext={onNext}>
      <p>{chapter.scenario}</p>
    </ScreenShell>
  );
}
