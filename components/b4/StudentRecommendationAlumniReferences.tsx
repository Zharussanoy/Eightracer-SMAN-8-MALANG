"use client";

import Link from "next/link";
import type { GeneralScholarship } from "@/lib/b4-general-scholarships";
import { displayTitle } from "@/lib/display-copy";
import { Avatar } from "./B4Shell";
import { useStudentScholarshipCatalog } from "./useStudentScholarshipCatalog";

export default function StudentRecommendationAlumniReferences({ scholarshipId }: { scholarshipId: number }) {
  const valid = Number.isSafeInteger(scholarshipId) && scholarshipId > 0;
  const catalog = useStudentScholarshipCatalog<{ data: GeneralScholarship }>(valid ? `/api/b4/student-scholarships/${scholarshipId}` : null);
  const program = catalog.data?.data;
  const matches = program?.id === scholarshipId;
  const recipients = matches ? program?.recipients : undefined;
  const failed = !valid || !!catalog.error || (!!program && (!matches || !recipients));

  return <section className="bc4-panel">
    <h2>Referensi dari Jejak Alumni</h2>
    {failed ? <div role="alert"><p>Referensi alumni belum dapat dimuat.</p>{valid && <button type="button" className="bc4-button" onClick={catalog.retry}>Coba Lagi</button>}</div>
      : !recipients ? <p role="status">Memuat referensi alumni…</p>
      : recipients.data.length ? <>
        <div className="bc4-recipientList">{recipients.data.map(alumni => <article className="bc4-yellowCard bc4-referenceAlumni" key={alumni.admissionId}>
          <div className="bc4-profile" style={{ padding: 0, border: 0 }}>
            <Avatar name={alumni.name} example={false} />
            <div><h3>{displayTitle(alumni.name)}</h3>
              <p>{displayTitle(alumni.university ?? "-")} · {displayTitle(alumni.program ?? "-")}</p>
              {alumni.cohort && <span className="bc4-tag">Angkatan {alumni.cohort}</span>}
              <span className="bc4-tag">{displayTitle(program!.name)}</span>
            </div>
          </div>
          <Link className="bc4-button" href={`/siswa/jejak-alumni/${alumni.admissionId}`}>Lihat Jejak Alumni</Link>
        </article>)}</div>
        {recipients.total > recipients.data.length && <p>Menampilkan {recipients.data.length} dari {recipients.total} penerima yang tersedia.</p>}
      </> : <p>Belum ada referensi alumni penerima beasiswa ini.</p>}
  </section>;
}
