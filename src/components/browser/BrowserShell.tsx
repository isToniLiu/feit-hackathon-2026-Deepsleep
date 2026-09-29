"use client";

import { useState, type FormEvent, type ReactNode } from "react";

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
  children,
}: {
  pages: BrowserPage[];
  initialPage: string;
  onNavigate?: (pageId: string) => void;
  onUnknownAddress?: (address: string) => void;
  children: (pageId: string, navigate: (pageId: string) => void) => ReactNode;
}) {
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
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-300 bg-[#f3f4f6] text-left shadow-2xl">
      <div className="flex items-center gap-1 border-b border-zinc-300 bg-[#e5e7eb] px-2 pt-2">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => navigate(page.id)}
            className={`max-w-44 truncate rounded-t-lg px-3 py-2 text-xs ${
              page.id === currentPageId
                ? "bg-white font-medium text-zinc-800"
                : "text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {page.label}
          </button>
        ))}
        <span className="px-2 pb-2 text-zinc-400">＋</span>
      </div>

      <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2">
        <button
          onClick={() => moveHistory(-1)}
          disabled={historyIndex === 0}
          className="rounded px-1 text-lg leading-none text-zinc-500 hover:bg-zinc-100 disabled:opacity-25"
          aria-label="后退"
        >
          ‹
        </button>
        <button
          onClick={() => moveHistory(1)}
          disabled={historyIndex === history.length - 1}
          className="rounded px-1 text-lg leading-none text-zinc-500 hover:bg-zinc-100 disabled:opacity-25"
          aria-label="前进"
        >
          ›
        </button>
        <button
          onClick={() => setAddressValue(currentPage.address)}
          className="rounded px-1 text-sm text-zinc-500 hover:bg-zinc-100"
          aria-label="刷新"
        >
          ↻
        </button>
        <form onSubmit={submitAddress} className="flex min-w-0 flex-1">
          <div className="flex w-full items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1">
            <span className="text-xs text-emerald-600">●</span>
            <input
              value={addressValue}
              onChange={(event) => setAddressValue(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xs text-zinc-600 outline-none"
              aria-label="地址栏"
            />
          </div>
        </form>
        <span className="hidden text-[10px] text-zinc-400 sm:inline">⋮</span>
      </div>

      <div className="min-h-[25rem] bg-white">
        {children(currentPageId, navigate)}
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-400">
        <span>Northlight managed browser</span>
        <span>History {historyIndex + 1}/{history.length}</span>
      </div>
    </div>
  );
}
