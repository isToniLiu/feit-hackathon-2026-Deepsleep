import Image from "next/image";
import type { RoleId } from "@/lib/story";

const portraitSrc: Record<RoleId, string> = {
  priya: "/portraits/priya-hd.png",
  marcus: "/portraits/marcus-hd.png",
  aiko: "/portraits/aiko-hd.png",
};

/** Approved high-resolution line portraits used on role cards and workspaces. */
export function RoleLinePortrait({ roleId }: { roleId: RoleId }) {
  return (
    <span className="block h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem]" aria-hidden="true">
      <Image
        src={portraitSrc[roleId]}
        alt=""
        width={1280}
        height={1280}
        priority
        className="h-full w-full object-contain"
      />
    </span>
  );
}
