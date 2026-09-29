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
import {
  getChapter,
  type DecisionResult,
  type EvidenceItem,
  type IncidentStatus,
} from "@/lib/story";

const flow = buildFlow();

export default function Home() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DecisionResult>>({});
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [incidentStatus, setIncidentStatus] = useState<IncidentStatus>("monitoring");

  const goNext = () => setIndex((i) => Math.min(i + 1, flow.length - 1));
  const restart = () => {
    setAnswers({});
    setEvidence([]);
    setIncidentStatus("monitoring");
    setIndex(0);
  };

  const recordEvidence = (chapterId: string, text: string) => {
    setEvidence((prev) => {
      if (prev.some((item) => item.chapterId === chapterId && item.text === text)) {
        return prev;
      }
      return [
        ...prev,
        { id: `${chapterId}-${prev.length + 1}`, chapterId, text },
      ];
    });
  };

  function recordAnswerAndGoNext(chapterId: string, result: DecisionResult) {
    setAnswers((prev) => ({ ...prev, [chapterId]: result }));
    setIncidentStatus(
      result.choiceId === "danger" ? "containment-risk" : "containment-progress",
    );
    goNext();
  }

  const node = flow[index];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar evidence={evidence} incidentStatus={incidentStatus} />
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
              priorEvidence={evidence}
              incidentStatus={incidentStatus}
              onEvidence={(text) => recordEvidence(chapter.id, text)}
              onNext={(result) => recordAnswerAndGoNext(chapter.id, result)}
            />
          ) : (
            <ChapterScreen chapterId={node.chapterId} onNext={goNext} />
          );
        })()}
      {node.type === "debrief" && (
        <DebriefScreen answers={answers} evidence={evidence} onRestart={restart} />
      )}
    </div>
  );
}
