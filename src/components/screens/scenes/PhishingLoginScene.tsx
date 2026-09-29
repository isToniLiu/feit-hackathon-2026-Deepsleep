"use client";

// 篇章①的"假界面"场景：不再用文字描述"有个弹窗"，而是真的渲染一个
// 浮在假EduFlow后台上的"Session Expired"重新登录弹窗。
// 玩家点弹窗里具体哪个按钮，就是TA的决策——不是从抽象选项列表里选。

export function PhishingLoginScene({
  onChoose,
}: {
  onChoose: (optionId: "safe" | "danger") => void;
}) {
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
          className="mb-4 w-full rounded border border-zinc-300 p-2 text-sm"
        />
        <button
          onClick={() => onChoose("danger")}
          className="w-full rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Log In
        </button>
        <button
          onClick={() => onChoose("safe")}
          className="mt-3 w-full text-xs text-zinc-500 underline hover:text-zinc-700"
        >
          这个弹窗看起来不对劲，上报它
        </button>
      </div>
    </div>
  );
}
