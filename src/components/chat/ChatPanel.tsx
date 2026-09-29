"use client";

// 侧边栏聊天窗口：贯穿整个决策篇章，带教同事在这里"远程支援"。
// system角色的消息是场景里调查动作触发的线索记录（比如查了网址栏），
// 不是玩家说的话，样式上要和mentor/player的对话气泡区分开。

export interface ChatMessage {
  id: string;
  role: "mentor" | "player" | "system";
  text: string;
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
}: {
  mentorName: string;
  messages: ChatMessage[];
  inputEnabled: boolean;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  isSending: boolean;
  placeholder: string;
}) {
  return (
    <div className="flex w-full flex-col border-t border-zinc-300 bg-white sm:w-80 sm:border-l sm:border-t-0">
      <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold">
        {mentorName}
      </div>
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto p-3 sm:max-h-none sm:flex-1">
        {messages.map((m) => {
          if (m.role === "system") {
            return (
              <p key={m.id} className="text-center text-xs italic text-zinc-400">
                {m.text}
              </p>
            );
          }
          const isPlayer = m.role === "player";
          return (
            <div key={m.id} className={`flex ${isPlayer ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-left text-sm ${
                  isPlayer ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-400">
              对方正在输入……
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t border-zinc-200 p-2">
        <input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputEnabled && !isSending) onSend();
          }}
          disabled={!inputEnabled || isSending}
          placeholder={placeholder}
          className="flex-1 rounded border border-zinc-300 p-2 text-sm disabled:bg-zinc-50"
        />
        <button
          onClick={onSend}
          disabled={!inputEnabled || isSending || inputValue.trim().length === 0}
          className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
        >
          发送
        </button>
      </div>
    </div>
  );
}
