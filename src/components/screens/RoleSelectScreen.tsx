"use client";

import { getStory, type RoleId } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";
import { RoleLinePortrait } from "@/components/ui/RoleLinePortrait";

const roleOrder: RoleId[] = ["priya", "marcus", "aiko"];
const roleAccent: Record<RoleId, string> = { priya: "border-blue", marcus: "border-yellow", aiko: "border-coral" };
const roleDot: Record<RoleId, string> = { priya: "bg-blue", marcus: "bg-yellow", aiko: "bg-coral" };
const roleTitle: Record<RoleId, { en: string; zh: string }> = {
  priya: { en: "Security Analyst", zh: "安全分析师" },
  marcus: { en: "Incident Responder", zh: "事件响应员" },
  aiko: { en: "GRC & Compliance Lead", zh: "治理、风险与合规负责人" },
};
const roleSubtitle: Record<RoleId, { en: string; zh: string }> = {
  priya: { en: "Identity & authentication", zh: "身份与认证" },
  marcus: { en: "Suspicious file response", zh: "可疑文件响应" },
  aiko: { en: "Account recovery process", zh: "账号恢复流程" },
};

function RoleIcon({ roleId }: { roleId: RoleId }) {
  const common = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (roleId === "priya") return <svg viewBox="0 0 32 32" className="h-10 w-10" fill="none" {...common}><path d="M16 3 27 7v7c0 7-4.5 11.8-11 15C9.5 25.8 5 21 5 14V7l11-4Z" /></svg>;
  if (roleId === "marcus") return <svg viewBox="0 0 32 32" className="h-10 w-10" fill="none" {...common}><path d="m16 4 12 22H4L16 4Z" /><path d="M16 11v7M16 22h.01" /></svg>;
  return <svg viewBox="0 0 32 32" className="h-10 w-10" fill="none" {...common}><path d="M7 4h12l6 6v18H7V4Z" /><path d="M19 4v7h7M12 16h8M12 21h8" /></svg>;
}

function DetailIcon({ type }: { type: "system" | "focus" }) {
  const common = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return type === "system"
    ? <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="none" {...common}><rect x="3" y="4" width="18" height="13" rx="1" /><path d="M8 21h8M12 17v4" /></svg>
    : <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="none" {...common}><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
}

export function RoleSelectScreen({ onSelect }: { onSelect: (roleId: RoleId) => void }) {
  const { locale } = useLocale();
  const story = getStory(locale);

  return (
    <main className="role-select-main flex flex-1 flex-col bg-paper px-5 py-12 text-ink sm:px-10 lg:py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="role-select-hero border-b border-rule pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">{tr(locale, "Cybersecurity investigation training", "网络安全调查训练")}</p>
          <h1 className="role-select-title mt-4 max-w-3xl font-display text-6xl leading-[0.9] tracking-[-0.055em] sm:text-7xl lg:text-6xl">
            {tr(locale, "Investigate the case.", "调查这起事故。")}
            <br />
            <span className="text-coral">{tr(locale, "Make the call.", "做出判断。")}</span>
          </h1>
          <p className="mt-4 max-w-lg font-sans text-base leading-7 tracking-[-0.01em] text-muted sm:text-[1.05rem]">{tr(locale, "Scenario-based cybersecurity learning, coached on your own reasoning.", "以场景为基础的网络安全学习，教练会围绕你的判断过程提供反馈。")}</p>
        </div>

        <div className="role-select-cards mt-6 grid gap-4 lg:grid-cols-3">
          {roleOrder.map((roleId) => {
            const role = story.roles[roleId];
            const mentor = story.mentors[role.mentorId];
            return (
              <button key={roleId} onClick={() => onSelect(roleId)} className={`role-select-card group flex min-h-[430px] flex-col items-start border-t-4 ${roleAccent[roleId]} border-x border-b border-rule bg-surface p-4 text-left transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(30,28,20,0.1)]`}>
                <div className="flex w-full items-center justify-between gap-3 border-b border-rule pb-4">
                  <RoleIcon roleId={roleId} />
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted"><span className={`h-3 w-3 rounded-full ${roleDot[roleId]}`} />{role.type}</div>
                </div>
                <div className="relative mt-4 min-h-[104px] w-full pr-28">
                  <strong className="block font-display text-4xl leading-none tracking-[-0.04em]">{mentor.name}</strong>
                  <span className="mt-2 block font-display text-2xl leading-none tracking-[-0.035em]">{tr(locale, roleTitle[roleId].en, roleTitle[roleId].zh)}</span>
                  <div className="absolute right-0 top-0"><RoleLinePortrait roleId={roleId} /></div>
                </div>
                <span className="mt-3 text-lg leading-6 text-muted">{tr(locale, roleSubtitle[roleId].en, roleSubtitle[roleId].zh)}</span>
                <span className="mt-3 text-base leading-6 text-muted">{role.description}</span>
                <div className="role-select-details mt-5 grid w-full gap-3 border-t border-rule pt-3 text-xs">
                  <div className="flex items-center gap-4"><DetailIcon type="system" /><div><span className="block text-[10px] uppercase tracking-[0.15em] text-muted">{tr(locale, "System access", "系统访问")}</span><span className="mt-1 block text-sm">{role.route}</span></div></div>
                  <div className="flex items-center gap-4"><DetailIcon type="focus" /><div><span className="block text-[10px] uppercase tracking-[0.15em] text-muted">{tr(locale, "Focus areas", "重点领域")}</span><span className="mt-1 block text-sm">{role.focus}</span></div></div>
                </div>
                <div className="role-select-action mt-auto w-full pt-4">
                  <span className="flex w-full items-center justify-between rounded-full bg-ink px-6 py-3 text-sm font-medium text-white">{tr(locale, "Enter investigation", "进入调查")} <span className="text-xl transition group-hover:translate-x-1">→</span></span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="role-select-footer mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.18em] text-muted"><span>{tr(locale, "One incident", "一个事故")}</span><span>{tr(locale, "Three entry points", "三个入口")}</span><span>{tr(locale, "Your reasoning matters", "你的判断会被看见")}</span></div>
      </div>
    </main>
  );
}
