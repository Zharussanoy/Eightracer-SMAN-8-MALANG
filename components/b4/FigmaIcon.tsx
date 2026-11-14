import Image from "next/image";

const assets = {
  sparkle: "5a516.svg", search: "f6e43.svg", caret: "39fb5.svg",
  account: "4d0db.svg", previous: "59d19.svg", next: "f9a6b.svg",
  school: "96e41.svg", graduate: "76309.svg", university: "ff7f3.svg",
  bot: "0a933.svg", botAvatar: "8f122.svg", send: "647ce.svg",
  scholarship: "5cb6c.svg", shield: "a94e6.svg", discover: "cb9d4.svg",
  breadcrumb: "breadcrumb-caret.svg", accountCaret: "account-caret.svg",
} as const;

/** Original exported artwork; dimensions belong to the slot, not the SVG paths. */
export default function FigmaIcon({ name, size = 24, className }: { name: keyof typeof assets; size?: number; className?: string }) {
  return <Image src={`/images/b4/figma/${assets[name]}`} alt="" width={size} height={size} className={className} style={{ objectFit: "contain" }} unoptimized aria-hidden="true" />;
}
