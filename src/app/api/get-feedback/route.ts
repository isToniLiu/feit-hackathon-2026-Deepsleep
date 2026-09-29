import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getChapter, getMentor, story } from "@/lib/story";

// 统一响应格式，见 AGENTS.md：{ success, data, error }

interface RequestBody {
  chapterId?: string;
  choice?: string;
  reason?: string;
  actions?: string[];
}

function fallbackFeedback(choice: string | undefined): string {
  return choice === "danger" ? story.fallback.danger : story.fallback.safe;
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// 阶段4：真实LLM调用(OpenAI，见AGENTS.md"技术栈"二选一原则，团队先申请到了OpenAI的Key)。
// 把"剧情节点上下文 + 玩家行动历史 + 玩家选项 + 玩家输入的理由"打包进prompt，生成针对性反馈。
async function generateFeedback(
  chapterId: string,
  choice: string,
  reason: string,
  actions: string[],
): Promise<string> {
  if (!openai) {
    // 没配Key时直接走兜底，不发起网络请求。
    throw new Error("OPENAI_API_KEY未配置");
  }

  const chapter = getChapter(chapterId);
  if (!chapter) {
    throw new Error(`未知的chapterId: ${chapterId}`);
  }
  const mentor = getMentor(chapter.mentorId);
  const option = chapter.options.find((o) => o.id === choice);
  const actionSummary = actions.length > 0 ? actions.map((action) => `- ${action}`).join("\n") : "- 未记录调查动作";

  const systemPrompt = `你是网络安全事故演练游戏"DDL Lockdown"里的教练AI。
你的任务：根据学员在决策点的选择和填写的理由，给出简短(2-4句话)、有针对性的教练式反馈。
要求：
- 反馈必须真实回应学员输入的具体理由内容，不能是无论输入什么都一样的通用模板
- 语气专业但不羞辱；即使学员选择了有风险的应对方式，也要给出建设性、鼓励式的纠正，不指责
- 专业术语（如phishing、GRC等）只能在反馈里顺带出现，不能假设学员已经懂
- 先回应学员实际做过的调查动作及其作用，再回应最终选择和理由
- 直接用第二人称"你"称呼学员
- 不要出现"作为AI"之类的免责声明
- 用中文回复`;

  const userPrompt = `场景：${chapter.title} —— ${chapter.scenario}
带教同事：${mentor?.name ?? "同事"}（${mentor?.role ?? ""}）
学员选择了："${option?.label ?? choice}"（这是${choice === "danger" ? "存在风险" : "安全"}的应对方式）
学员在场景中做过的动作：
${actionSummary}
学员填写的理由："${reason}"

请针对这段具体行动过程和理由生成反馈。`;

  const completion = await openai.chat.completions.create(
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 220,
      temperature: 0.7,
    },
    { timeout: 8000 },
  );

  const feedback = completion.choices[0]?.message?.content?.trim();
  if (!feedback) {
    throw new Error("LLM返回空内容");
  }
  return feedback;
}

export async function POST(request: Request) {
  let body: RequestBody = {};
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "请求体不是合法JSON" },
      { status: 400 },
    );
  }

  const { chapterId, choice, reason } = body;
  const actions = Array.isArray(body.actions)
    ? body.actions.filter((action): action is string => typeof action === "string" && action.trim().length > 0).slice(-20)
    : [];
  if (!chapterId || !choice || typeof reason !== "string" || reason.trim().length === 0) {
    return NextResponse.json(
      { success: false, data: null, error: "缺少必要参数：chapterId / choice / reason" },
      { status: 400 },
    );
  }

  try {
    const feedback = await generateFeedback(chapterId, choice, reason, actions);
    return NextResponse.json({ success: true, data: { feedback }, error: null });
  } catch (err) {
    // 兜底机制（Must项）：调用失败/超时/未配Key时返回预设文案，不让前端卡死。
    console.error("generateFeedback失败，已启用兜底文案：", err);
    return NextResponse.json({
      success: true,
      data: { feedback: fallbackFeedback(choice) },
      error: null,
    });
  }
}
