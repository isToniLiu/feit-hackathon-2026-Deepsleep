import { NextResponse } from "next/server";
import { story } from "@/lib/story";

// 统一响应格式，见 AGENTS.md：{ success, data, error }

interface RequestBody {
  chapterId?: string;
  choice?: string;
  reason?: string;
}

function fallbackFeedback(choice: string | undefined): string {
  return choice === "danger" ? story.fallback.danger : story.fallback.safe;
}

// 阶段3先返回假回复(fallback文案)，把接口形状和兜底机制跑通；
// 阶段4会把这个函数内部换成真实LLM调用(Claude/OpenAI API)，
// 调用方(DecisionScreen)和这个route的接口形状都不需要变。
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 阶段4会用上这两个参数(prompt上下文)
async function generateFeedback(_chapterId: string, choice: string, _reason: string): Promise<string> {
  return fallbackFeedback(choice);
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
  if (!chapterId || !choice || typeof reason !== "string" || reason.trim().length === 0) {
    return NextResponse.json(
      { success: false, data: null, error: "缺少必要参数：chapterId / choice / reason" },
      { status: 400 },
    );
  }

  try {
    const feedback = await generateFeedback(chapterId, choice, reason);
    return NextResponse.json({ success: true, data: { feedback }, error: null });
  } catch {
    // 兜底机制（Must项）：调用失败/超时时返回预设文案，不让前端卡死。
    return NextResponse.json({
      success: true,
      data: { feedback: fallbackFeedback(choice) },
      error: null,
    });
  }
}
