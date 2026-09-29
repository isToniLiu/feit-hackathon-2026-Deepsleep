"use client";

import { useState } from "react";
import { BrowserShell, type BrowserPage } from "@/components/browser/BrowserShell";

const pages: BrowserPage[] = [
  { id: "identity", label: "Identity Portal", address: "accounts.northlight.dev/locked" },
  { id: "help", label: "IT Access Help", address: "helpdesk.northlight.dev/access" },
  { id: "notices", label: "Security Notices", address: "intranet.northlight.dev/notices" },
];

export function AccountLockedScene({
  onChoose,
  onInvestigate,
}: {
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
  onInvestigate: (note: string) => void;
}) {
  const [tipShown, setTipShown] = useState(false);
  const [linkNoticed, setLinkNoticed] = useState(false);
  const [helpVisited, setHelpVisited] = useState(false);
  const [noticesVisited, setNoticesVisited] = useState(false);
  const [hoveringVerify, setHoveringVerify] = useState(false);

  function showTip() {
    if (tipShown) return;
    onInvestigate("🔍 你打开了字段说明：正规 IT 流程不会在锁定提示里直接索要验证码");
    setTipShown(true);
  }

  function noticeVerifyLink() {
    setHoveringVerify(true);
    if (linkNoticed) return;
    onInvestigate("🔍 你查看了验证按钮的目标：secure-verify-eduflow.net");
    setLinkNoticed(true);
  }

  function handleNavigate(pageId: string) {
    if (pageId === "help" && !helpVisited) {
      onInvestigate("🔍 你打开了 IT Access Help：账号锁定应通过工单恢复，不会要求提交验证码");
      setHelpVisited(true);
    }
    if (pageId === "notices" && !noticesVisited) {
      onInvestigate("🔍 你打开了内部安全公告：23:47 的异常登录事件仍在调查中");
      setNoticesVisited(true);
    }
  }

  return (
    <BrowserShell
      pages={pages}
      initialPage="identity"
      onNavigate={handleNavigate}
      onUnknownAddress={(address) => onInvestigate(`🔍 你尝试访问了未登记的地址：${address}`)}
    >
      {(pageId, navigate) => {
        if (pageId === "help") {
          return <AccessHelpPage onInvestigate={onInvestigate} onNavigate={navigate} />;
        }
        if (pageId === "notices") {
          return <NoticesPage onInvestigate={onInvestigate} onNavigate={navigate} />;
        }

        return (
          <div className="min-h-[25rem] bg-[#f8fafc] p-5">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <p className="text-sm font-semibold text-zinc-800">Northlight Identity Portal</p>
                <p className="mt-1 text-[11px] text-zinc-400">Account recovery / case 247-03</p>
              </div>
              <button
                onClick={() => navigate("notices")}
                className="text-xs text-zinc-500 underline decoration-dotted hover:text-zinc-800"
              >
                security notices
              </button>
            </div>

            <div className="rounded-lg border border-red-300 bg-white p-5 text-left shadow-xl">
              <p className="mb-1 text-sm font-semibold text-red-600">🔒 Account Locked</p>
              <p className="mb-4 text-sm leading-6 text-zinc-600">
                Unusual activity was detected. Complete verification below to restore access immediately.
              </p>

              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs text-zinc-500">Employee ID</label>
                <button
                  onClick={showTip}
                  className="text-xs text-zinc-400 underline decoration-dotted hover:text-zinc-600"
                >
                  这正常吗？🔍
                </button>
              </div>
              <input
                type="text"
                placeholder="EMP-00482"
                className="mb-3 w-full rounded border border-zinc-300 p-2 text-sm"
              />
              <label className="mb-1 block text-xs text-zinc-500">Verification code</label>
              <input
                type="text"
                placeholder="6位数字"
                className="mb-2 w-full rounded border border-zinc-300 p-2 text-sm"
              />

              <button
                onClick={() => onChoose("danger")}
                onMouseEnter={noticeVerifyLink}
                onFocus={noticeVerifyLink}
                onMouseLeave={() => setHoveringVerify(false)}
                className="w-full rounded bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Verify &amp; Unlock Now
              </button>
              {hoveringVerify && (
                <p className="mt-1 text-[11px] text-red-500">
                  → 目标地址：secure-verify-eduflow.net
                </p>
              )}

              {tipShown && (
                <p className="mt-3 border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  这个页面的字段说明来自未知来源，和公司帮助中心的恢复流程不一致。
                </p>
              )}
              <button
                onClick={() => onChoose("safe")}
                className="mt-3 w-full rounded border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-100"
              >
                先不填，走官方流程联系 IT
              </button>
              <button
                onClick={() => onChoose("unsure")}
                className="mt-2 w-full text-xs text-zinc-400 hover:text-zinc-600"
              >
                🤔 我不确定，能再讲清楚一点吗
              </button>
            </div>
          </div>
        );
      }}
    </BrowserShell>
  );
}

function AccessHelpPage({
  onInvestigate,
  onNavigate,
}: {
  onInvestigate: (note: string) => void;
  onNavigate: (pageId: string) => void;
}) {
  return (
    <div className="min-h-[25rem] bg-white p-5">
      <p className="text-sm font-semibold">IT Access Help</p>
      <p className="mt-1 text-xs text-zinc-400">Article ACCESS-12 · updated 22:10</p>
      <div className="mt-5 rounded border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
        <p className="font-medium">Locked account recovery</p>
        <p className="mt-2">账号锁定请创建 IT 工单，由值班管理员回拨确认。不要在锁定页面提交手机验证码。</p>
        <p className="mt-3 text-xs text-zinc-500">正常处理时长：5–15 分钟。不会要求你绕过工单流程“立即解锁”。</p>
      </div>
      <button
        onClick={() => onInvestigate("🔍 IT 帮助中心确认：账号锁定应创建工单，不提交手机验证码")}
        className="mt-5 rounded bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700"
      >
        将这条流程加入案件档案
      </button>
      <button
        onClick={() => onNavigate("identity")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        返回账号页面 →
      </button>
    </div>
  );
}

function NoticesPage({
  onInvestigate,
  onNavigate,
}: {
  onInvestigate: (note: string) => void;
  onNavigate: (pageId: string) => void;
}) {
  return (
    <div className="min-h-[25rem] bg-white p-5">
      <p className="text-sm font-semibold">Security Notices</p>
      <p className="mt-1 text-xs text-zinc-400">Northlight intranet · latest updates</p>
      <div className="mt-5 rounded border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-medium">23:47 / Authentication incident</p>
        <p className="mt-2">身份验证服务出现异常登录峰值。调查期间，IT 不会通过外部域名发送恢复表单。</p>
        <p className="mt-3 font-mono text-[11px] text-amber-800">IR-247 · owner: Security Operations</p>
      </div>
      <button
        onClick={() => onInvestigate("🔍 内部公告将账号锁定与 23:47 身份验证事件关联到同一案件 IR-247")}
        className="mt-5 rounded border border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
      >
        标记这条公告
      </button>
      <button
        onClick={() => onNavigate("identity")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        返回账号页面 →
      </button>
    </div>
  );
}
