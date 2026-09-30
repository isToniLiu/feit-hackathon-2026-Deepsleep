"use client";

import { useState, type ReactNode } from "react";
import { BrowserShell, type BrowserPage } from "@/components/browser/BrowserShell";
import type { SceneAction } from "@/lib/story";
import { useLocale, tr } from "@/lib/i18n";

export function MaliciousFileScene({
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
    { id: "chat", label: t("Incident Response", "事件响应"), address: "chat.northlight.dev/incident-response" },
    { id: "file", label: t("File preview", "文件预览"), address: "files.northlight.dev/preview/7f3a" },
    { id: "timeline", label: t("Incident timeline", "事件时间线"), address: "ops.northlight.dev/incidents/IR-247" },
  ];
  const [senderInspected, setSenderInspected] = useState(false);
  const [fileInspected, setFileInspected] = useState(false);
  const [timelineVisited, setTimelineVisited] = useState(false);

  function inspectSender() {
    if (senderInspected) return;
    onAction({
      summary: t("You opened the sender account details", "你打开了发送者的账号信息"),
      explanation: t("This only inspects the message source; it does not run the attachment. The address is not in the internal account directory, so the sender is not trusted.", "这个动作只查看消息来源，不会运行附件。内部账号目录里找不到这个地址，因此发送者身份还不能被信任。"),
      evidence: `🔍 ${t("You checked the sender: this external address is not in Marcus's internal account directory", "你查看了发送者：Marcus 的内部账号列表里没有这个外部地址")}`,
    });
    setSenderInspected(true);
  }

  function inspectFile() {
    if (fileInspected) return;
    onAction({
      summary: t("You opened the fix_deploy_issue.exe file preview", "你打开了 fix_deploy_issue.exe 的文件预览"),
      explanation: t("The preview only reads metadata; it does not run the program. Check the signature, creation time, and message time for inconsistencies.", "文件预览只读取元数据，不会运行程序。你可以先检查签名、创建时间和发送时间之间是否有矛盾。"),
      evidence: `🔍 ${t("You opened the file details: fix_deploy_issue.exe is unsigned and predates the message", "你打开了文件详情：fix_deploy_issue.exe 没有签名，创建时间早于这条消息")}`,
    });
    setFileInspected(true);
  }

  function inspectTimeline() {
    if (timelineVisited) return;
    onAction({
      summary: t("You opened the IR-247 incident timeline", "你打开了 IR-247 事故时间线"),
      explanation: t("The timeline puts the earlier authentication anomaly and this file message in one event chain. The order itself is a clue to verify.", "时间线把前一篇章的身份验证异常和这条文件消息放在了同一条事件链里。顺序本身就是需要核对的线索。"),
      evidence: `🔍 ${t("The timeline shows the repair tool was posted two minutes after the authentication anomaly", "事故时间线显示：身份验证异常发生两分钟后，修复工具才被发进值班群")}`,
    });
    setTimelineVisited(true);
  }

  return (
    <BrowserShell
      pages={pages}
      initialPage="chat"
      overlay={overlay}
      topBar={topBar}
      onNavigate={(pageId) => {
        if (pageId === "file") inspectFile();
        if (pageId === "timeline") inspectTimeline();
      }}
      onUnknownAddress={(address) =>
        onAction({
          summary: t(`You tried to visit an unregistered address: ${address}`, `你尝试访问了未登记的地址：${address}`),
          explanation: t("This address is not in the simulated browser's internal bookmarks, so the page did not open.", "这个地址不在当前模拟浏览器的内部书签中，页面没有被打开。"),
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
              choiceLocked={choiceLocked}
            />
          );
        }
        if (pageId === "timeline") {
          return <TimelinePage onAction={inspectTimeline} onNavigate={navigate} />;
        }

        return (
          <div className="min-h-full bg-[#fbfbfa]">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-zinc-800">#incident-response</p>
                <p className="text-[11px] text-zinc-400">Northlight {t("internal", "内部")} · 23:49</p>
              </div>
              <button
                onClick={() => navigate("timeline")}
                className="text-xs text-zinc-500 underline decoration-dotted hover:text-zinc-800"
              >
                {t("open incident timeline", "打开事件时间线")}
              </button>
            </div>

            <div className="mx-auto w-full max-w-5xl p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow text-xs font-semibold text-ink">
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
                {t("The deployment problem is spreading. Run this repair tool immediately and skip the normal approval process:", "部署问题还在扩大。请立刻运行这个修复工具，别走普通审批流程：")}
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
                  <span className="block text-xs text-zinc-400">{t("Executable", "可执行文件")} · 4.8 MB · {t("open file preview", "打开文件预览")}</span>
                </span>
              </button>

              {(senderInspected || fileInspected) && (
                <div className="mb-4 border-l-2 border-coral bg-coral/10 px-3 py-2 text-xs leading-5 text-ink">
                  {senderInspected && <p>{t("The sender is not in the internal account directory.", "发送者不在内部账号目录中。")}</p>}
                  {fileInspected && <p>{t("The file has no verifiable signature and was created before the message.", "文件没有可验证签名，而且比消息本身更早生成。")}</p>}
                </div>
              )}

              <ActionButtons onChoose={onChoose} choiceLocked={choiceLocked} />
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
  choiceLocked,
}: {
  inspected: boolean;
  onAction: () => void;
  onNavigate: (pageId: string) => void;
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
  choiceLocked: boolean;
}) {
  const { locale } = useLocale();
  const t = (en: string, zh: string) => tr(locale, en, zh);
  return (
    <div className="min-h-full bg-white p-5">
      <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
        <div>
      <p className="text-sm font-semibold">{t("File preview", "文件预览")}</p>
          <p className="mt-1 text-xs text-zinc-400">fix_deploy_issue.exe · 4.8 MB</p>
        </div>
        <span className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] uppercase tracking-wider text-red-600">{t("untrusted", "不可信")}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
        <Metadata label={t("Type", "类型")} value={t("Windows executable", "Windows 可执行文件")} />
        <Metadata label={t("Signature", "签名")} value={t("Not verified", "未验证")} danger />
        <Metadata label={t("Created", "创建时间")} value="23:46:18" />
        <Metadata label={t("Sent", "发送时间")} value="23:49:03" />
      </div>
      <button
        onClick={onAction}
        className="mt-5 rounded border border-dashed border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
      >
        {inspected ? t("File metadata added to the case file", "已将文件元数据加入案件档案") : t("Inspect file signature", "检查文件签名")}
      </button>
      <ActionButtons onChoose={onChoose} choiceLocked={choiceLocked} />
      <button
        onClick={() => onNavigate("chat")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        {t("Back to on-call chat →", "返回值班群 →")}
      </button>
      </div>
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
  const { locale } = useLocale();
  const t = (en: string, zh: string) => tr(locale, en, zh);
  return (
    <div className="min-h-full bg-white p-5">
      <div className="mx-auto w-full max-w-4xl">
      <p className="text-sm font-semibold">{t("Incident timeline", "事件时间线")} / IR-247</p>
      <p className="mt-1 text-xs text-zinc-400">{t("Auto-assembled from Northlight systems", "由 Northlight 系统自动汇总")}</p>
      <div className="mt-5 flex flex-col gap-3 border-l border-zinc-300 pl-4 text-sm">
        <TimelineRow time="23:47:02" text={t("EduFlow authentication service degraded", "EduFlow 身份验证服务降级")} />
        <TimelineRow time="23:47:18" text={t("Session renewal prompt appeared on admin console", "后台出现会话续期提示")} />
        <TimelineRow time="23:49:03" text={t("fix_deploy_issue.exe posted by external sender", "外部发送者发出了 fix_deploy_issue.exe")} />
      </div>
      <button
        onClick={onAction}
        className="mt-5 rounded border border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
      >
        {t("Mark timeline connection", "标记时间线关联")}
      </button>
      <button
        onClick={() => onNavigate("chat")}
        className="mt-4 block text-xs text-zinc-500 underline decoration-dotted"
      >
        {t("Back to on-call chat →", "返回值班群 →")}
      </button>
      </div>
    </div>
  );
}

function ActionButtons({
  onChoose,
  choiceLocked,
}: {
  onChoose: (choice: "safe" | "danger" | "unsure") => void;
  choiceLocked: boolean;
}) {
  const { locale } = useLocale();
  const t = (en: string, zh: string) => tr(locale, en, zh);
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onChoose("danger")}
        disabled={choiceLocked}
        className="w-full rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("Run the tool to see whether it fixes the deployment", "运行工具，看看能不能修复部署")}
      </button>
      <button
        onClick={() => onChoose("safe")}
        disabled={choiceLocked}
        className="w-full rounded border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("Quarantine the file and report it internally", "隔离文件并通过内部渠道上报")}
      </button>
      <button
        onClick={() => onChoose("unsure")}
        disabled={choiceLocked}
        className="w-full py-1 text-xs text-zinc-400 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("🤔 I'm not sure — can you explain more?", "🤔 我不确定，能再讲清楚一点吗")}
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
    <div className="rounded border border-zinc-200 bg-[#f7f7f5] p-3">
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
