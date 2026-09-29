import { getMentor } from "@/lib/story";
import { ScreenShell } from "./ScreenShell";

export function MentorScreen({
  mentorId,
  onNext,
}: {
  mentorId: string;
  onNext: () => void;
}) {
  const mentor = getMentor(mentorId);
  return (
    <ScreenShell
      eyebrow={mentor.role}
      title={mentor.name}
      ctaLabel="过去帮忙"
      onNext={onNext}
    >
      <p>{mentor.line}</p>
    </ScreenShell>
  );
}
