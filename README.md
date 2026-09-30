# CyberStage（DDL Lockdown）

## 📁 文件说明

| 文件 | 用途 |
|---|---|
| `README.md` | 入口：环境准备、Kickoff Prompt、日常开发循环、项目概况摘要 |
| `docs/product/PRD.md` | 完整产品需求（问题陈述、用户调研、竞品分析、MVP范围、Walking Skeleton、数据/API候选清单、决策记录） |
| `AGENTS.md` | 技术栈、命名规范、统一响应格式、AI协作规则、任务完成后自查清单——跨工具通用约定，Codex CLI等会自动读取 |
| `CLAUDE.md` | 一句话指针，指向 `AGENTS.md`（给Claude Code看，内容不重复维护） |
| `docs/team/HANDBOOK.md` | 团队协作流程（赛事日程、角色分工、Git规范、导师资源、风险预案、提交物清单） |
| `docs/development/DEV_PLAN.md` | 单机开发阶段、实际状态机、已完成能力和剩余Should/Could项 |
| `docs/design/UI_REFERENCE.md` | 前端视觉参考与当前ARG视觉方向 |

---

## 🔧 环境准备（第一次开始开发前，只需要做一次）

> AI编程工具（Claude Code / Cursor / Codex CLI 等）读的是**本地文件**，不是网页链接，
> 所以必须先把仓库克隆到本地、让AI工具打开这个本地文件夹，它才能自动读到下面的README/AGENTS.md。

1. 克隆仓库到本地：
   ```
   git clone https://github.com/isToniLiu/ddl-lockdown.git
   ```
2. 用你的AI编程工具（Claude Code / Cursor / Codex CLI 等）打开克隆下来的这个文件夹，把它设为项目根目录/工作目录
3. 确认AI工具能看到文件夹里的 `README.md`、`AGENTS.md`（可以直接问它"列一下这个项目根目录有哪些文件"）
4. 都确认没问题后，再执行下面的 Kickoff Prompt

> 如果你用的是没有本地文件读取能力的网页版AI聊天工具（没有克隆这一步、纯粹网页对话），
> 把仓库链接换成对应文件的raw链接直接贴给它，比如：
> `https://raw.githubusercontent.com/isToniLiu/ddl-lockdown/main/AGENTS.md`

---

## 🚀 开发前必读：Kickoff Prompt

> 每次开始一个新的AI开发session（尤其是第一次、或换了新的对话/新的AI工具）时，先把下面这段话粘贴给你的AI Agent，
> 确认它已经理解项目背景、规则和技术标准，再开始给具体任务。

```
在开始任何开发工作之前，请先阅读本仓库里的以下文件，理解项目背景、规则和技术标准：
1. README.md —— 项目概况摘要 + 当前进度
2. docs/product/PRD.md —— 完整产品需求（问题陈述、目标用户、竞品分析、MVP范围、Walking Skeleton等）
3. AGENTS.md —— 技术栈、命名规范、统一响应格式、禁止事项，以及你完成任务后需要对照自查的清单（CLAUDE.md指向的就是这份文件）
4. docs/development/DEV_PLAN.md —— 已完成阶段、实际状态机、已落地的ARG能力和剩余Should/Could项

读完之后，用几句话跟我确认：这个项目在做什么、目标用户是谁、当前技术栈是什么、当前线上主流程是什么、你接下来完成任务后要怎么自查。
确认没问题后，我会给你具体的任务目标和验收标准。
```

---

## 🔁 日常开发循环（每次领一个任务，都是这个流程）

> 环境准备和Kickoff Prompt只做一次；从这里开始是你每领一个任务都要重复的循环。
> 第一次没有协作开发经验也没关系，跟着走一遍就懂了。

1. 在 GitHub Projects 看板上领一张属于自己模块的任务卡片，把状态改成「进行中」（避免和别人做重复的活，规则见 [`docs/team/HANDBOOK.md`](./docs/team/HANDBOOK.md) 第3.3节）
2. 开始一个新的AI对话/新session：先发上面的 Kickoff Prompt，让AI读完项目背景；然后告诉它这次任务的「任务目标」和「验收标准」两行就够，不用重复贴技术规范
3. 让AI直接开发（vibe coding）。完成后先让它对照 [`AGENTS.md`](./AGENTS.md) 里的「任务完成后自查」清单自己检查一遍，把结果写出来
4. **你自己再独立验证一遍**（不需要看懂代码，只需要操作+观察结果）：
   - 如果是后端/接口类任务：不用等前端做完——直接让AI帮你启动本地开发服务器、用几个不同的输入调用你的接口，把返回的JSON结果显示给你看；简单的GET接口甚至可以直接把链接粘贴到浏览器里打开看结果
   - 如果是前端/页面类任务：本地跑起来，实际点一遍操作流程
   - 对照当初定的「验收标准」，符合预期就算通过——不是「AI说没问题」就算数，是你自己看到结果确实对
5. 通过后，按 [`docs/team/HANDBOOK.md`](./docs/team/HANDBOOK.md) 第5节的Git规范commit、push，需要review就发起PR
6. 把看板卡片状态改成「完成」（或「待review」，如果这次改动需要别人看一眼再合并）
7. 卡住超过30分钟没进展 → 直接群里喊人，不要自己死磕（[`docs/team/HANDBOOK.md`](./docs/team/HANDBOOK.md) 第3.2节）

---

## 📋 项目概况

> 完整PRD（问题陈述、目标用户、竞品分析、MVP范围、Walking Skeleton、数据/API候选清单、决策记录）见 [`docs/product/PRD.md`](./docs/product/PRD.md)，
> 这里只放一眼就要看到的摘要，不重复维护。

**品牌与命名：** 对外产品名为 **CyberStage**；**DDL Lockdown** 是项目/仓库代号；**IR-247** 是核心案件编号。当前统一视觉方向为复古现代平面设计外壳 + 中央模拟浏览器ARG真实感，详见 [`docs/design/UI_REFERENCE.md`](./docs/design/UI_REFERENCE.md)。

**问题陈述（一句话）：** 一个面向零基础网络安全学习者的"情景决策式模拟游戏"——玩家扮演实习生，在软件公司自研Canvas类平台遭遇攻击的一晚，选择不同岗位作为调查入口，进入同一事故的不同系统与证据视角，AI读取玩家自己写下的判断理由生成针对性教练反馈（Untapped Talent赛道 "Engineering the Future of Learning"）。

**当前进度：** 已选定赛题方向（Untapped Talent）、产品形态，并完成剧情**重构为角色入口+调查工作台+单岗位篇章视角**（三个角色分别对应三个可重玩的调查入口）；阶段0–5与Must验收已完成，另已完成场景化交互、ARG案件档案、侧边栏聊天、动态 `CASE OBJECTIVES` 任务栏、动作记录与AI反馈、现场持续探索、角色入口选择、岗位任务工作台、结局AI行动卡和完整 After Action Report。后端已增加结构化 AI 反馈、规则判定与 AI 文案边界、理由质量、教学要点、敏感信息拦截、提示注入防护、分级求助、结局复盘接口、行为指标闭环、演示模式、自动化评测，以及支持 `locale: "zh" | "en"` 的双语反馈/复盘 API。CyberStage 视觉迁移已完成，已通过 lint、生产构建、国际化 key 检查和反馈/结局评测。2026-09-30 又完成了界面语言分离（中文模式下岗位名、系统入口、模拟浏览器内页面、行动日志、提示语和结局页均已翻译，切换语言不再混入另一种语言）以及调查现场的视口高度约束；手机和平板尺寸（640–1100px 分栏、360px 下浏览器内容区过矮）仍有已知问题，见 [`docs/development/MOBILE_UI_CHECKLIST.md`](./docs/development/MOBILE_UI_CHECKLIST.md)。当前进入线上验收阶段。当前生产版本为 [cyberstage.vercel.app](https://cyberstage.vercel.app/)，实现与规划的差异及剩余项详见 [`docs/product/PRD.md`](./docs/product/PRD.md) 第10节和 [`docs/development/DEV_PLAN.md`](./docs/development/DEV_PLAN.md)。

> AI 安全边界：当前仅使用合成演示数据；理由发送前会拦截明显的密码、验证码、Token/API Key 和提示注入，不保存理由原文。AI 只生成教练反馈，评分和教学点归因由规则决定；新增动态场景必须经过人工审核或白名单发布。请勿提交真实事件材料、密码、验证码、Token 或个人资料。

---

## 🛠️ 技术栈与规范 / AI 输出自查清单

见 [`AGENTS.md`](./AGENTS.md)。

## 📚 更多背景

完整的团队协作流程（时间表、角色分工、Git规范、风险预案、提交物清单等）见 [`docs/team/HANDBOOK.md`](./docs/team/HANDBOOK.md)。
