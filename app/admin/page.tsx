"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminB1Page from "@/components/admin/b-1/AdminB1Page";

function AdminLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect legacy/direct tab queries (e.g. /admin?tab=direktori) to /admin/alumni
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const queryString = searchParams.toString();
      router.replace(`/admin/alumni?${queryString}`);
    }
  }, [searchParams, router]);

  // Render B1 Admin Page for group B1 implementation
  return <AdminB1Page />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-[#5F089E] rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLandingContent />
    </Suspense>
  );
}
