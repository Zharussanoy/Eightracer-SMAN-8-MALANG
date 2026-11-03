"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import ScholarshipCatalog from "./ScholarshipCatalog";
import ScholarshipCatalogApi from "./ScholarshipCatalogApi";
import ScholarshipSchoolHistory from "./ScholarshipSchoolHistory";
import "./ScholarshipSchoolHistory.css";

export default function ScholarshipDatabaseConnected() {
  const { authStatus } = useUser();
  const [view, setView] = useState<"school" | "catalog">("school");
  if (authStatus !== "authenticated") return <ScholarshipCatalog />;
  const navigation = <div className="b4-schoolViews" role="group" aria-label="Jenis data beasiswa">
    <button type="button" aria-pressed={view === "school"} onClick={() => setView("school")}>Riwayat Sekolah</button>
    <button type="button" aria-pressed={view === "catalog"} onClick={() => setView("catalog")}>Katalog Program</button>
  </div>;
  return view === "school" ? <ScholarshipSchoolHistory navigation={navigation} /> : <ScholarshipCatalogApi navigation={navigation} />;
}
