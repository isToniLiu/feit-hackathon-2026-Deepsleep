"use client";

import { useState } from "react";

// 篇章①的"假界面"场景：浮在假EduFlow后台上的"Session Expired"重新登录弹窗。
// 除了"拍板"的两个动作(Log In/上报)，现在还有：
// - 调查类交互：点网址栏、悬停Log In按钮，能发现线索(通过onInvestigate记进侧边栏聊天)
// - 第三个"不确定"动作：不算拍板，触发即时求助，玩家还能回来继续操作

export function PhishingLoginScene({
  onChoose,
  onInvestigate,
}: {
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
  onInvestigate: (note: string) => void;
}) {
  const [urlInspected, setUrlInspected] = useState(false);
  const [linkNoticed, setLinkNoticed] = useState(false);
  const [hoveringLogin, setHoveringLogin] = useState(false);

  function inspectUrl() {
    if (!urlInspected) {
      onInvestigate("🔍 你点开看了网址栏：eduflow-portal.com/admin");
      setUrlInspected(true);
    }
  }

  function noticeLoginLink() {
    setHoveringLogin(true);
    if (!linkNoticed) {
      onInvestigate("🔍 你留意到Log In按钮实际会提交到：eduflow-portal-auth.net/login");
      setLinkNoticed(true);
    }
  }

  return (
    <div className="relative w-full max-w-lg">
      {/* 背后一层假后台，营造"你正在用EduFlow工作"的既视感 */}
      <div className="rounded-lg border border-zinc-300 bg-zinc-50 p-4 opacity-50">
        <div className="mb-3 flex items-center gap-2 border-b border-zinc-200 pb-2">
          <div className="h-3 w-3 rounded-full bg-zinc-300" />
          <div className="h-3 w-3 rounded-full bg-zinc-300" />
          <div className="h-3 w-3 rounded-full bg-zinc-300" />
          <span className="ml-2 text-xs text-zinc-400">eduflow-portal.com/admin</span>
        </div>
        <div className="h-4 w-1/3 rounded bg-zinc-200" />
        <div className="mt-2 h-3 w-2/3 rounded bg-zinc-200" />
        <div className="mt-2 h-3 w-1/2 rounded bg-zinc-200" />
      </div>

      {/* 浮在上面的假弹窗，这才是玩家真正要面对的东西 */}
      <div className="absolute inset-x-4 top-8 rounded-lg border border-zinc-400 bg-white p-5 text-left shadow-xl">
        <button
          onClick={inspectUrl}
          className="mb-2 block w-full rounded border border-dashed border-zinc-300 px-2 py-1 text-left text-xs text-zinc-400 underline decoration-dotted hover:bg-zinc-50"
        >
          🔍 eduflow-portal.com/admin — 点击查看完整网址
        </button>

        <p className="mb-1 text-sm font-semibold text-amber-600">⚠ Session Expired</p>
        <p className="mb-4 text-sm text-zinc-600">
          Your session has expired. Please sign in again to continue working on
          EduFlow.
        </p>
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
          onMouseLeave={() => setHoveringLogin(false)}
          className="w-full rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Log In
        </button>
        {hoveringLogin && (
          <p className="mt-1 text-[11px] text-zinc-400">
            → 实际会提交到：eduflow-portal-auth.net/login
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
    </div>
  );
}
