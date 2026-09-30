import { getLocalizedMentor } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";
import { ScreenShell } from "./ScreenShell";

export function MentorScreen({
  mentorId,
  onNext,
}: {
  mentorId: string;
  onNext: () => void;
}) {
  const { locale } = useLocale();
  const mentor = getLocalizedMentor(locale, mentorId);
  if (!mentor) return null;
  return (
    <ScreenShell
      eyebrow={mentor.role}
      title={mentor.name}
      ctaLabel={tr(locale, "Continue", "继续")}
      onNext={onNext}
    >
      <p>{mentor.line}</p>
    </ScreenShell>
  );
}
