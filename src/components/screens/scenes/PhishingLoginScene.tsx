"use client";

import { useState, type ReactNode } from "react";
import { BrowserShell, type BrowserPage } from "@/components/browser/BrowserShell";
import type { SceneAction } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";

export function PhishingLoginScene({
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
    { id: "admin", label: t("EduFlow Admin", "EduFlow 管理后台"), address: "eduflow-portal.com/admin" },
    { id: "status", label: t("Status Monitor", "状态监控"), address: "status.eduflow-portal.com" },
    { id: "support", label: t("IT Support", "IT 支持"), address: "eduflow-portal.com/help/login" },
  ];
  const [urlInspected, setUrlInspected] = useState(false);
  const [linkNoticed, setLinkNoticed] = useState(false);
  const [popupOpen, setPopupOpen] = useState(true);
  const [statusVisited, setStatusVisited] = useState(false);
  const [supportVisited, setSupportVisited] = useState(false);
  const [hoveringLogin, setHoveringLogin] = useState(false);

  function inspectUrl() {
    if (urlInspected) return;
    onAction({
      summary: t("You checked the browser address bar", "你检查了浏览器地址栏"),
      explanation: t("This only reads the current page address; it does not submit credentials. It confirms which site you are on.", "这个动作只读取当前页面地址，不会提交任何凭据。它帮助你确认自己现在位于哪个站点。"),
      evidence: `🔍 ${t("You checked the browser address bar: eduflow-portal.com/admin", "你检查了浏览器地址栏：eduflow-portal.com/admin")}`,
    });
    setUrlInspected(true);
  }

  function noticeLoginLink() {
    setHoveringLogin(true);
    if (linkNoticed) return;
    onAction({
      summary: t("You checked the Log In button target", "你查看了“登录”按钮的目标地址"),
      explanation: t("The button sends the request to another login site instead of the current EduFlow domain. That mismatch is an important risk signal.", "按钮没有把请求送回当前的 EduFlow 域名，而是指向了另一个登录站点。这个差异是重要的风险信号。"),
      evidence: `🔍 ${t("You checked the login target: eduflow-portal-auth.net/login", "你查看了登录按钮的目标：eduflow-portal-auth.net/login")}`,
    });
    setLinkNoticed(true);
  }

  function handleNavigate(pageId: string) {
    if (pageId === "status" && !statusVisited) {
      onAction({
        summary: t("You opened the official Status Monitor", "你打开了官方状态监控"),
        explanation: t("You left the login popup to check an independent service status record. This does not change the account; it adds a source for cross-checking.", "你离开了登录弹窗，去查看独立的服务状态记录。这个动作不会改变账号状态，只会增加一条可交叉验证的来源。"),
        evidence: `🔍 ${t("You opened the official status page: authentication degraded from 23:47", "你打开了官方状态页：身份验证服务从 23:47 开始降级")}`,
      });
      setStatusVisited(true);
    }
    if (pageId === "support" && !supportVisited) {
      onAction({
        summary: t("You opened IT Access Support", "你打开了 IT 访问支持"),
        explanation: t("You are checking the company's login recovery process. Use it to compare the popup with internal rules.", "你正在查看公司自己的登录恢复流程。这里的说明可以用来对照当前弹窗是否符合内部规则。"),
        evidence: `🔍 ${t("IT help confirms the official login entry point is eduflow-portal.com/login", "你打开了 IT 帮助页：正规登录入口是 eduflow-portal.com/login")}`,
      });
      setSupportVisited(true);
    }
  }

  return (
    <BrowserShell
      pages={pages}
      initialPage="admin"
      overlay={overlay}
      topBar={topBar}
      onNavigate={handleNavigate}
      onUnknownAddress={(address) =>
        onAction({
          summary: t(`You tried to visit an unregistered address: ${address}`, `你尝试访问了未登记的地址：${address}`),
          explanation: t("This address is not in the simulated browser's internal bookmarks, so the page did not open. The scene was preserved.", "这个地址不在当前模拟浏览器的内部书签中，页面没有被打开。你保留了原来的现场。"),
        })
      }
    >
      {(pageId, navigate) => {
        if (pageId === "status") {
          return <StatusPage onAction={onAction} onNavigate={navigate} />;
        }
        if (pageId === "support") {
          return <SupportPage onAction={onAction} onNavigate={navigate} />;
        }

        return (
          <div className="relative min-h-full overflow-visible bg-[#f7f8f8]">
            <div className="border-b border-zinc-200 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded bg-blue text-xs font-bold text-white">E</span><div><p className="text-sm font-semibold text-zinc-800">EduFlow {t("Admin", "管理后台")}</p><p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">Northlight {t("workspace", "工作区")}</p></div></div>
                  <p className="text-[11px] text-zinc-400">{t("Submission operations · Jordan", "提交运营 · Jordan")}</p>
                </div>
                <button
                  onClick={() => navigate("status")}
                  className="text-xs text-zinc-500 underline decoration-dotted hover:text-zinc-800"
                >
                  {t("service status", "服务状态")}
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded border border-zinc-200 bg-white p-3">
                  <p className="text-[10px] uppercase text-zinc-400">{t("Queue", "队列")}</p>
                  <p className="mt-1 text-lg font-semibold">4,821</p>
                </div>
                <div className="rounded border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[10px] uppercase text-amber-600">{t("Auth", "认证")}</p>
                  <p className="mt-1 text-lg font-semibold text-amber-800">{t("degraded", "降级")}</p>
                </div>
                <div className="rounded border border-zinc-200 bg-white p-3">
                  <p className="text-[10px] uppercase text-zinc-400">{t("Workers", "工作进程")}</p>
                  <p className="mt-1 text-lg font-semibold">98%</p>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-5xl p-5">
              <p className="text-xs font-medium text-zinc-500">{t("Latest activity", "最新活动")}</p>
              <div className="mt-2 flex items-center justify-between rounded border border-zinc-200 bg-white p-3 text-sm">
                <span>{t("Midnight submission burst detected", "检测到午夜提交高峰")}</span>
                <span className="font-mono text-[11px] text-zinc-400">23:47:02</span>
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-400">
                {t("This admin console looks normal, but the authentication status and the popup may not come from the same system.", "这个后台看起来正常，但左上角的身份验证状态和你刚才看到的弹窗并不一定来自同一个系统。")}
              </p>
            </div>

            {popupOpen ? (
              <div className="absolute left-1/2 top-10 w-[min(32rem,calc(100%_-_2rem))] -translate-x-1/2 rounded-lg border-2 border-amber-300 bg-white p-5 shadow-2xl">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-amber-600">⚠ {t("Session Expired", "会话已失效")}</p>
                    <p className="text-xs text-zinc-500">{t("EduFlow requires you to sign in again.", "EduFlow 要求你重新登录。")}</p>
                  </div>
                  <button
                    onClick={() => {
                      onAction({
                        summary: t("You closed the Session Expired popup", "你关闭了“会话已失效”弹窗"),
                        explanation: t("The popup was dismissed and no credentials were submitted. It remains as a pending notification that can be reopened.", "弹窗被收起，账号密码没有被提交。它仍然作为一条待处理通知留在后台，随时可以重新打开。"),
                      });
                      setPopupOpen(false);
                    }}
                    className="rounded px-2 text-lg leading-none text-zinc-400 hover:bg-zinc-100"
                    aria-label={t("Close login prompt", "关闭登录提示")}
                  >
                    ×
                  </button>
                </div>

                <button
                  onClick={inspectUrl}
                  className="mb-3 block w-full rounded border border-dashed border-zinc-300 px-2 py-1 text-left text-xs text-zinc-500 underline decoration-dotted hover:bg-zinc-50"
                >
                  {t("🔍 Inspect the full current address", "🔍 查看当前页面的完整地址")}
                </button>
                <label className="mb-1 block text-xs text-zinc-500">{t("Email", "邮箱")}</label>
                <input
                  type="text"
                  placeholder="jordan@northlight.dev"
                  className="mb-3 w-full rounded border border-zinc-300 p-2 text-sm"
                />
                <label className="mb-1 block text-xs text-zinc-500">{t("Password", "密码")}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mb-2 w-full rounded border border-zinc-300 p-2 text-sm"
                />

                <button
                  onClick={() => onChoose("danger")}
                  disabled={choiceLocked}
                  onMouseEnter={noticeLoginLink}
                  onFocus={noticeLoginLink}
                  onMouseLeave={() => setHoveringLogin(false)}
                  className="w-full rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("Log In", "登录")}
                </button>
                {hoveringLogin && (
                  <p className="mt-1 text-[11px] text-red-500">
                    → {t("Target", "目标地址")}：eduflow-portal-auth.net/login
                  </p>
                )}

                <button
                  onClick={() => onChoose("safe")}
                  disabled={choiceLocked}
                  className="mt-3 w-full text-xs text-zinc-500 underline hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("This popup looks suspicious — report it", "这个弹窗看起来不对劲，上报它")}
                </button>
                <button
                  onClick={() => onChoose("unsure")}
                  disabled={choiceLocked}
                  className="mt-2 w-full text-xs text-zinc-400 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("🤔 I'm not sure — can you explain more?", "🤔 我不确定，能再讲清楚一点吗")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onAction({
                    summary: t("You reopened the pending Session Expired notification", "你重新打开了待处理的“会话已失效”通知"),
                    explanation: t("Reopening the notification sends no data; it brings the hidden login request back so you can inspect it.", "重新打开通知不会发送数据，只是把之前隐藏的登录请求带回现场，方便你继续检查。"),
                  });
                  setPopupOpen(true);
                }}
                className="absolute bottom-4 right-4 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow-sm hover:bg-amber-100"
              >
                {t("1 pending notification · Session expired", "1 条待处理通知 · 会话已失效")}
              </button>
            )}
          </div>
        );
      }}
    </BrowserShell>
  );
}

function StatusPage({
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
      <div className="border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded bg-blue text-xs font-bold text-white">E</span><div><p className="text-sm font-semibold">EduFlow {t("Status", "状态")}</p><p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">{t("Public service health", "公共服务状态")}</p></div></div>
        <p className="mt-1 text-xs text-zinc-400">{t("Official service health · updated 23:49:12", "官方服务状态 · 更新于 23:49:12")}</p>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <StatusRow label={t("Submission API", "提交 API")} value={t("Operational", "运行正常")} tone="green" />
        <StatusRow label={t("Authentication", "身份验证")} value={t("Degraded performance", "性能降级")} tone="amber" />
        <StatusRow label={t("Background workers", "后台工作进程")} value={t("Operational", "运行正常")} tone="green" />
      </div>
      <button
        onClick={() =>
          onAction({
            summary: t("You inspected the authentication incident details", "你查看了身份验证事件详情"),
            explanation: t("The official status page confirms degradation, but it does not ask employees to re-enter passwords. You have evidence to compare with the popup.", "官方状态页确认服务确实降级，但它没有要求员工重新输入密码。你获得了一条可以和弹窗对照的证据。"),
            evidence: `🔍 ${t("Official status page: authentication degraded without asking users to re-enter passwords", "官方状态页记录：身份验证服务降级，但没有要求用户重新输入密码")}`,
          })
        }
        className="mt-5 rounded border border-dashed border-zinc-300 px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50"
      >
        {t("View authentication incident details", "查看身份验证事件详情")}
      </button>
      <button
        onClick={() => onNavigate("support")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        {t("Open IT login support guidance →", "打开 IT 登录支持说明 →")}
      </button>
      </div>
    </div>
  );
}

function SupportPage({
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
      <p className="text-sm font-semibold">{t("IT Access Support", "IT 访问支持")}</p>
      <p className="mt-1 text-xs text-zinc-400">Northlight {t("internal help", "内部帮助")} · {t("Article", "文章")} AUTH-04</p>
      <div className="mt-5 rounded border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
        <p className="font-medium">{t("Session expired", "会话已失效")}</p>
        <p className="mt-2">{t("If the EduFlow session expires, close the suspicious window and open the login page from the company bookmark.", "如果 EduFlow 会话失效，请关闭异常窗口，再从公司书签进入登录页。")}</p>
        <code className="mt-3 block rounded bg-white p-2 text-xs text-zinc-600">https://eduflow-portal.com/login</code>
        <p className="mt-3 text-xs text-zinc-500">{t("IT will not ask you to resubmit a password through a popup or use a temporary domain.", "IT 不会通过弹窗要求你重新提交密码，也不会使用临时域名。")}</p>
      </div>
      <button
        onClick={() =>
          onAction({
            summary: t("You added the IT support guidance to the case file", "你把 IT 支持说明加入案件档案"),
            explanation: t("It gives the official login entry point and says IT will not use a temporary domain. Use it to check the popup target.", "这条说明给出了官方登录入口，也明确说 IT 不会使用临时域名。它可以直接用来核对当前弹窗的目标地址。"),
            evidence: `🔍 ${t("IT support confirms the company login entry point is eduflow-portal.com/login", "IT 支持说明确认：公司登录入口是 eduflow-portal.com/login")}`,
          })
        }
        className="mt-5 rounded bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700"
      >
        {t("Add this guidance to the case file", "将这条说明加入案件档案")}
      </button>
      <button
        onClick={() => onNavigate("admin")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        {t("Back to EduFlow admin →", "返回 EduFlow 后台 →")}
      </button>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "amber";
}) {
  return (
    <div className="flex items-center justify-between rounded border border-zinc-200 px-3 py-3 text-sm">
      <span>{label}</span>
      <span className={tone === "green" ? "text-emerald-600" : "text-amber-600"}>● {value}</span>
    </div>
  );
}
