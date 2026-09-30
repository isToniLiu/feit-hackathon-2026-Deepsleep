"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, tr } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/story";

// 侧边栏聊天窗口：贯穿整个决策篇章，带教同事在这里"远程支援"。
// system角色的消息是场景里调查动作触发的线索记录（比如查了网址栏），
// 不是玩家说的话，样式上要和mentor/player的对话气泡区分开。

export interface ChatMessage {
  id: string;
  role: "mentor" | "player" | "system";
  text: string;
  locale?: Locale;
}

export function ChatPanel({
  mentorName,
  messages,
  inputEnabled,
  inputValue,
  onInputChange,
  onSend,
  isSending,
  placeholder,
  safetyNote,
  objectives,
}: {
  mentorName: string;
  messages: ChatMessage[];
  inputEnabled: boolean;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  isSending: boolean;
  placeholder: string;
  safetyNote?: string;
  objectives?: ReactNode;
}) {
  const { locale } = useLocale();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isSending]);

  useEffect(() => {
    if (inputEnabled) inputRef.current?.focus();
  }, [inputEnabled]);

  return (
    <div className="flex min-h-0 w-full flex-none flex-col gap-3 overflow-visible bg-paper p-3 lg:h-full lg:min-w-[320px] lg:w-[clamp(320px,26vw,400px)] lg:flex-none lg:overflow-hidden lg:p-4">
      {objectives && (
        <div className="w-full shrink-0 overflow-visible rounded-xl border border-rule bg-surface shadow-[0_10px_24px_rgba(30,28,20,0.07)] lg:min-h-0 lg:max-h-[38%] lg:overflow-y-auto">
          {objectives}
        </div>
      )}
      <div className="flex min-h-[28rem] w-full flex-none flex-col overflow-visible rounded-xl border border-rule bg-surface shadow-[0_10px_24px_rgba(30,28,20,0.07)] lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      <div className="shrink-0 border-b border-rule px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{tr(locale, "Remote support", "远程支援")}</p>
        <p className="mt-1 text-sm font-semibold">{mentorName}</p>
      </div>
      <div role="log" aria-live="polite" className="flex flex-none flex-col gap-2 overflow-visible overscroll-contain p-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {messages.filter((message) => !message.locale || message.locale === locale).map((m) => {
          if (m.role === "system") {
            return (
              <p key={m.id} className="my-1 text-center text-[10px] uppercase tracking-[0.12em] text-muted">
                {m.text}
              </p>
            );
          }
          const isPlayer = m.role === "player";
          return (
            <div key={m.id} className={`flex ${isPlayer ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-left text-sm ${
                  isPlayer ? "bg-ink text-white" : "border border-rule bg-paper text-ink"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-muted">
              {tr(locale, "Typing…", "对方正在输入……")}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {safetyNote && (
        <p role="note" className="shrink-0 border-t border-yellow/30 bg-yellow/10 px-3 py-2 text-[11px] leading-4 text-ink">
          {safetyNote}
        </p>
      )}
      <div className="shrink-0 border-t border-rule p-2">
        <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={inputValue}
          maxLength={400}
          rows={2}
          onChange={(e) => onInputChange(e.target.value.slice(0, 400))}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isComposing && !e.nativeEvent.isComposing && inputEnabled && !isSending) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={!inputEnabled || isSending}
          placeholder={placeholder}
          className="min-h-10 flex-1 resize-none rounded border border-rule bg-paper p-2 text-sm outline-none focus:border-ink disabled:bg-surface-muted"
        />
        <Button
          type="button"
          variant="primary"
          onClick={onSend}
          disabled={!inputEnabled || isSending || inputValue.trim().length === 0}
          className="rounded px-3 py-2"
          aria-label={tr(locale, "Send reasoning", "发送判断理由")}
        >
          {tr(locale, "Send", "发送")}
        </Button>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted"><span>{inputEnabled ? tr(locale, "Enter to send · Shift+Enter for a new line", "Enter 发送 · Shift+Enter 换行") : tr(locale, "Investigate first, then explain your reasoning", "先调查现场，再说明你的判断")}</span><span className={inputValue.length > 360 ? "text-yellow" : ""}>{inputValue.length}/400</span></div>
      </div>
      </div>
    </div>
  );
}
