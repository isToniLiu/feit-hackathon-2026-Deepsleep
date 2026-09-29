"use client";

import { useState } from "react";

export function MaliciousFileScene({
  onChoose,
  onInvestigate,
}: {
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
  onInvestigate: (note: string) => void;
}) {
  const [senderInspected, setSenderInspected] = useState(false);
  const [fileInspected, setFileInspected] = useState(false);

  function inspectSender() {
    if (senderInspected) return;
    onInvestigate("🔍 你查看了发送者：Marcus 的内部账号列表里没有这个外部地址");
    setSenderInspected(true);
  }

  function inspectFile() {
    if (fileInspected) return;
    onInvestigate("🔍 你打开了文件详情：fix_deploy_issue.exe 没有签名，创建时间早于这条消息");
    setFileInspected(true);
  }

  return (
    <div className="w-full max-w-lg rounded-lg border border-zinc-300 bg-white text-left shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-zinc-800">#incident-response</p>
          <p className="text-[11px] text-zinc-400">Northlight internal · 23:49</p>
        </div>
        <span className="rounded bg-amber-50 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-700">
          external sender
        </span>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
            IT
          </div>
          <div>
            <button
              onClick={inspectSender}
              className="text-sm font-medium underline decoration-dotted underline-offset-2 hover:text-zinc-500"
            >
              it-helpdesk-temp
            </button>
            <p className="text-[11px] text-zinc-400">it-helpdesk-temp@support-mail.cc</p>
          </div>
        </div>

        <p className="mb-4 text-sm leading-6 text-zinc-700">
          部署问题还在扩大。请立刻运行这个修复工具，别走普通审批流程：
        </p>

        <button
          onClick={inspectFile}
          className="mb-4 flex w-full items-center gap-3 rounded border border-dashed border-zinc-300 p-3 text-left hover:bg-zinc-50"
        >
          <span className="text-2xl">▣</span>
          <span>
            <span className="block text-sm font-medium text-zinc-800">fix_deploy_issue.exe</span>
            <span className="block text-xs text-zinc-400">Executable · 4.8 MB · 点击查看文件详情</span>
          </span>
        </button>

        {(senderInspected || fileInspected) && (
          <div className="mb-4 border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            {senderInspected && <p>发送者不在内部账号目录中。</p>}
            {fileInspected && <p>文件没有可验证签名，而且比消息本身更早生成。</p>}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onChoose("danger")}
            className="w-full rounded bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-500"
          >
            运行工具，看看能不能修复部署
          </button>
          <button
            onClick={() => onChoose("safe")}
            className="w-full rounded border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-100"
          >
            隔离文件并通过内部渠道上报
          </button>
          <button
            onClick={() => onChoose("unsure")}
            className="w-full py-1 text-xs text-zinc-400 hover:text-zinc-600"
          >
            🤔 我不确定，能再讲清楚一点吗
          </button>
        </div>
      </div>
    </div>
  );
}
