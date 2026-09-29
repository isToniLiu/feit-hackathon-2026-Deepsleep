"use client";

import { useState } from "react";

// 篇章③的"假界面"场景：Account Locked验证表单。
// 同样加了调查类交互(查表单是否正常、悬停按钮看真实提交地址)和"不确定"动作。

export function AccountLockedScene({
  onChoose,
  onInvestigate,
}: {
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
  onInvestigate: (note: string) => void;
}) {
  const [tipShown, setTipShown] = useState(false);
  const [linkNoticed, setLinkNoticed] = useState(false);
  const [hoveringVerify, setHoveringVerify] = useState(false);

  function showTip() {
    if (!tipShown) {
      onInvestigate("🔍 你查了一下：正规IT流程一般不会在锁定提示里直接问你要验证码");
      setTipShown(true);
    }
  }

  function noticeVerifyLink() {
    setHoveringVerify(true);
    if (!linkNoticed) {
      onInvestigate("🔍 你留意到这个表单实际会提交到：secure-verify-eduflow.net");
      setLinkNoticed(true);
    }
  }

  return (
    <div className="w-full max-w-lg rounded-lg border border-red-300 bg-white p-6 text-left shadow-xl">
      <p className="mb-1 text-sm font-semibold text-red-600">🔒 Account Locked</p>
      <p className="mb-4 text-sm text-zinc-600">
        Verification Required — unusual activity was detected on your account.
        Complete verification below to restore access immediately.
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
      <label className="mb-1 block text-xs text-zinc-500">
        Verification code (sent to your phone)
      </label>
      <input
        type="text"
        placeholder="6位数字"
        className="mb-2 w-full rounded border border-zinc-300 p-2 text-sm"
      />

      <button
        onClick={() => onChoose("danger")}
        onMouseEnter={noticeVerifyLink}
        onMouseLeave={() => setHoveringVerify(false)}
        className="w-full rounded bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-500"
      >
        Verify &amp; Unlock Now
      </button>
      {hoveringVerify && (
        <p className="mt-1 text-[11px] text-zinc-400">
          → 实际会提交到：secure-verify-eduflow.net
        </p>
      )}

      <button
        onClick={() => onChoose("safe")}
        className="mt-3 w-full rounded border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-100"
      >
        先不填，走官方流程联系IT
      </button>
      <button
        onClick={() => onChoose("unsure")}
        className="mt-2 w-full text-xs text-zinc-400 hover:text-zinc-600"
      >
        🤔 我不确定，能再讲清楚一点吗
      </button>
    </div>
  );
}
