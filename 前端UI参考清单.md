# DDL Lockdown — 前端UI参考清单

> 本文件纯本地使用，不放进GitHub仓库（仓库只放项目代码相关文档）。
> 用途：找到的截图/链接直接丢进团队的FigJam白板，每张图配一句"喜欢这个的哪个点"，方便开发那边直接抄具体的处理方式，而不是抄一整套设计系统。
> 不用追求"找到一模一样的产品"，重点是收集**具体的交互/视觉处理细节**，比如"这个弹窗的阴影和圆角"、"这个卡片的信息层级"，而不是整站截图。

---

## 去哪找（优先级从高到低）

1. **Mobbin**（mobbin.com）——真实上线App/网页的截图库，按"模态框""空状态""卡片"这类具体UI模式搜索，比Dribbble更贴近真实可实现的效果
2. **真实产品官网/直接登录试用**——很多产品截图比设计稿更可信，因为是真的做出来跑起来的效果
3. **Dribbble / Behance**——搜具体关键词（如"incident dashboard"、"security app"），适合找配色/氛围灵感，但要注意很多Dribbble作品华而不实、不好实现，别照抄太复杂的
4. Google图片直接搜英文关键词（见下面每个模块后面的建议关键词）

---

## 按产品的6个模块分别找

### ① 整体氛围：像"公司内部运维/事故处理后台"
- 参考对象：PagerDuty、Datadog、Linear、Vercel Dashboard、Statuspage.io
- 搜索关键词：`incident dashboard UI`、`ops dashboard dark mode`、`SaaS admin panel`
- 重点看：整体是偏"冷静专业"还是"警觉紧张"的调性？我们需要两者平衡——日常状态克制、出现威胁时才用红色/橙色强调

### ② 仪表盘首页 + 课程/任务卡片（EduFlow是Canvas类产品的自我认知）
- 参考对象：Canvas LMS、Google Classroom、Notion的"今日待办"卡片
- 搜索关键词：`LMS dashboard course card`、`assignment card UI`
- 重点看：卡片里信息怎么分层（标题/截止时间/状态标签怎么排布），不用管颜色，我们自己的品牌色不一样

### ③ 团队聊天/事故频道（篇章②"可疑文件"场景要用到）
- 参考对象：Slack、Discord、Microsoft Teams的频道消息界面
- 搜索关键词：`slack message bubble UI`、`chat attachment file card`
- 重点看：一条消息+一个文件附件是怎么排版的，尤其是"文件名+图标"这个小卡片的样式

### ④ 弹窗/模态框（登录过期、账号锁定这两个攻击场景的核心UI）
- 参考对象：任意SaaS产品的"重新登录""身份验证"弹窗，或者干脆搜"phishing simulation"类安全培训产品截图
- 搜索关键词：`login modal UI`、`verification modal design`、`security awareness training screenshot`（这个关键词能直接搜到KnowBe4/Proofpoint这类产品，跟我们的产品类型最像）
- 重点看：弹窗的阴影/圆角/图标处理，以及"这个弹窗看起来是不是有点不对劲"这种违和感要怎么用视觉语言表达出来

### ⑤ 角色介绍卡片（Priya/Marcus/Aiko三位"带教同事"出场）
- 参考对象：Duolingo的角色引导页、游戏里的"NPC对话"界面、任何App的"认识一下你的教练/导师"引导页
- 搜索关键词：`character intro screen UI`、`onboarding mentor card`、`duolingo character screen`
- 重点看：头像+姓名+一句话台词怎么排版最自然，不要做得太像"证件照"

### ⑥ 结局页（评分环+行动清单+岗位小结）
- 参考对象：Duolingo的"本课完成"总结页、任意健身/学习App的"今日成果"页面
- 搜索关键词：`quiz result screen UI`、`score ring progress circle`、`lesson complete screen`
- 重点看：环形进度条/分数怎么呈现最有成就感，以及下面的"回顾列表"怎么排版不显得啰嗦

---

## 一个可以直接抄配色方向的建议
我们目前的色调是"冷静的深蓝作为主色（信任感），配合语义色——绿=安全、黄=警告、红=危险"这个思路。找参考的时候可以顺手留意一下：**同时具备"专业可信"和"紧急感"这两种气质**的产品长什么样，这两种气质如果处理不好容易互相打架（太专业显得不紧张，太紧张显得不专业），这也是我们UI最大的设计挑战，找到处理得好的案例价值最高。

---

## 交付方式
找到的每一张图/每一个链接，丢进FigJam白板时**顺手写一句话**："这个我喜欢xxx"或者"这个弹窗的阴影效果不错"——不写这句话的话，开发那边看着一堆截图不知道该抄哪一点，等于白找。
