export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-2xl font-semibold">DDL Lockdown — 脚手架已就绪</h1>
      <p className="max-w-md text-zinc-600">
        阶段0已完成：Next.js + TypeScript + Tailwind 项目已初始化。
        接下来按 DEV_PLAN.md 阶段1开始搭建页面状态机。
      </p>
    </div>
  );
}
