import { getStory } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";
import { ScreenShell } from "./ScreenShell";

export function BriefingScreen({ onNext }: { onNext: () => void }) {
  const { locale } = useLocale();
  const story = getStory(locale);
  const { briefing } = story;
  return (
    <ScreenShell eyebrow={tr(locale, "Threat briefing", "威胁简报")} title={briefing.title} ctaLabel={briefing.cta} onNext={onNext}>
      <p>{briefing.body}</p>
    </ScreenShell>
  );
}
