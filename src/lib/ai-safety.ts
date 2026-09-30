import type { Chapter, MatchedClue } from "./story";

export type SafetyIssue = "sensitive" | "prompt-injection";

const SENSITIVE_PATTERNS: RegExp[] = [
  /bearer\s+[a-z0-9._~+/=-]{12,}/i,
  /\bsk-[a-z0-9]{10,}\b/i,
  /(?:api[_ -]?key|access[_ -]?token|secret)\s*(?:[:=]|is|为|是)\s*\S+/i,
  /(?:password|passwd|pwd|密码|口令)\s*(?:[:=]|is|为|是)\s*\S+/i,
  /(?:verification\s*code|验证码|一次性密码|otp)\s*(?:[:=]|is|为|是)\s*\S+/i,
  /\b\d{6}\b/,
];

const PROMPT_INJECTION_PATTERN = /(ignore\s+(all\s+)?previous\s+instructions|print\s+(the\s+)?system\s+prompt|give\s+me\s+full\s+marks|you\s+are\s+now|忽略(?:以上|之前)指令|输出系统提示|给我满分|你现在是)/i;

export function detectSafetyIssue(reason: string): SafetyIssue | null {
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(reason))) return "sensitive";
  if (PROMPT_INJECTION_PATTERN.test(reason)) return "prompt-injection";
  return null;
}

export function sanitizeReasonForModel(reason: string): string {
  return reason
    .replace(/bearer\s+[a-z0-9._~+/=-]{12,}/gi, "Bearer [REDACTED]")
    .replace(/\bsk-[a-z0-9]{10,}\b/gi, "[REDACTED_API_KEY]")
    .replace(/((?:api[_ -]?key|access[_ -]?token|secret)\s*(?:[:=]|is|为|是)\s*)\S+/gi, "$1[REDACTED]")
    .replace(/((?:password|passwd|pwd|密码|口令)\s*(?:[:=]|is|为|是)\s*)\S+/gi, "$1[REDACTED]")
    .replace(/((?:verification\s*code|验证码|一次性密码|otp)\s*(?:[:=]|is|为|是)\s*)\S+/gi, "$1[REDACTED]")
    .replace(/<\/?player_reason>/gi, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, 800);
}

export function deterministicReasonAssessment(reason: string, chapter: Chapter): {
  reasonQuality: 0 | 1 | 2 | 3;
  matchedPoints: string[];
  missedPoints: string[];
  matchedClues: MatchedClue[];
} {
  const normalized = reason.trim().toLowerCase();
  const issue = detectSafetyIssue(reason);
  const matchedClues = issue
    ? []
    : chapter.teachingPoints.flatMap((point) => {
        const keywords = point.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
        if (keywords.length === 0) return [];
        return [{
          pointId: point.id,
          keywords,
          evidenceIds: chapter.evidence
            .filter((item) => item.teachingPointIds.includes(point.id))
            .map((item) => item.id),
        }];
      });
  const matchedPoints = matchedClues.map((clue) => clue.pointId);
  const missedPoints = chapter.teachingPoints
    .filter((point) => !matchedPoints.includes(point.id))
    .map((point) => point.id);

  if (!normalized || /^[a-z]{8,}$/i.test(normalized) || /^(.)\1{5,}$/.test(normalized) || issue) {
    return { reasonQuality: 0, matchedPoints, missedPoints, matchedClues };
  }
  if (normalized.length < 15 || matchedPoints.length === 0) {
    return { reasonQuality: 1, matchedPoints, missedPoints, matchedClues };
  }
  return { reasonQuality: matchedPoints.length >= 2 ? 3 : 2, matchedPoints, missedPoints, matchedClues };
}

export const AI_FEEDBACK_BOUNDARY = {
  feedbackOnly: true,
  deterministicAssessment: true,
  dynamicScenarioGeneration: false,
  newScenarioRequiresHumanReview: true,
} as const;
