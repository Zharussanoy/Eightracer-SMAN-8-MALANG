"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingContent from "@/components/shared/LandingContent";

function AdminLandingWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect query tab jika ada (misal: /admin?tab=direktori) ke /admin/direktori-alumni
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const queryString = searchParams.toString();
      router.replace(`/admin/direktori-alumni?${queryString}`);
    }
  }, [searchParams, router]);

  // Tampilkan landing page utama terlebih dahulu
  return <LandingContent />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminLandingWrapper />
    </Suspense>
  );
}
