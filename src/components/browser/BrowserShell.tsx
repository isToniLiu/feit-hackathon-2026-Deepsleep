"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useLocale, tr } from "@/lib/i18n";

export interface BrowserPage {
  id: string;
  label: string;
  address: string;
}

export function BrowserShell({
  pages,
  initialPage,
  onNavigate,
  onUnknownAddress,
  overlay,
  topBar,
  children,
}: {
  pages: BrowserPage[];
  initialPage: string;
  onNavigate?: (pageId: string) => void;
  onUnknownAddress?: (address: string) => void;
  overlay?: ReactNode;
  topBar?: ReactNode;
  children: (pageId: string, navigate: (pageId: string) => void) => ReactNode;
}) {
  const { locale } = useLocale();
  const [history, setHistory] = useState([initialPage]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentPageId = history[historyIndex] ?? initialPage;
  const currentPage = pages.find((page) => page.id === currentPageId) ?? pages[0];
  const [addressValue, setAddressValue] = useState(currentPage.address);

  function navigate(pageId: string) {
    if (!pages.some((page) => page.id === pageId)) return;
    if (pageId === currentPageId) return;
    const nextPage = pages.find((page) => page.id === pageId);
    const nextHistory = [...history.slice(0, historyIndex + 1), pageId];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setAddressValue(nextPage?.address ?? currentPage.address);
    onNavigate?.(pageId);
  }

  function moveHistory(direction: -1 | 1) {
    const nextIndex = historyIndex + direction;
    if (nextIndex < 0 || nextIndex >= history.length) return;
    setHistoryIndex(nextIndex);
    const nextPage = pages.find((page) => page.id === history[nextIndex]);
    setAddressValue(nextPage?.address ?? currentPage.address);
  }

  function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedAddress = addressValue.trim().toLowerCase();
    const page = pages.find((candidate) => candidate.address.toLowerCase() === normalizedAddress);
    if (page) {
      navigate(page.id);
      return;
    }
    onUnknownAddress?.(addressValue.trim());
    setAddressValue(currentPage.address);
  }

  return (
    <div className="flex h-auto min-h-0 w-full flex-none aspect-[16/10] flex-col overflow-hidden rounded-[1.1rem] border border-[#bfc3c8] bg-[#eef0f2] text-left shadow-[0_20px_55px_rgba(30,35,40,0.22)] lg:h-full lg:aspect-auto">
      {topBar && (
        <div className="shrink-0 border-b border-[#cbd0d5] bg-[#f7f8f9] px-4 py-2.5 text-zinc-700">
          {topBar}
        </div>
      )}
      <div className="flex items-center gap-1 border-b border-[#c6cbd0] bg-[#e1e5e8] px-2 pt-2">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => navigate(page.id)}
            className={`max-w-44 truncate rounded-t-lg px-3 py-2 text-xs ${
              page.id === currentPageId
                ? "bg-white font-medium text-zinc-800 shadow-[0_-1px_0_rgba(255,255,255,.8)]"
                : "text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {page.label}
          </button>
        ))}
        <span className="px-2 pb-2 text-zinc-400">＋</span>
      </div>

      <div className="flex items-center gap-2 border-b border-zinc-200 bg-[#fbfcfc] px-3 py-2">
        <button
          onClick={() => moveHistory(-1)}
          disabled={historyIndex === 0}
          className="rounded px-1 text-lg leading-none text-zinc-500 hover:bg-zinc-100 disabled:opacity-25"
          aria-label={tr(locale, "Back", "后退")}
        >
          ‹
        </button>
        <button
          onClick={() => moveHistory(1)}
          disabled={historyIndex === history.length - 1}
          className="rounded px-1 text-lg leading-none text-zinc-500 hover:bg-zinc-100 disabled:opacity-25"
          aria-label={tr(locale, "Forward", "前进")}
        >
          ›
        </button>
        <button
          onClick={() => setAddressValue(currentPage.address)}
          className="rounded px-1 text-sm text-zinc-500 hover:bg-zinc-100"
          aria-label={tr(locale, "Refresh", "刷新")}
        >
          ↻
        </button>
        <form onSubmit={submitAddress} className="flex min-w-0 flex-1">
          <div className="flex w-full items-center gap-2 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1">
            <span className="text-xs text-emerald-600">●</span>
            <input
              value={addressValue}
              onChange={(event) => setAddressValue(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xs text-zinc-600 outline-none"
              aria-label={tr(locale, "Address bar", "地址栏")}
            />
          </div>
        </form>
        <span className="hidden text-[10px] text-zinc-400 sm:inline">⋮</span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto bg-white">
        {overlay && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-zinc-900/10 p-4">
            <div className="pointer-events-auto max-h-full w-full max-w-[32rem] overflow-y-auto">
              {overlay}
            </div>
          </div>
        )}
        {children(currentPageId, navigate)}
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 bg-[#f4f5f5] px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-400">
        <span>{tr(locale, "Northlight managed browser", "Northlight 托管浏览器")}</span>
        <span>{tr(locale, "History", "历史")} {historyIndex + 1}/{history.length}</span>
      </div>
    </div>
  );
}
