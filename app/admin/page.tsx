"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminB1Page from "@/components/admin/b-1/AdminB1Page";

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

  // Render B1 Admin Page for group B1 implementation
  return <AdminB1Page />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminLandingWrapper />
    </Suspense>
  );
}
