import { getLocalizedChapter } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";
import { ScreenShell } from "./ScreenShell";

// 兼容未接入场景的旧节点；当前三个篇章都由 DecisionScreen 渲染。

export function ChapterScreen({
  chapterId,
  onNext,
}: {
  chapterId: string;
  onNext: () => void;
}) {
  const { locale } = useLocale();
  const chapter = getLocalizedChapter(locale, chapterId);
  if (!chapter) return null;

  return (
    <ScreenShell eyebrow={chapter.threatType} title={chapter.title} ctaLabel={tr(locale, "Continue to the scene", "继续进入现场")} onNext={onNext}>
      <p>{chapter.scenario}</p>
    </ScreenShell>
  );
}
