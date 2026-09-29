"use client";

import { useState } from "react";
import { BrowserShell, type BrowserPage } from "@/components/browser/BrowserShell";
import type { SceneAction } from "@/lib/story";

const pages: BrowserPage[] = [
  { id: "chat", label: "Incident Response", address: "chat.northlight.dev/incident-response" },
  { id: "file", label: "File preview", address: "files.northlight.dev/preview/7f3a" },
  { id: "timeline", label: "Incident timeline", address: "ops.northlight.dev/incidents/IR-247" },
];

export function MaliciousFileScene({
  onChoose,
  onAction,
}: {
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
  onAction: (action: SceneAction) => void;
}) {
  const [senderInspected, setSenderInspected] = useState(false);
  const [fileInspected, setFileInspected] = useState(false);
  const [timelineVisited, setTimelineVisited] = useState(false);

  function inspectSender() {
    if (senderInspected) return;
    onAction({
      summary: "你打开了发送者的账号信息",
      explanation: "这个动作只查看消息来源，不会运行附件。内部账号目录里找不到这个地址，因此发送者身份还不能被信任。",
      evidence: "🔍 你查看了发送者：Marcus 的内部账号列表里没有这个外部地址",
    });
    setSenderInspected(true);
  }

  function inspectFile() {
    if (fileInspected) return;
    onAction({
      summary: "你打开了 fix_deploy_issue.exe 的文件预览",
      explanation: "文件预览只读取元数据，不会运行程序。你可以先检查签名、创建时间和发送时间之间是否有矛盾。",
      evidence: "🔍 你打开了文件详情：fix_deploy_issue.exe 没有签名，创建时间早于这条消息",
    });
    setFileInspected(true);
  }

  function inspectTimeline() {
    if (timelineVisited) return;
    onAction({
      summary: "你打开了 IR-247 事故时间线",
      explanation: "时间线把前一篇章的身份验证异常和这条文件消息放在了同一条事件链里。顺序本身就是需要核对的线索。",
      evidence: "🔍 事故时间线显示：身份验证异常发生两分钟后，修复工具才被发进值班群",
    });
    setTimelineVisited(true);
  }

  return (
    <BrowserShell
      pages={pages}
      initialPage="chat"
      onNavigate={(pageId) => {
        if (pageId === "file") inspectFile();
        if (pageId === "timeline") inspectTimeline();
      }}
      onUnknownAddress={(address) =>
        onAction({
          summary: `你尝试访问了未登记的地址：${address}`,
          explanation: "这个地址不在当前模拟浏览器的内部书签中，页面没有被打开。",
        })
      }
    >
      {(pageId, navigate) => {
        if (pageId === "file") {
          return (
            <FilePreviewPage
              inspected={fileInspected}
              onAction={inspectFile}
              onNavigate={navigate}
              onChoose={onChoose}
            />
          );
        }
        if (pageId === "timeline") {
          return <TimelinePage onAction={inspectTimeline} onNavigate={navigate} />;
        }

        return (
          <div className="min-h-[25rem] bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-zinc-800">#incident-response</p>
                <p className="text-[11px] text-zinc-400">Northlight internal · 23:49</p>
              </div>
              <button
                onClick={() => navigate("timeline")}
                className="text-xs text-zinc-500 underline decoration-dotted hover:text-zinc-800"
              >
                open incident timeline
              </button>
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
                onClick={() => {
                  inspectFile();
                  navigate("file");
                }}
                className="mb-4 flex w-full items-center gap-3 rounded border border-dashed border-zinc-300 p-3 text-left hover:bg-zinc-50"
              >
                <span className="text-2xl">▣</span>
                <span>
                  <span className="block text-sm font-medium text-zinc-800">fix_deploy_issue.exe</span>
                  <span className="block text-xs text-zinc-400">Executable · 4.8 MB · 打开文件预览</span>
                </span>
              </button>

              {(senderInspected || fileInspected) && (
                <div className="mb-4 border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  {senderInspected && <p>发送者不在内部账号目录中。</p>}
                  {fileInspected && <p>文件没有可验证签名，而且比消息本身更早生成。</p>}
                </div>
              )}

              <ActionButtons onChoose={onChoose} />
            </div>
          </div>
        );
      }}
    </BrowserShell>
  );
}

function FilePreviewPage({
  inspected,
  onAction,
  onNavigate,
  onChoose,
}: {
  inspected: boolean;
  onAction: () => void;
  onNavigate: (pageId: string) => void;
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
}) {
  return (
    <div className="min-h-[25rem] bg-white p-5">
      <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
        <div>
          <p className="text-sm font-semibold">File preview</p>
          <p className="mt-1 text-xs text-zinc-400">fix_deploy_issue.exe · 4.8 MB</p>
        </div>
        <span className="rounded bg-red-50 px-2 py-1 text-[10px] uppercase tracking-wider text-red-600">untrusted</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
        <Metadata label="Type" value="Windows executable" />
        <Metadata label="Signature" value="Not verified" danger />
        <Metadata label="Created" value="23:46:18" />
        <Metadata label="Sent" value="23:49:03" />
      </div>
      <button
        onClick={onAction}
        className="mt-5 rounded border border-dashed border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
      >
        {inspected ? "已将文件元数据加入案件档案" : "检查文件签名"}
      </button>
      <ActionButtons onChoose={onChoose} />
      <button
        onClick={() => onNavigate("chat")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        返回值班群 →
      </button>
    </div>
  );
}

function TimelinePage({
  onAction,
  onNavigate,
}: {
  onAction: () => void;
  onNavigate: (pageId: string) => void;
}) {
  return (
    <div className="min-h-[25rem] bg-white p-5">
      <p className="text-sm font-semibold">Incident timeline / IR-247</p>
      <p className="mt-1 text-xs text-zinc-400">Auto-assembled from Northlight systems</p>
      <div className="mt-5 flex flex-col gap-3 border-l border-zinc-300 pl-4 text-sm">
        <TimelineRow time="23:47:02" text="EduFlow authentication service degraded" />
        <TimelineRow time="23:47:18" text="Session renewal prompt appeared on admin console" />
        <TimelineRow time="23:49:03" text="fix_deploy_issue.exe posted by external sender" />
      </div>
      <button
        onClick={onAction}
        className="mt-5 rounded border border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
      >
        标记时间线关联
      </button>
      <button
        onClick={() => onNavigate("chat")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        返回值班群 →
      </button>
    </div>
  );
}

function ActionButtons({
  onChoose,
}: {
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
}) {
  return (
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
  );
}

function Metadata({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-zinc-400">{label}</p>
      <p className={danger ? "mt-1 font-medium text-red-600" : "mt-1 font-medium text-zinc-700"}>{value}</p>
    </div>
  );
}

function TimelineRow({ time, text }: { time: string; text: string }) {
  return (
    <div className="relative">
      <span className="absolute -left-[1.35rem] top-1 h-2 w-2 rounded-full bg-zinc-400" />
      <p className="font-mono text-[11px] text-zinc-400">{time}</p>
      <p className="mt-1 text-zinc-700">{text}</p>
    </div>
  );
}
