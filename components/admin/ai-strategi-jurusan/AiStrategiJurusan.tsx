"use client";

import { useState, useEffect } from "react";
import type { TabAiStrategi, Kampus } from "./types";
import { fetchKampusList } from "./services/aiStrategiService";
import AiStrategiHeader from "./AiStrategiHeader";
import OverviewTab from "./OverviewTab";
import SimulatorTab from "./SimulatorTab";

export default function AiStrategiJurusan() {
  const [activeTab, setActiveTab] = useState<TabAiStrategi>("Overview");
  const [kampusList, setKampusList] = useState<Kampus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadKampus() {
      setIsLoading(true);
      try {
        const data = await fetchKampusList();
        setKampusList(data);
      } catch {
        // Silently handled in OverviewTab
      } finally {
        setIsLoading(false);
      }
    }
    void loadKampus();
  }, []);

  return (
    <section className="space-y-6 animate-in fade-in duration-300" aria-label="AI Strategi Jurusan">
      <AiStrategiHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab panel container */}
      <div
        role="tabpanel"
        id={`panel-${activeTab.toLowerCase()}`}
        aria-labelledby={`tab-${activeTab.toLowerCase()}`}
        className="focus-visible:outline-none"
      >
        {activeTab === "Overview" && (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
              </div>
            ) : (
              <OverviewTab kampusList={kampusList} />
            )}
          </>
        )}
        {activeTab === "Simulator" && <SimulatorTab />}
      </div>
    </section>
  );
}

