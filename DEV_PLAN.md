# DEV_PLAN.md — 单机开发工作规划（"丑但全功能"版本）

> 背景变化：原 HANDBOOK.md 第3.1节的5人角色分工（P1-P5并行）**暂停使用**——目前开发集中在这一台电脑上，不再按人头拆分并行任务包，而是**按依赖顺序单线推进**。其他队友目前的任务是找前端视觉参考（见 `前端UI参考清单.md`，该文件不在仓库里），暂不影响本计划。
>
> 目标不是"分给谁做"，而是"按什么顺序做，才能最快跑通一个逻辑完整、UI粗糙的Walking Skeleton"——先跑通全部Must功能链路，UI留到素材到位后再统一替换/美化，避免边搭架子边调样式互相拖慢。

---

## 0. 总体策略

- **先骨架，后皮肤**：所有screen先用最朴素的HTML结构+默认Tailwind class（不引入自定义配色、不调间距细节），核心是"点得通、数据流通、AI真实调用成功"。
- **先假数据，后真接口**：状态机和UI先用写死的假剧情文本/假AI反馈跑通交互，最后再切换成真实LLM调用——避免一开始就被API申请/网络问题卡住整体进度。
- **先Must，后Should/Could**：严格对照 `PRD.md` 第4节 MoSCoW 排序推进，不要提前做Should项。
- **单线程开发顺序**：因为只有一台电脑在写代码，下面的阶段按**先后依赖关系**排列，不是并行任务包；做完一个阶段的验收点再进入下一个。

---

## 1. 阶段拆解（按顺序做）

### 阶段 0 · 项目初始化 ✅ 先决条件
- [ ] `npx create-next-app` 初始化 Next.js + TypeScript + Tailwind 项目
- [ ] 确认 `.gitignore` 含 `.env`，`.env` 不提交仓库
- [ ] 建一个 `content/story.json`（或拆成多个文件）存放剧情静态数据结构（先搭字段骨架，具体文案后续可占位）
- [ ] 跑通 `npm run dev`，能看到默认首页

**验收点**：本地能跑起来，Git仓库能正常push/pull。

---

### 阶段 1 · 页面状态机 + 静态screens（对应原P1任务包）✅ 已完成
- [x] 建立页面级状态机（`useState`，`src/app/page.tsx` + `src/lib/flow.ts`），节点顺序：
  `dashboard → briefing → mentor1 → chapter1 → mentor2 → chapter2 → mentor3 → chapter3 → debrief`
  （"30秒速览"入门环节先跳过，属于Could项）
- [x] 每个节点先做一个**最简单的占位screen**（标题+一段文字+"下一步"按钮，`src/components/screens/`），能把整条流程从头点到尾
- [x] 顶部倒计时组件先做静态展示（`src/components/TopBar.tsx`，不接暂停逻辑，暂停机制是Should项，后面再加）

**验收点**：从dashboard点到debrief，全程不报错、不白屏，内容是占位文字也没关系。
→ 已用浏览器实测走完整条流程（含"重新开始"回到dashboard），9个节点全部正常渲染，无报错无白屏。

---

### 阶段 2 · 决策模块（对应原P2任务包）✅ 已完成（Must范围）
- [x] 决策组件（`DecisionScreen.tsx`）：Session Expired（篇章①）、Account Locked（篇章③）先接入；
  fix_deploy_issue.exe（篇章②）按计划继续沿用阶段1的占位screen，属于Should项，先不做
- [x] 每个决策点：安全/危险两个选项按钮 + 文本框"输入理由" + "获取AI反馈"按钮（含空理由禁止提交的校验）
- [x] 反馈展示组件：先接假文案（`story.fallback.safe`/`story.fallback.danger`），把UI占位跑通
- [x] 把决策screen嵌入阶段1的状态机（`DECISION_ENABLED_CHAPTER_IDS`，见`lib/flow.ts`），只对篇章①③生效

**验收点**：篇章①和③能完整走一遍"选选项→写理由→看到（假）反馈→进入下一节点"。
→ 已用浏览器实测：篇章①选"危险"、篇章③选"安全"，两条路径反馈文案都正确匹配对应选项；空理由时提交按钮校验生效。

> 🤔"我不确定"求助选项、🧭参考卡、🫁暂停机制——这三项是Should，等Must全部跑通后再插入，不要在这一步就做。

---

### 阶段 3 · AI后端骨架 + 兜底机制（对应原P4任务包）✅ 已完成
- [x] 建 `/api/get-feedback`（`src/app/api/get-feedback/route.ts`），先返回写死的假回复，接口形状：
  - 入参：`{ chapterId, choice, reason }`
  - 出参：`{ success, data: { feedback: string }, error }`（统一响应格式，见AGENTS.md）
  - 缺参数/非法JSON均返回`{success:false, error: "..."}`，HTTP 400
- [x] 实现try/catch兜底：`generateFeedback`内部调用失败时外层catch返回预设文案(Must)；
  `DecisionScreen`里`fetch`本身失败(网络断开)也会catch住并本地兜底，双层保险
- [x] `DecisionScreen`改成真的`fetch("/api/get-feedback")`，不再本地直接读`story.fallback`

**验收点**：前端点"获取AI反馈"→真的发了一个网络请求到`/api/get-feedback`→拿到返回值渲染出来（哪怕内容还是假的）。
→ 已用curl直接测接口(正常/缺参数/非法JSON三种情况)，再用浏览器实测点击流程，`read_network_requests`和服务器日志都确认了真实的POST请求。

---

### 阶段 4 · 接入真实LLM（对应原P5任务包）⛔ 当前阻塞：等API Key
- [ ] **需要人工操作**：去 Anthropic 或 OpenAI 官网申请一个API Key（二选一，参考AGENTS.md原则：谁先申请到能用的Key就用谁）——这一步AI没法代劳，需要队友自己注册
- [ ] 拿到Key后，填进本地 `.env.local`（复制`.env.example`改名，不会被提交到仓库），格式：`ANTHROPIC_API_KEY=sk-...` 或 `OPENAI_API_KEY=sk-...`
- [ ] 设计并接入prompt：把"剧情节点上下文 + 玩家选项 + 玩家输入的理由"打包传给LLM，生成针对性反馈
- [ ] 把 `src/app/api/get-feedback/route.ts` 里 `generateFeedback()` 函数内部的假回复，替换成真实LLM调用（函数签名、外层try/catch兜底都已经搭好，不用改调用方`DecisionScreen`）
- [ ] 测试至少3类输入：安全选择+合理理由 / 危险选择+合理理由 / 乱打的理由（确认AI不会生成奇怪或跑题的输出）

**验收点**：同一个选项，换不同的理由，AI回应内容明显不同（不是套模板）；断网/Key无效时能正确触发兜底文案。

> 拿到Key之后跟AI说一声"Key配好了"，就能继续把这一步做完——其余阶段(1/2/3/5)都已经跑通，只差这一步就是完整Must的Walking Skeleton。

---

### 阶段 5 · 结局页（补齐P1剩余部分）✅ 已完成
- [x] 安全决策力评分：安全选项计数/已回答篇章数 → 百分比（`DebriefScreen.tsx`），环形图用纯CSS conic-gradient实现，不追求美观
- [x] 关键决策回顾列表：展示篇章①③各自的选择、理由、AI反馈（数据来自`page.tsx`新增的`answers`状态，由`DecisionScreen`的`onNext`回传`DecisionResult`）
- [x] "今晚体验过的岗位"小结：直接列出story.mentors里的三位（Priya/Marcus/Aiko），不是占位文字

**验收点** = **PRD.md 里定义的"Must达标"检查点**：
> 篇章①③完整可玩通 + AI真实调用LLM生成理由反馈 + 结局页评分与回顾

→ 已用浏览器实测：篇章①选"危险"+篇章③选"安全" → debrief显示50%+"中等档位反馈"+两条回顾+三位岗位小结，"重新开始"能正确清空状态回到dashboard。

⚠️ **Must尚未100%达标**：目前"AI真实调用LLM生成理由反馈"这一条还没做——阶段4被卡住了，见下方"当前阻塞项"。功能链路（决策→反馈→评分→回顾）已经全部跑通，只是反馈内容还是`story.fallback`里的假文案，不是真的LLM生成。

---

## 2. Must达标之后：按顺序补Should（有时间就做，没时间就砍）

> 严格按下面顺序加，每加完一项确认没有破坏前面已经跑通的流程，再加下一项。

1. 开场威胁简报screen（Module 1内容）
2. 篇章②恶意文件/仿冒社工（补齐第三个决策点）
3. 🤔"我不确定"求助选项（每个决策点第三选项，触发AI用简单话重新解释）
4. 🧭参考卡（先做单一通用版，时间够再升级成按威胁类型分3个标签页）
5. 🫁暂停机制（决策弹窗内可暂停倒计时）
6. AI自适应分支（根据前面表现调整debrief的flavor文案档位）
7. 结局页AI生成个性化行动卡
8. 沉浸感细节打磨（倒计时视觉、UI贴近真实LMS/运维后台）——**这一步等前端素材到位后再做**

Could项（开场速览、AI驱动视觉高亮、多剧情场景、历史记录）暂不排期，时间富余且Should全部做完再考虑。

---

## 3. UI素材何时接入

- 现在：全部screen用默认Tailwind样式（灰白背景、系统字体、无自定义圆角阴影），**不要花时间调样式**，专注功能链路。
- 队友汇总好FigJam参考图（见 `前端UI参考清单.md`）后：统一做一轮UI替换，替换范围包括配色（深蓝主色+绿/黄/红语义色）、卡片/弹窗的圆角阴影、mentor角色卡排版、结局页评分环样式。
- 原则：UI替换**不应该改动状态机逻辑和API接口**，只改样式/排版，降低回归风险。

---

## 4. 每个阶段结束后自查（对照AGENTS.md，不要跳过）

- 是否符合统一响应格式 `{ success, data, error }`？
- 有没有硬编码密钥？`.env` 有没有被误提交？
- 有没有引入AGENTS.md技术栈之外的新依赖？
- 有没有可能是AI幻觉出来的、不存在的库函数/API？
- 自己动手跑一遍这个阶段的验收点，不是"看起来对"，是真的点开看到结果对。

---

## 5. 当前状态记录

- 角色分工模式：由5人并行任务包 → **改为单机顺序开发**（本文件替代HANDBOOK.md 3.1节当前生效）
- 正式代码：**阶段0/1/2/3/5已完成**，Walking Skeleton功能链路全部跑通（决策→AI反馈接口→结局评分与回顾）
- **当前唯一阻塞项**：阶段4接入真实LLM需要一个Anthropic/OpenAI API Key，需要队友去官网申请，AI没法代劳；申请到后配进`.env.local`即可继续
- 在此之前，反馈内容仍是`story.fallback`里的预设假文案，不是真的AI生成——功能链路对，内容还没接真AI
- 队友并行工作：前端视觉素材收集中（不阻塞本计划的阶段0-5，UI换皮见DEV_PLAN第3节）
