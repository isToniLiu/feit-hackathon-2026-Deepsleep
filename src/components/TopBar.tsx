// 顶部倒计时：阶段1先做静态展示，暂停机制（🫁）是Should项，后面再接。

export function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 text-sm">
      <span className="font-semibold">Northlight Digital — Incident Response</span>
      <span className="rounded bg-zinc-100 px-2 py-1 font-mono">占位倒计时 03:45:00</span>
    </div>
  );
}
