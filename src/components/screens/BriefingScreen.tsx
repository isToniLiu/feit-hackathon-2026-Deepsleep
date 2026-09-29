import { story } from "@/lib/story";
import { ScreenShell } from "./ScreenShell";

export function BriefingScreen({ onNext }: { onNext: () => void }) {
  const { briefing } = story;
  return (
    <ScreenShell eyebrow="威胁简报" title={briefing.title} ctaLabel={briefing.cta} onNext={onNext}>
      <p>{briefing.body}</p>
    </ScreenShell>
  );
}
