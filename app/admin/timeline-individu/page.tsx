import type { Metadata } from "next";
import TimelineIndividualPage from "@/components/b4/AdminTimelinePage";

export const metadata: Metadata = {
  title: "Timeline Individu | Eightracer",
  description: "Lihat perjalanan pendidikan dan perkembangan kuliah alumni.",
};

export default function Page() {
  return <TimelineIndividualPage />;
}
