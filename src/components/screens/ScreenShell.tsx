import type { ReactNode } from "react";

// 阶段1所有占位screen共用的最简布局：标题+一段文字+按钮。
// 阶段2/5会把具体screen（决策弹窗、结局页）换成专属组件，不再用这个壳。

export function ScreenShell({
  eyebrow,
  title,
  children,
  ctaLabel,
  onNext,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  ctaLabel: string;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      {eyebrow && (
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          {eyebrow}
        </span>
      )}
      <h1 className="max-w-lg text-2xl font-semibold">{title}</h1>
      <div className="max-w-lg text-zinc-600">{children}</div>
      <button
        onClick={onNext}
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
