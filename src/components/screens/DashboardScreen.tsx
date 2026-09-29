import { story } from "@/lib/story";
import { ScreenShell } from "./ScreenShell";

export function DashboardScreen({ onNext }: { onNext: () => void }) {
  const { dashboard } = story;
  return (
    <ScreenShell
      eyebrow={dashboard.greeting}
      title={dashboard.incidentTitle}
      ctaLabel={dashboard.actions.skip}
      onNext={onNext}
    >
      <p>{dashboard.incidentSubtitle}</p>
    </ScreenShell>
  );
}
