import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const zh = JSON.parse(fs.readFileSync(path.join(root, "content/story.json"), "utf8"));
const en = JSON.parse(fs.readFileSync(path.join(root, "content/story.en.json"), "utf8"));

const differences = [];

function compareKeys(left, right, location) {
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      differences.push(`${location}: array shape differs`);
      return;
    }
    const hasStructuredItems = left.some((value) => value && typeof value === "object") || right.some((value) => value && typeof value === "object");
    if (!hasStructuredItems) return;
    if (left.length !== right.length) {
      differences.push(`${location}: array length differs`);
      return;
    }
    left.forEach((value, index) => compareKeys(value, right[index], `${location}[${index}]`));
    return;
  }
  if (left && typeof left === "object" || right && typeof right === "object") {
    if (!left || !right || typeof left !== "object" || typeof right !== "object") {
      differences.push(`${location}: value shape differs`);
      return;
    }
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    if (leftKeys.join("\0") !== rightKeys.join("\0")) {
      differences.push(`${location}: keys differ (${leftKeys.join(", ")} vs ${rightKeys.join(", ")})`);
      return;
    }
    for (const key of leftKeys) compareKeys(left[key], right[key], `${location}.${key}`);
  }
}

compareKeys(zh, en, "story");

for (const chapterKey of ["chapters"]) {
  for (const [index, chapter] of zh[chapterKey].entries()) {
    const englishChapter = en[chapterKey][index];
    if (chapter.options.map((option) => option.id).join("\0") !== englishChapter.options.map((option) => option.id).join("\0")) {
      differences.push(`${chapterKey}[${index}].options: ids differ`);
    }
    if (chapter.teachingPoints.map((point) => point.id).join("\0") !== englishChapter.teachingPoints.map((point) => point.id).join("\0")) {
      differences.push(`${chapterKey}[${index}].teachingPoints: ids differ`);
    }
    if (!['beginner', 'intermediate', 'advanced'].includes(chapter.difficulty) || !chapter.attackType) {
      differences.push(`${chapterKey}[${index}]: missing difficulty or attackType`);
    }
    const evidenceIds = chapter.evidence?.map((item) => item.id).join("\0");
    const englishEvidenceIds = englishChapter.evidence?.map((item) => item.id).join("\0");
    if (!evidenceIds || evidenceIds !== englishEvidenceIds) {
      differences.push(`${chapterKey}[${index}].evidence: ids differ or missing`);
    }
    const hintLevels = chapter.hints?.map((hint) => hint.level).join("|");
    const englishHintLevels = englishChapter.hints?.map((hint) => hint.level).join("|");
    if (hintLevels !== "1|2|3" || hintLevels !== englishHintLevels) {
      differences.push(`${chapterKey}[${index}].hints: levels differ or missing`);
    }
    for (const localeChapter of [chapter, englishChapter]) {
      const teachingPointIds = new Set(localeChapter.teachingPoints.map((point) => point.id));
      for (const item of localeChapter.evidence ?? []) {
        if (!item.label || !item.detail || item.teachingPointIds.some((id) => !teachingPointIds.has(id))) {
          differences.push(`${chapterKey}[${index}].evidence.${item.id}: invalid teaching point references`);
        }
      }
      if (!localeChapter.followUp?.safe || !localeChapter.followUp?.danger || !localeChapter.followUp?.unsure) {
        differences.push(`${chapterKey}[${index}].followUp: missing choice copy`);
      }
    }
  }
}

if (differences.length > 0) {
  console.error(differences.join("\n"));
  process.exit(1);
}

console.log("i18n key parity: passed");
