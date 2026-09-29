"use client";

import { getRole, story, type RoleId } from "@/lib/story";
import Image from "next/image";

const roleOrder: RoleId[] = ["priya", "marcus", "aiko"];
const roleIcons: Record<RoleId, string> = {
  priya: "⌕",
  marcus: "▣",
  aiko: "◇",
};
const rolePortraits: Record<RoleId, string> = {
  priya: "/role-assets/maya.png",
  marcus: "/role-assets/alex.png",
  aiko: "/role-assets/maya.png",
};

export function RoleSelectScreen({ onSelect }: { onSelect: (roleId: RoleId) => void }) {
  return (
    <main
      className="relative flex flex-1 flex-col justify-center overflow-hidden bg-[#081321] px-5 py-12 text-zinc-100 sm:px-10"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(7,19,33,.97), rgba(7,19,33,.7)), linear-gradient(0deg, #071321 0%, transparent 65%), url('/role-assets/operations-room.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-9 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300">Choose your investigation path</p>
          <h1 className="mt-4 font-mono text-4xl font-semibold tracking-tight sm:text-6xl">
            Which part of <span className="text-teal-300">IR-247</span> will you own tonight?
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            {story.dashboard.incidentTitle} is one continuing incident. Choose a role to enter the same case through a different system, with different evidence to verify.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {roleOrder.map((roleId) => {
            const role = getRole(roleId);
            const mentor = story.mentors[role.mentorId];
            return (
              <button
                key={roleId}
                onClick={() => onSelect(roleId)}
                className="group flex min-h-[270px] flex-col items-start rounded-xl border border-slate-600 bg-slate-900/80 p-6 text-left shadow-2xl transition hover:-translate-y-1 hover:border-teal-300 hover:bg-slate-800"
              >
                <span className="relative block h-20 w-full overflow-hidden rounded-lg border border-slate-600 bg-slate-950/70">
                  <Image
                    src={rolePortraits[roleId]}
                    alt="Northlight response room"
                    fill
                    sizes="(min-width: 1024px) 30vw, 90vw"
                    className="object-cover object-top opacity-70 transition duration-300 group-hover:scale-105 group-hover:opacity-90"
                  />
                  <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-lg border border-teal-300/70 bg-[#081321]/80 text-2xl text-teal-200">
                    {roleIcons[roleId]}
                  </span>
                  <span className="absolute bottom-2 right-3 text-[9px] font-bold uppercase tracking-[0.16em] text-teal-200">remote channel</span>
                </span>
                <span className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">
                  {role.type}
                </span>
                <strong className="mt-2 font-mono text-2xl font-semibold text-white">{role.label}</strong>
                <span className="mt-3 text-sm leading-6 text-slate-300">{role.description}</span>
                <span className="mt-4 text-[11px] uppercase tracking-[0.12em] text-slate-400">Focus · {role.focus}</span>
                <span className="mt-auto pt-6 text-xs text-slate-400">
                  {mentor.name} · {role.route}
                  <span className="ml-2 text-teal-300 transition group-hover:ml-3">→</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.14em] text-slate-400">
          <span>ONE INCIDENT</span>
          <span>THREE ENTRY POINTS</span>
          <span>NO COUNTDOWN</span>
        </div>
      </div>
    </main>
  );
}
