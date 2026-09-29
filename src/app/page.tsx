"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { DashboardScreen } from "@/components/screens/DashboardScreen";
import { BriefingScreen } from "@/components/screens/BriefingScreen";
import { MentorScreen } from "@/components/screens/MentorScreen";
import { ChapterScreen } from "@/components/screens/ChapterScreen";
import { DecisionScreen } from "@/components/screens/DecisionScreen";
import { DebriefScreen } from "@/components/screens/DebriefScreen";
import { buildFlow, DECISION_ENABLED_CHAPTER_IDS } from "@/lib/flow";
import { getChapter, type DecisionResult } from "@/lib/story";

const flow = buildFlow();

export default function Home() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DecisionResult>>({});

  const goNext = () => setIndex((i) => Math.min(i + 1, flow.length - 1));
  const restart = () => {
    setAnswers({});
    setIndex(0);
  };

  function recordAnswerAndGoNext(chapterId: string, result: DecisionResult) {
    setAnswers((prev) => ({ ...prev, [chapterId]: result }));
    goNext();
  }

  const node = flow[index];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      {node.type === "dashboard" && <DashboardScreen onNext={goNext} />}
      {node.type === "briefing" && <BriefingScreen onNext={goNext} />}
      {node.type === "mentor" && (
        <MentorScreen mentorId={getChapter(node.chapterId)?.mentorId ?? ""} onNext={goNext} />
      )}
      {node.type === "chapter" &&
        (() => {
          const chapter = getChapter(node.chapterId);
          if (!chapter) return null;
          return DECISION_ENABLED_CHAPTER_IDS.includes(chapter.id) ? (
            <DecisionScreen
              chapter={chapter}
              onNext={(result) => recordAnswerAndGoNext(chapter.id, result)}
            />
          ) : (
            <ChapterScreen chapterId={node.chapterId} onNext={goNext} />
          );
        })()}
      {node.type === "debrief" && (
        <DebriefScreen answers={answers} onRestart={restart} />
      )}
    </div>
  );
}
