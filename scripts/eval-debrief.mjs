import assert from "node:assert/strict";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const response = await fetch(`${baseUrl}/api/get-debrief`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    origin: "http://localhost:3000",
    "x-forwarded-for": "eval-debrief",
  },
  body: JSON.stringify({
    locale: "zh",
    answers: [
      {
        chapterId: "chapter1",
        choiceId: "safe",
        reasonQuality: 2,
        matchedPoints: ["check-domain"],
        missedPoints: ["no-creds-in-popup"],
        evidenceCount: 2,
        hintLevel: 1,
        reportUsed: true,
        decisionLatencyMs: 12000,
      },
      {
        chapterId: "chapter2",
        choiceId: "safe",
        reasonQuality: 2,
        matchedPoints: ["unknown-sender"],
        missedPoints: ["urgency-pressure"],
        evidenceCount: 3,
        hintLevel: 0,
        reportUsed: true,
        decisionLatencyMs: 9000,
      },
      {
        chapterId: "chapter3",
        choiceId: "safe",
        reasonQuality: 1,
        matchedPoints: [],
        missedPoints: ["urgency-pressure"],
        evidenceCount: 4,
        hintLevel: 2,
        reportUsed: false,
        decisionLatencyMs: 15000,
      },
    ],
    evidence: ["🔍 你查看了登录按钮的目标：eduflow-portal-auth.net/login"],
  }),
});

assert.equal(response.status, 200);
const json = await response.json();
assert.equal(json.success, true);
assert.ok(json.data?.summary);
assert.equal(json.data?.actionCards?.length, 3);
assert.deepEqual(json.data?.evidenceUsed, ["你查看了登录按钮的目标：eduflow-portal-auth.net/login"]);
assert.equal(json.data?.missedPoints?.[0]?.pointId, "no-creds-in-popup");
assert.equal(json.data?.consequences?.length, 3);
assert.equal(json.data?.behavior?.reportUsedCount, 2);
assert.equal(json.data?.behavior?.evidenceCount, 1);
assert.equal(json.data?.behavior?.hintsUsed, 2);
assert.equal(json.data?.behavior?.repeatedMistakes, 1);
assert.equal(json.data?.behavior?.averageDecisionLatencyMs, 12000);
assert.equal(json.data?.nextExercise?.title, "强化练习：账号被锁定，但谁在要求验证？");
assert.ok(["fallback", "demo", "llm"].includes(json.data?.source));
console.log(`PASS debrief: source=${json.data.source} missed=${json.data.missedPoints.length}`);

const englishResponse = await fetch(`${baseUrl}/api/get-debrief`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    origin: "http://localhost:3000",
    "x-forwarded-for": "eval-debrief-en",
  },
  body: JSON.stringify({
    locale: "en",
    answers: [{
      chapterId: "chapter1",
      choiceId: "safe",
      reasonQuality: 2,
      matchedPoints: ["check-domain"],
      missedPoints: ["no-creds-in-popup"],
    }],
    evidence: ["You checked the login button target: eduflow-portal-auth.net/login"],
  }),
});
assert.equal(englishResponse.status, 200);
const englishJson = await englishResponse.json();
assert.equal(englishJson.success, true);
assert.doesNotMatch(englishJson.data.summary, /[一-鿿]/);
for (const card of englishJson.data.actionCards) {
  assert.doesNotMatch(`${card.title} ${card.why} ${card.doNext}`, /[一-鿿]/);
}
console.log(`PASS debrief en: source=${englishJson.data.source}`);
