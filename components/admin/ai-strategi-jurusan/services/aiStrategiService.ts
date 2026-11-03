import type { Kampus, OverviewInsight, SiswaProfil, TargetKampus, HasilSimulasi } from "../types";
import { MOCK_KAMPUS, MOCK_OVERVIEW, MOCK_SISWA, MOCK_TARGET_KAMPUS, MOCK_HASIL_SIMULASI } from "../data/mock";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchKampusList(): Promise<Kampus[]> {
  await delay(300);
  return MOCK_KAMPUS;
}

export async function fetchOverviewInsight(
  kampusId: string,
  prodiId: string
): Promise<OverviewInsight | null> {
  await delay(800);
  return (
    MOCK_OVERVIEW.find(
      (item) => item.kampusId === kampusId && item.prodiId === prodiId
    ) ?? null
  );
}

export async function fetchSiswaProfil(): Promise<SiswaProfil[]> {
  await delay(300);
  return MOCK_SISWA;
}

export async function fetchTargetKampus(): Promise<TargetKampus[]> {
  await delay(300);
  return MOCK_TARGET_KAMPUS;
}

export async function fetchHasilSimulasi(
  siswaId: string,
  targetKampusId: string
): Promise<HasilSimulasi | null> {
  await delay(800);
  const key = `${siswaId}-${targetKampusId}`;
  return MOCK_HASIL_SIMULASI[key] ?? null;
}
