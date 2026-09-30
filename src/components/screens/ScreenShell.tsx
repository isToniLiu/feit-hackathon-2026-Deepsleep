import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function ScreenShell({ eyebrow, title, children, ctaLabel, onNext }: { eyebrow?: string; title: string; children: ReactNode; ctaLabel: string; onNext: () => void }) {
  return (
    <main className="flex flex-1 flex-col bg-paper px-5 py-12 text-ink sm:px-10 lg:py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center border-y border-rule py-16 text-center"><span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">{eyebrow}</span><h1 className="mt-5 font-display text-5xl leading-none tracking-[-0.045em] sm:text-7xl">{title}</h1><div className="mx-auto mt-6 max-w-xl text-base leading-8 text-muted">{children}</div><Button onClick={onNext} className="mx-auto mt-8">{ctaLabel}</Button></div>
    </main>
  );
}
