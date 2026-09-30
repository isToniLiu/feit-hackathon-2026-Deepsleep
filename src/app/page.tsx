"use client";

import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { RoleSelectScreen } from "@/components/screens/RoleSelectScreen";
import { RoleWorkspaceScreen } from "@/components/screens/RoleWorkspaceScreen";
import { DashboardScreen } from "@/components/screens/DashboardScreen";
import { BriefingScreen } from "@/components/screens/BriefingScreen";
import { MentorScreen } from "@/components/screens/MentorScreen";
import { ChapterScreen } from "@/components/screens/ChapterScreen";
import { DecisionScreen } from "@/components/screens/DecisionScreen";
import { DebriefScreen } from "@/components/screens/DebriefScreen";
import { buildFlow, DECISION_ENABLED_CHAPTER_IDS, routeScreenForNode, type AppRouteScreen } from "@/lib/flow";
import { LocaleProvider, useLocale } from "@/lib/i18n";
import {
  getLocalizedChapter,
  type DecisionResult,
  type EvidenceItem,
  type IncidentStatus,
  type RoleId,
} from "@/lib/story";

const ROLE_IDS: RoleId[] = ["priya", "marcus", "aiko"];

function isRoleId(value: string | null): value is RoleId {
  return value !== null && ROLE_IDS.includes(value as RoleId);
}

function isAppRouteScreen(value: string | null): value is AppRouteScreen {
  return value !== null && ["role-select", "workspace", "dashboard", "briefing", "mentor", "chapter1", "chapter2", "chapter3", "debrief"].includes(value);
}

function routeIndex(roleId: RoleId, screen: AppRouteScreen): number {
  const flow = buildFlow(roleId);
  if (screen === "role-select") return 0;
  const index = screen === "chapter1" || screen === "chapter2" || screen === "chapter3"
    ? flow.findIndex((node) => node.type === "chapter" && node.chapterId === screen)
    : flow.findIndex((node) => node.type === screen);
  return index >= 0 ? index : 0;
}

function writeAppRoute(roleId: RoleId | null, screen: AppRouteScreen): void {
  const params = new URLSearchParams();
  if (roleId) params.set("role", roleId);
  params.set("screen", screen);
  window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
}

export default function Home() {
  return <LocaleProvider><HomeContent /></LocaleProvider>;
}

function HomeContent() {
  const { locale } = useLocale();
  const initialized = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DecisionResult>>({});
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [incidentStatus, setIncidentStatus] = useState<IncidentStatus>("monitoring");
  const flow = buildFlow(selectedRole ?? undefined);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const saved = sessionStorage.getItem("cyberstage-session");
      const params = new URLSearchParams(window.location.search);
      const start = params.get("start");
      const routeRole = isRoleId(params.get("role")) ? params.get("role") as RoleId : null;
      const routeScreen = isAppRouteScreen(params.get("screen")) ? params.get("screen") as AppRouteScreen : null;
      if (routeScreen || routeRole || start) {
        const selectedRouteRole = routeScreen === "role-select" || start === "roleSelect"
          ? null
          : routeRole ?? (isRoleId(start) ? start : "priya");
        const selectedRouteScreen = routeScreen
          ?? (start === "roleSelect" ? "role-select" : start === "dashboard" ? "dashboard" : start === "briefing" ? "briefing" : start === "debrief" ? "debrief" : start?.startsWith("chapter") && isAppRouteScreen(start) ? start : selectedRouteRole ? "workspace" : "role-select");
        const targetIndex = selectedRouteRole && selectedRouteScreen !== "role-select"
          ? routeIndex(selectedRouteRole, selectedRouteScreen)
          : 0;
        queueMicrotask(() => {
          setSelectedRole(selectedRouteRole);
          setIndex(targetIndex);
        });
      } else if (saved) {
        const parsed = JSON.parse(saved) as Partial<{ selectedRole: RoleId | null; index: number; answers: Record<string, DecisionResult>; evidence: EvidenceItem[]; incidentStatus: IncidentStatus }>;
        queueMicrotask(() => {
          if (parsed.selectedRole) setSelectedRole(parsed.selectedRole);
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.evidence) setEvidence(parsed.evidence);
          if (parsed.incidentStatus) setIncidentStatus(parsed.incidentStatus);
          if (typeof parsed.index === "number") setIndex(parsed.index);
        });
      }
    } catch {
      sessionStorage.removeItem("cyberstage-session");
    }
    queueMicrotask(() => setHydrated(true));
  }, [locale]);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem("cyberstage-session", JSON.stringify({ selectedRole, index, answers, evidence, incidentStatus }));
  }, [hydrated, selectedRole, index, answers, evidence, incidentStatus]);

  const goNext = () => setIndex((i) => Math.min(i + 1, flow.length - 1));
  const goHome = () => {
    sessionStorage.removeItem("cyberstage-session");
    setSelectedRole(null);
    setAnswers({});
    setEvidence([]);
    setIncidentStatus("monitoring");
    setIndex(0);
  };
  const goBack = () => {
    if (!selectedRole || node.type === "roleSelect") return;
    if (node.type === "roleWorkspace") {
      setSelectedRole(null);
      setAnswers({});
      setEvidence([]);
      setIncidentStatus("monitoring");
      setIndex(0);
      return;
    }
    setIndex((current) => Math.max(current - 1, 0));
  };
  const restart = () => {
    setSelectedRole(null);
    setAnswers({});
    setEvidence([]);
    setIncidentStatus("monitoring");
    setIndex(0);
  };

  const selectRole = (roleId: RoleId) => {
    setSelectedRole(roleId);
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
        { id: `${chapterId}-${prev.length + 1}`, chapterId, text, locale },
      ];
    });
  };

  function recordAnswerAndGoNext(chapterId: string, result: DecisionResult) {
    setAnswers((prev) => {
      const previousMissed = new Set(
        Object.values(prev).flatMap((answer) => answer.missedPoints ?? []),
      );
      const repeatedMistake = (result.missedPoints ?? []).some((pointId) => previousMissed.has(pointId));
      return {
        ...prev,
        [chapterId]: { ...result, repeatedMistake },
      };
    });
    setIncidentStatus(
      result.choiceId === "danger" ? "containment-risk" : "containment-progress",
    );
    goNext();
  }

  const node = flow[index] ?? flow[0];
  const isDecisionScreen = node.type === "chapter" && DECISION_ENABLED_CHAPTER_IDS.includes(node.chapterId);

  useEffect(() => {
    if (!hydrated) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [hydrated, index, selectedRole]);

  useEffect(() => {
    if (!hydrated) return;
    writeAppRoute(selectedRole, routeScreenForNode(node));
  }, [hydrated, index, selectedRole, node]);

  return (
    <div className={isDecisionScreen ? "flex min-h-[100dvh] flex-col overflow-x-hidden lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden" : "flex min-h-[100dvh] flex-col"}>
      <TopBar
        evidence={evidence}
        incidentStatus={incidentStatus}
        canGoBack={Boolean(selectedRole) && node.type !== "roleSelect"}
        onBack={goBack}
        onHome={goHome}
      />
      {node.type === "roleSelect" && <RoleSelectScreen onSelect={selectRole} />}
      {node.type === "roleWorkspace" && selectedRole && (
        <RoleWorkspaceScreen roleId={selectedRole} onNext={goNext} />
      )}
      {node.type === "dashboard" && <DashboardScreen onNext={goNext} />}
      {node.type === "briefing" && <BriefingScreen onNext={goNext} />}
      {node.type === "mentor" && (
        <MentorScreen mentorId={getLocalizedChapter(locale, node.chapterId)?.mentorId ?? ""} onNext={goNext} />
      )}
      {node.type === "chapter" &&
        (() => {
          const chapter = getLocalizedChapter(locale, node.chapterId);
          if (!chapter) return null;
          return DECISION_ENABLED_CHAPTER_IDS.includes(chapter.id) ? (
            <DecisionScreen
              chapter={chapter}
              priorEvidence={evidence}
              priorAnswers={Object.entries(answers).map(([chapterId, answer]) => ({
                chapterId,
                choiceId: answer.choiceId,
                reasonQuality: answer.reasonQuality,
              }))}
              incidentStatus={incidentStatus}
              onEvidence={(text) => recordEvidence(chapter.id, text)}
              onNext={(result) => recordAnswerAndGoNext(chapter.id, result)}
            />
          ) : (
            <ChapterScreen chapterId={node.chapterId} onNext={goNext} />
          );
        })()}
      {node.type === "debrief" && (
        <DebriefScreen
          answers={answers}
          evidence={evidence}
          selectedRole={selectedRole}
          onRestart={restart}
          onChooseRole={selectRole}
        />
      )}
    </div>
  );
}
