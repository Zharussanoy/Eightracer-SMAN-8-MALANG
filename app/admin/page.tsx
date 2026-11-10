"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingContent from "@/components/shared/LandingContent";

function AdminLandingWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect jika ada parameter tab (misal: /admin?tab=direktori) ke /alumni
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const queryString = searchParams.toString();
      router.replace(`/alumni?${queryString}`);
    }
  }, [searchParams, router]);

  // Tampilkan landing page utama
  return <LandingContent />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminLandingWrapper />
    </Suspense>
  );
}
