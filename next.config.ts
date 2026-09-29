import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 本仓库已有一份团队自定义的 AGENTS.md（AI协作规范主文件），
  // 关掉Next.js自动往里追加/生成内容的功能，避免每次 `next dev` 都改动这个文件。
  agentRules: false,
};

export default nextConfig;
