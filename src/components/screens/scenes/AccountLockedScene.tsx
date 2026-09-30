"use client";

import { useState, type ReactNode } from "react";
import { BrowserShell, type BrowserPage } from "@/components/browser/BrowserShell";
import type { SceneAction } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";

export function AccountLockedScene({
  onChoose,
  onAction,
  choiceLocked,
  overlay,
  topBar,
}: {
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
  onAction: (action: SceneAction) => void;
  choiceLocked: boolean;
  overlay?: ReactNode;
  topBar?: ReactNode;
}) {
  const { locale } = useLocale();
  const t = (en: string, zh: string) => tr(locale, en, zh);
  const pages: BrowserPage[] = [
    { id: "identity", label: t("Identity Portal", "身份门户"), address: "accounts.northlight.dev/locked" },
    { id: "help", label: t("IT Access Help", "IT 访问帮助"), address: "helpdesk.northlight.dev/access" },
    { id: "notices", label: t("Security Notices", "安全公告"), address: "intranet.northlight.dev/notices" },
  ];
  const [tipShown, setTipShown] = useState(false);
  const [linkNoticed, setLinkNoticed] = useState(false);
  const [helpVisited, setHelpVisited] = useState(false);
  const [noticesVisited, setNoticesVisited] = useState(false);
  const [hoveringVerify, setHoveringVerify] = useState(false);

  function showTip() {
    if (tipShown) return;
    onAction({
      summary: t("You opened the Employee ID field guidance", "你打开了 “工号”字段说明"),
      explanation: t("This only reads the page guidance and does not submit account information. Compare it with the company's formal recovery process.", "这个动作只查看页面提供的说明，不会提交账号信息。说明内容和公司正式恢复流程是否一致，是值得核对的线索。"),
      evidence: `🔍 ${t("You opened the field guidance: formal IT does not ask for a verification code on a lock notice", "你打开了字段说明：正规 IT 流程不会在锁定提示里直接索要验证码")}`,
    });
    setTipShown(true);
  }

  function noticeVerifyLink() {
    setHoveringVerify(true);
    if (linkNoticed) return;
    onAction({
      summary: t("You checked the Verify & Unlock button target", "你查看了“验证并立即解锁”按钮的目标地址"),
      explanation: t("The button points to secure-verify-eduflow.net instead of a Northlight account domain. You have not submitted a code, but you found a high-risk mismatch.", "按钮指向 secure-verify-eduflow.net，而不是 Northlight 的账号域名。你还没有提交验证码，但已经发现了一个高风险差异。"),
      evidence: `🔍 ${t("You checked the verification target: secure-verify-eduflow.net", "你查看了验证按钮的目标：secure-verify-eduflow.net")}`,
    });
    setLinkNoticed(true);
  }

  function handleNavigate(pageId: string) {
    if (pageId === "help" && !helpVisited) {
      onAction({
        summary: t("You opened IT Access Help", "你打开了 IT 访问帮助"),
        explanation: t("You left the suspicious recovery page to check the formal company process. Compare its guidance with the current form.", "你离开了可疑的账号恢复页面，去查看公司的正式处理流程。这里的说明可以和当前表单逐项对照。"),
        evidence: `🔍 ${t("IT Access Help: locked accounts recover through a ticket and do not require a verification code", "你打开了“IT 访问帮助”：账号锁定应通过工单恢复，不会要求提交验证码")}`,
      });
      setHelpVisited(true);
    }
    if (pageId === "notices" && !noticesVisited) {
      onAction({
        summary: t("You opened the internal Security Notices", "你打开了内部安全公告"),
        explanation: t("The notice places this account lock on the IR-247 timeline. Compare its timing with the earlier authentication and file messages.", "公告把当前账号锁定放回 IR-247 的时间线里。你现在可以比较它和前面身份验证、文件消息的时间关系。"),
        evidence: `🔍 ${t("Internal security notice: the 23:47 unusual login is still under investigation", "你打开了内部安全公告：23:47 的异常登录事件仍在调查中")}`,
      });
      setNoticesVisited(true);
    }
  }

  return (
    <BrowserShell
      pages={pages}
      initialPage="identity"
      overlay={overlay}
      topBar={topBar}
      onNavigate={handleNavigate}
      onUnknownAddress={(address) =>
        onAction({
          summary: t(`You tried to visit an unregistered address: ${address}`, `你尝试访问了未登记的地址：${address}`),
          explanation: t("This address is not in the simulated browser's internal bookmarks, so the page did not open.", "这个地址不在当前模拟浏览器的内部书签中，页面没有被打开。"),
        })
      }
    >
      {(pageId, navigate) => {
        if (pageId === "help") {
          return <AccessHelpPage onAction={onAction} onNavigate={navigate} />;
        }
        if (pageId === "notices") {
          return <NoticesPage onAction={onAction} onNavigate={navigate} />;
        }

        return (
          <div className="min-h-full bg-[#f7f8f8] p-5">
            <div className="mx-auto w-full max-w-5xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded bg-coral text-xs font-bold text-white">N</span><div><p className="text-sm font-semibold text-zinc-800">{t("Northlight Identity Portal", "Northlight 身份门户")}</p><p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">{t("Access management", "访问管理")}</p></div></div>
                <p className="mt-1 text-[11px] text-zinc-400">{t("Account recovery / case 247-03", "账号恢复 / 案件 247-03")}</p>
              </div>
              <button
                onClick={() => navigate("notices")}
                className="text-xs text-zinc-500 underline decoration-dotted hover:text-zinc-800"
              >
                {t("Security notices", "安全公告")}
              </button>
            </div>

            <div className="flex min-h-[calc(100%-5rem)] items-start justify-center pt-4 sm:pt-8">
              <div className="w-full max-w-2xl rounded-lg border-2 border-red-300 bg-white p-5 text-left shadow-xl sm:p-6">
                <p className="mb-1 text-sm font-semibold text-red-600">🔒 {t("Account Locked", "账号已锁定")}</p>
                <p className="mb-4 text-sm leading-6 text-zinc-600">
                  {t("Unusual activity was detected. Complete verification below to restore access immediately.", "检测到异常活动。请完成下方验证以立即恢复访问。")}
                </p>

                <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs text-zinc-500">{t("Employee ID", "员工编号")}</label>
                <button
                  onClick={showTip}
                  className="text-xs text-zinc-400 underline decoration-dotted hover:text-zinc-600"
                >
                  {t("Is this normal? 🔍", "这正常吗？🔍")}
                </button>
                </div>
                <input
                type="text"
                placeholder="EMP-00482"
                className="mb-3 w-full rounded border border-zinc-300 p-2 text-sm"
                />
                <label className="mb-1 block text-xs text-zinc-500">{t("Verification code", "验证码")}</label>
                <input
                type="text"
                placeholder={t("6 digits", "6位数字")}
                className="mb-2 w-full rounded border border-zinc-300 p-2 text-sm"
                />

                <button
                onClick={() => onChoose("danger")}
                disabled={choiceLocked}
                onMouseEnter={noticeVerifyLink}
                onFocus={noticeVerifyLink}
                onMouseLeave={() => setHoveringVerify(false)}
                className="w-full rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("Verify & Unlock Now", "验证并立即解锁")}
                </button>
                {hoveringVerify && (
                  <p className="mt-1 text-[11px] text-red-500">
                    → {t("Target", "目标地址")}：secure-verify-eduflow.net
                  </p>
                )}

                {tipShown && (
                  <p className="mt-3 border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                    {t("The field guidance comes from an unknown source and conflicts with the company help centre's recovery process.", "这个页面的字段说明来自未知来源，和公司帮助中心的恢复流程不一致。")}
                  </p>
                )}
                <button
                onClick={() => onChoose("safe")}
                disabled={choiceLocked}
                className="mt-3 w-full rounded border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("Do not submit it; contact IT through the official process", "先不填，走官方流程联系 IT")}
                </button>
                <button
                onClick={() => onChoose("unsure")}
                disabled={choiceLocked}
                className="mt-2 w-full text-xs text-zinc-400 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("🤔 I'm not sure — can you explain more?", "🤔 我不确定，能再讲清楚一点吗")}
                </button>
              </div>
            </div>
            </div>
          </div>
        );
      }}
    </BrowserShell>
  );
}

function AccessHelpPage({
  onAction,
  onNavigate,
}: {
  onAction: (action: SceneAction) => void;
  onNavigate: (pageId: string) => void;
}) {
  const { locale } = useLocale();
  const t = (en: string, zh: string) => tr(locale, en, zh);
  return (
    <div className="min-h-full bg-white p-5">
      <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded bg-blue text-xs font-bold text-white">IT</span><p className="text-sm font-semibold">{t("IT Access Help", "IT 访问帮助")}</p></div>
      <p className="mt-1 text-xs text-zinc-400">{t("Article ACCESS-12 · updated 22:10", "文章 ACCESS-12 · 更新于 22:10")}</p>
      <div className="mt-5 rounded border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
        <p className="font-medium">{t("Locked account recovery", "锁定账号恢复")}</p>
        <p className="mt-2">{t("For a locked account, create an IT ticket and wait for the on-call administrator to call back. Do not submit a phone verification code on the lock page.", "账号锁定请创建 IT 工单，由值班管理员回拨确认。不要在锁定页面提交手机验证码。")}</p>
        <p className="mt-3 text-xs text-zinc-500">{t("Normal handling time: 5–15 minutes. You will not be asked to bypass the ticket process to 'unlock immediately'.", "正常处理时长：5–15 分钟。不会要求你绕过工单流程“立即解锁”。")}</p>
      </div>
      <button
        onClick={() =>
          onAction({
            summary: t("You added the IT account recovery process to the case file", "你把 IT 账号恢复流程加入案件档案"),
            explanation: t("The help centre confirms that account locks are handled through a ticket and never require a phone verification code on the lock page.", "帮助中心确认账号锁定应通过工单处理，不会要求员工在锁定页面提交手机验证码。"),
            evidence: `🔍 ${t("IT help centre: create a ticket for a locked account; do not submit a phone verification code", "IT 帮助中心确认：账号锁定应创建工单，不提交手机验证码")}`,
          })
        }
        className="mt-5 rounded bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700"
      >
        {t("Add this process to the case file", "将这条流程加入案件档案")}
      </button>
      <button
        onClick={() => onNavigate("identity")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        {t("Back to account page →", "返回账号页面 →")}
      </button>
      </div>
    </div>
  );
}

function NoticesPage({
  onAction,
  onNavigate,
}: {
  onAction: (action: SceneAction) => void;
  onNavigate: (pageId: string) => void;
}) {
  const { locale } = useLocale();
  const t = (en: string, zh: string) => tr(locale, en, zh);
  return (
    <div className="min-h-full bg-white p-5">
      <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded bg-yellow text-xs font-bold text-ink">!</span><p className="text-sm font-semibold">{t("Security Notices", "安全公告")}</p></div>
      <p className="mt-1 text-xs text-zinc-400">{t("Northlight intranet · latest updates", "Northlight 内网 · 最新更新")}</p>
      <div className="mt-5 rounded border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-medium">23:47 / {t("Authentication incident", "身份验证事件")}</p>
        <p className="mt-2">{t("The authentication service saw an unusual login spike. During the investigation, IT will not send recovery forms through external domains.", "身份验证服务出现异常登录峰值。调查期间，IT 不会通过外部域名发送恢复表单。")}</p>
        <p className="mt-3 font-mono text-[11px] text-amber-800">IR-247 · {t("owner: Security Operations", "负责人：安全运营")}</p>
      </div>
      <button
        onClick={() =>
          onAction({
            summary: t("You marked the IR-247 security notice", "你标记了 IR-247 安全公告"),
            explanation: t("The notice links the account lock to the 23:47 authentication event. This makes the timeline across chapters more complete.", "公告把账号锁定与 23:47 的身份验证事件关联起来。这个动作让前后篇章的时间线更完整。"),
            evidence: `🔍 ${t("The internal notice links the account lock and the 23:47 authentication event to IR-247", "内部公告将账号锁定与 23:47 身份验证事件关联到同一案件 IR-247")}`,
          })
        }
        className="mt-5 rounded border border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
      >
        {t("Mark this notice", "标记这条公告")}
      </button>
      <button
        onClick={() => onNavigate("identity")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        {t("Back to account page →", "返回账号页面 →")}
      </button>
      </div>
    </div>
  );
}
