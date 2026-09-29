"use client";

import { useState } from "react";
import { BrowserShell, type BrowserPage } from "@/components/browser/BrowserShell";
import type { SceneAction } from "@/lib/story";

const pages: BrowserPage[] = [
  { id: "admin", label: "EduFlow Admin", address: "eduflow-portal.com/admin" },
  { id: "status", label: "Status Monitor", address: "status.eduflow-portal.com" },
  { id: "support", label: "IT Support", address: "eduflow-portal.com/help/login" },
];

export function PhishingLoginScene({
  onChoose,
  onAction,
}: {
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
  onAction: (action: SceneAction) => void;
}) {
  const [urlInspected, setUrlInspected] = useState(false);
  const [linkNoticed, setLinkNoticed] = useState(false);
  const [popupOpen, setPopupOpen] = useState(true);
  const [statusVisited, setStatusVisited] = useState(false);
  const [supportVisited, setSupportVisited] = useState(false);
  const [hoveringLogin, setHoveringLogin] = useState(false);

  function inspectUrl() {
    if (urlInspected) return;
    onAction({
      summary: "你检查了浏览器地址栏",
      explanation: "这个动作只读取当前页面地址，不会提交任何凭据。它帮助你确认自己现在位于哪个站点。",
      evidence: "🔍 你检查了浏览器地址栏：eduflow-portal.com/admin",
    });
    setUrlInspected(true);
  }

  function noticeLoginLink() {
    setHoveringLogin(true);
    if (linkNoticed) return;
    onAction({
      summary: "你查看了 Log In 按钮的目标地址",
      explanation: "按钮没有把请求送回当前的 EduFlow 域名，而是指向了另一个登录站点。这个差异是重要的风险信号。",
      evidence: "🔍 你查看了登录按钮的目标：eduflow-portal-auth.net/login",
    });
    setLinkNoticed(true);
  }

  function handleNavigate(pageId: string) {
    if (pageId === "status" && !statusVisited) {
      onAction({
        summary: "你打开了官方 Status Monitor",
        explanation: "你离开了登录弹窗，去查看独立的服务状态记录。这个动作不会改变账号状态，只会增加一条可交叉验证的来源。",
        evidence: "🔍 你打开了官方状态页：身份验证服务从 23:47 开始降级",
      });
      setStatusVisited(true);
    }
    if (pageId === "support" && !supportVisited) {
      onAction({
        summary: "你打开了 IT Access Support",
        explanation: "你正在查看公司自己的登录恢复流程。这里的说明可以用来对照当前弹窗是否符合内部规则。",
        evidence: "🔍 你打开了 IT 帮助页：正规登录入口是 eduflow-portal.com/login",
      });
      setSupportVisited(true);
    }
  }

  return (
    <BrowserShell
      pages={pages}
      initialPage="admin"
      onNavigate={handleNavigate}
      onUnknownAddress={(address) =>
        onAction({
          summary: `你尝试访问了未登记的地址：${address}`,
          explanation: "这个地址不在当前模拟浏览器的内部书签中，页面没有被打开。你保留了原来的现场。",
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
          <div className="relative min-h-[25rem] overflow-hidden bg-[#f8fafc]">
            <div className="border-b border-zinc-200 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">EduFlow Admin</p>
                  <p className="text-[11px] text-zinc-400">Submission operations · Jordan</p>
                </div>
                <button
                  onClick={() => navigate("status")}
                  className="text-xs text-zinc-500 underline decoration-dotted hover:text-zinc-800"
                >
                  service status
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-[10px] uppercase text-zinc-400">Queue</p>
                  <p className="mt-1 text-lg font-semibold">4,821</p>
                </div>
                <div className="rounded border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[10px] uppercase text-amber-600">Auth</p>
                  <p className="mt-1 text-lg font-semibold text-amber-800">degraded</p>
                </div>
                <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-[10px] uppercase text-zinc-400">Workers</p>
                  <p className="mt-1 text-lg font-semibold">98%</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs font-medium text-zinc-500">Latest activity</p>
              <div className="mt-2 flex items-center justify-between rounded border border-zinc-200 bg-white p-3 text-sm">
                <span>Midnight submission burst detected</span>
                <span className="font-mono text-[11px] text-zinc-400">23:47:02</span>
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-400">
                这个后台看起来正常，但左上角的身份验证状态和你刚才看到的弹窗并不一定来自同一个系统。
              </p>
            </div>

            {popupOpen ? (
              <div className="absolute inset-x-8 top-10 rounded-lg border border-zinc-400 bg-white p-5 shadow-2xl sm:inset-x-16">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-amber-600">⚠ Session Expired</p>
                    <p className="text-xs text-zinc-500">EduFlow requires you to sign in again.</p>
                  </div>
                  <button
                    onClick={() => {
                      onAction({
                        summary: "你关闭了 Session Expired 弹窗",
                        explanation: "弹窗被收起，账号密码没有被提交。它仍然作为一条待处理通知留在后台，随时可以重新打开。",
                      });
                      setPopupOpen(false);
                    }}
                    className="rounded px-2 text-lg leading-none text-zinc-400 hover:bg-zinc-100"
                    aria-label="关闭登录提示"
                  >
                    ×
                  </button>
                </div>

                <button
                  onClick={inspectUrl}
                  className="mb-3 block w-full rounded border border-dashed border-zinc-300 px-2 py-1 text-left text-xs text-zinc-500 underline decoration-dotted hover:bg-zinc-50"
                >
                  🔍 查看当前页面的完整地址
                </button>
                <label className="mb-1 block text-xs text-zinc-500">Email</label>
                <input
                  type="text"
                  placeholder="jordan@northlight.dev"
                  className="mb-3 w-full rounded border border-zinc-300 p-2 text-sm"
                />
                <label className="mb-1 block text-xs text-zinc-500">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mb-2 w-full rounded border border-zinc-300 p-2 text-sm"
                />

                <button
                  onClick={() => onChoose("danger")}
                  onMouseEnter={noticeLoginLink}
                  onFocus={noticeLoginLink}
                  onMouseLeave={() => setHoveringLogin(false)}
                  className="w-full rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                  Log In
                </button>
                {hoveringLogin && (
                  <p className="mt-1 text-[11px] text-red-500">
                    → 目标地址：eduflow-portal-auth.net/login
                  </p>
                )}

                <button
                  onClick={() => onChoose("safe")}
                  className="mt-3 w-full text-xs text-zinc-500 underline hover:text-zinc-700"
                >
                  这个弹窗看起来不对劲，上报它
                </button>
                <button
                  onClick={() => onChoose("unsure")}
                  className="mt-2 w-full text-xs text-zinc-400 hover:text-zinc-600"
                >
                  🤔 我不确定，能再讲清楚一点吗
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onAction({
                    summary: "你重新打开了待处理的 Session Expired 通知",
                    explanation: "重新打开通知不会发送数据，只是把之前隐藏的登录请求带回现场，方便你继续检查。",
                  });
                  setPopupOpen(true);
                }}
                className="absolute bottom-4 right-4 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow-sm hover:bg-amber-100"
              >
                1 条待处理通知 · Session expired
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
  return (
    <div className="min-h-[25rem] bg-white p-5">
      <div className="border-b border-zinc-200 pb-4">
        <p className="text-sm font-semibold">EduFlow Status</p>
        <p className="mt-1 text-xs text-zinc-400">Official service health · updated 23:49:12</p>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <StatusRow label="Submission API" value="Operational" tone="green" />
        <StatusRow label="Authentication" value="Degraded performance" tone="amber" />
        <StatusRow label="Background workers" value="Operational" tone="green" />
      </div>
      <button
        onClick={() =>
          onAction({
            summary: "你查看了身份验证事件详情",
            explanation: "官方状态页确认服务确实降级，但它没有要求员工重新输入密码。你获得了一条可以和弹窗对照的证据。",
            evidence: "🔍 官方状态页记录：身份验证服务降级，但没有要求用户重新输入密码",
          })
        }
        className="mt-5 rounded border border-dashed border-zinc-300 px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50"
      >
        查看身份验证事件详情
      </button>
      <button
        onClick={() => onNavigate("support")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        打开 IT 登录支持说明 →
      </button>
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
  return (
    <div className="min-h-[25rem] bg-white p-5">
      <p className="text-sm font-semibold">IT Access Support</p>
      <p className="mt-1 text-xs text-zinc-400">Northlight internal help · Article AUTH-04</p>
      <div className="mt-5 rounded border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
        <p className="font-medium">Session expired</p>
        <p className="mt-2">如果 EduFlow 会话失效，请关闭异常窗口，再从公司书签进入登录页。</p>
        <code className="mt-3 block rounded bg-white p-2 text-xs text-zinc-600">https://eduflow-portal.com/login</code>
        <p className="mt-3 text-xs text-zinc-500">IT 不会通过弹窗要求你重新提交密码，也不会使用临时域名。</p>
      </div>
      <button
        onClick={() =>
          onAction({
            summary: "你把 IT 支持说明加入案件档案",
            explanation: "这条说明给出了官方登录入口，也明确说 IT 不会使用临时域名。它可以直接用来核对当前弹窗的目标地址。",
            evidence: "🔍 IT 支持说明确认：公司登录入口是 eduflow-portal.com/login",
          })
        }
        className="mt-5 rounded bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700"
      >
        将这条说明加入案件档案
      </button>
      <button
        onClick={() => onNavigate("admin")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        返回 EduFlow 后台 →
      </button>
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
