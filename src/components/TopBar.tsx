"use client";

import { useEffect, useState } from "react";
import type { EvidenceItem, IncidentStatus } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";

const statusCopy: Record<IncidentStatus, { en: string; zh: string }> = {
  monitoring: { en: "MONITORING", zh: "监控中" },
  "containment-progress": { en: "CONTAINMENT IN PROGRESS", zh: "正在遏制" },
  "containment-risk": { en: "CONTAINMENT AT RISK", zh: "遏制存在风险" },
};
const incidentTimes: Record<IncidentStatus, string> = {
  monitoring: "23:47",
  "containment-progress": "23:52",
  "containment-risk": "23:49",
};

export function TopBar({
  evidence,
  incidentStatus,
  canGoBack,
  onBack,
  onHome,
}: {
  evidence: EvidenceItem[];
  incidentStatus: IncidentStatus;
  canGoBack: boolean;
  onBack: () => void;
  onHome: () => void;
}) {
  const [isCaseFileOpen, setIsCaseFileOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { locale, toggleLocale } = useLocale();

  useEffect(() => {
    if (!isCaseFileOpen && !isGuideOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCaseFileOpen(false);
        setIsGuideOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCaseFileOpen, isGuideOpen]);

  return (
    <header className="relative z-20 mx-3 mt-3 flex items-center justify-between rounded-full border border-rule bg-surface px-4 py-3 text-sm text-ink shadow-[0_10px_30px_rgba(30,28,20,0.08)] sm:mx-6 sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        {canGoBack && (
          <button onClick={onBack} className="flex shrink-0 items-center gap-1 text-sm text-muted transition hover:text-ink" aria-label={tr(locale, "Go back", "返回上一步")}>
            <span className="text-xl leading-none">←</span><span className="hidden sm:inline">{tr(locale, "Back", "返回")}</span>
          </button>
        )}
        <button onClick={onHome} className="shrink-0 font-display text-xl font-bold tracking-[-0.04em] transition hover:opacity-65 sm:text-2xl" aria-label={tr(locale, "Go to CyberStage home", "返回 CyberStage 首页")}>
          CyberStage
        </button>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-muted lg:inline">{tr(locale, statusCopy[incidentStatus].en, statusCopy[incidentStatus].zh)} ·{incidentTimes[incidentStatus]} UTC</span>
        <button onClick={toggleLocale} className="rounded-full border border-rule px-3 py-1.5 text-xs text-muted transition hover:border-ink hover:text-ink" aria-label={tr(locale, "Switch language", "切换语言")}>
          {locale === "en" ? "中文" : "EN"}
        </button>
        <button onClick={() => { setIsGuideOpen((open) => !open); setIsCaseFileOpen(false); }} className="hidden rounded-full border border-rule px-3 py-1.5 text-xs text-muted transition hover:border-ink hover:text-ink sm:inline" aria-expanded={isGuideOpen}>
          {tr(locale, "Guide", "参考卡")}
        </button>
        <button onClick={() => { setIsCaseFileOpen((open) => !open); setIsGuideOpen(false); }} className="rounded-full border border-ink px-3 py-1.5 text-xs font-medium transition hover:bg-ink hover:text-white" aria-expanded={isCaseFileOpen}>
          {tr(locale, "Case file", "案件档案")} · {evidence.length.toString().padStart(2, "0")}
        </button>
      </div>

      {isCaseFileOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="case-file-title" className="absolute right-0 top-16 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-rule bg-surface p-5 text-left text-ink shadow-[0_18px_50px_rgba(30,28,20,0.16)]">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p id="case-file-title" className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">{tr(locale, "Evidence log", "证据记录")}</p>
              <p className="mt-1 text-xs text-muted">{tr(locale, "Only information you checked yourself is recorded.", "只记录你亲自核对过的现场信息。")}</p>
            </div>
          </div>
          {evidence.length === 0 ? <p className="border-t border-dashed border-rule pt-3 text-sm text-muted">{tr(locale, "Nothing recorded yet. Check the URL, source, or submission address in the current scene first.", "还没有记录。先在当前场景里检查网址、来源或提交地址。")}</p> : <ol className="flex flex-col gap-3 border-t border-rule pt-3">{evidence.map((item, index) => <li key={item.id} className="flex gap-3 text-sm"><span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span><span>{item.text.replace(/^🔍\s*/, "")}</span></li>)}</ol>}
        </div>
      )}
      {isGuideOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="quick-guide-title" className="absolute right-0 top-16 w-[min(27rem,calc(100vw-1.5rem))] rounded-2xl border border-rule bg-surface p-5 text-left text-ink shadow-[0_18px_50px_rgba(30,28,20,0.16)]">
          <div className="flex items-start justify-between gap-4 border-b border-rule pb-3"><div><p id="quick-guide-title" className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">{tr(locale, "Investigation guide", "调查参考卡")}</p><p className="mt-1 text-xs text-muted">{tr(locale, "Use the framework to check evidence, not to guess the answer.", "用判断框架核对证据，不要用它直接猜答案。")}</p></div><button onClick={() => setIsGuideOpen(false)} className="text-lg text-muted" aria-label={tr(locale, "Close guide", "关闭参考卡")}>×</button></div>
          <div className="mt-4 grid gap-3 text-sm"><div className="border-l-2 border-blue pl-3"><p className="font-medium">{tr(locale, "Identity and access", "身份与访问")}</p><p className="mt-1 text-muted">{tr(locale, "Check the domain, the requested credential, and the formal recovery path.", "核对域名、被要求提交的凭据，以及正式恢复流程。")}</p></div><div className="border-l-2 border-yellow pl-3"><p className="font-medium">{tr(locale, "Suspicious files", "可疑文件")}</p><p className="mt-1 text-muted">{tr(locale, "Check the sender, file type, signature, and whether the timing makes sense.", "核对发送者、文件类型、签名，以及时间关系是否合理。")}</p></div><div className="border-l-2 border-coral pl-3"><p className="font-medium">{tr(locale, "Account recovery", "账号恢复")}</p><p className="mt-1 text-muted">{tr(locale, "Compare the prompt with an internal notice or help article before entering codes.", "输入验证码前，先和内部公告或帮助文档对照。")}</p></div></div>
        </div>
      )}
    </header>
  );
}
