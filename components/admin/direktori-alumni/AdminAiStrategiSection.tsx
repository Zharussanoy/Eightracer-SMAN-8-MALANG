"use client";

import AiStrategiJurusan from "../ai-strategi-jurusan/AiStrategiJurusan";
import type { AdminTab } from "./types";

interface AdminAiStrategiSectionProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

export default function AdminAiStrategiSection(props: AdminAiStrategiSectionProps) {
  void props;
  return <AiStrategiJurusan />;
}
