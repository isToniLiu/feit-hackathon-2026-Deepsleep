"use client";

// 篇章③的"假界面"场景：真的渲染一个"Account Locked — Verification Required"
// 验证表单，而不是用文字描述它。玩家要么开始往里填资料(危险)，要么走官方流程(安全)。

export function AccountLockedScene({
  onChoose,
}: {
  onChoose: (optionId: "safe" | "danger") => void;
}) {
  return (
    <div className="w-full max-w-lg rounded-lg border border-red-300 bg-white p-6 text-left shadow-xl">
      <p className="mb-1 text-sm font-semibold text-red-600">🔒 Account Locked</p>
      <p className="mb-4 text-sm text-zinc-600">
        Verification Required — unusual activity was detected on your account.
        Complete verification below to restore access immediately.
      </p>

      <label className="mb-1 block text-xs text-zinc-500">Employee ID</label>
      <input
        type="text"
        placeholder="EMP-00482"
        className="mb-3 w-full rounded border border-zinc-300 p-2 text-sm"
      />
      <label className="mb-1 block text-xs text-zinc-500">Verification code (sent to your phone)</label>
      <input
        type="text"
        placeholder="6位数字"
        className="mb-4 w-full rounded border border-zinc-300 p-2 text-sm"
      />
      <button
        onClick={() => onChoose("danger")}
        className="w-full rounded bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-500"
      >
        Verify &amp; Unlock Now
      </button>
      <button
        onClick={() => onChoose("safe")}
        className="mt-3 w-full rounded border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-100"
      >
        先不填，走官方流程联系IT
      </button>
    </div>
  );
}
