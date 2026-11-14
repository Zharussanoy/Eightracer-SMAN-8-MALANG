"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import type { ScholarshipChatAnswer } from "@/lib/b4-chat";
import FigmaIcon from "./FigmaIcon";
import B4Shell from "./B4Shell";

type Message = { role: "user"; text: string } | { role: "bot"; result: ScholarshipChatAnswer };
const suggestions = ["Beasiswa apa yang cocok buat aku?", "Apa saja persyaratannya?", "Apa yang perlu aku persiapkan?"];
type Props = { scholarshipId?: number; targetLevel?: "SMA" | "Kuliah"; invalidContext?: boolean };
export default function ScholarshipChatPage(props: Props) {
  const { currentUser, authStatus } = useUser();
  return <Chat key={`${currentUser.id}:${authStatus}:${props.scholarshipId}:${props.targetLevel}`} {...props} />;
}
function Chat({ scholarshipId, targetLevel, invalidContext }: Props) {
  const { currentUser, authStatus, authMessage, refreshSession } = useUser();
  const allowed = authStatus === "authenticated" && currentUser.role === "siswa" && !invalidContext;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [failed, setFailed] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const submitting = useRef(false), abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  useEffect(() => { if (messages.length) end.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest" }); }, [messages, busy]);
  async function send(question: string, retry = false) {
    const message = question.trim();
    if (!allowed || submitting.current || cooldown || !message || question.length > 1000) return;
    submitting.current = true; setBusy(true); setError(""); setFailed(null);
    if (!retry) setMessages(current => [...current, { role: "user", text: message }]);
    setInput("");
    const controller = new AbortController(); abort.current = controller;
    try {
      const response = await fetch("/api/b4/chat", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ message, ...(scholarshipId !== undefined ? { beasiswa_id: scholarshipId } : {}), ...(targetLevel ? { target_jenjang: targetLevel } : {}) }), signal: controller.signal });
      const payload = await response.json().catch(() => null);
      if (controller.signal.aborted) return;
      if (!response.ok) {
        if (response.status === 401) void refreshSession();
        if (response.status === 429) setCooldown(60);
        throw new Error(payload?.message ?? "Jawaban belum dapat diterima. Coba lagi nanti.");
      }
      if (!payload || typeof payload.answer !== "string" || !payload.answer.trim()) throw new Error("Respons jawaban belum sesuai. Jawaban tidak ditampilkan.");
      setMessages(current => [...current, { role: "bot", result: payload }]);
    } catch (cause) {
      if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : "Layanan chat belum dapat dihubungi."); setFailed(message); }
    } finally { if (!controller.signal.aborted) { submitting.current = false; setBusy(false); } }
  }
  const unavailable = invalidContext ? "Konteks beasiswa pada tautan tidak valid. Kembali ke daftar dan pilih beasiswa lagi." : authStatus === "loading" ? "Memeriksa sesi akun…" : authStatus === "unavailable" ? authMessage || "Sesi belum dapat diperiksa." : !allowed ? "Masuk dengan akun siswa untuk bertanya tentang beasiswa." : null;
  return <B4Shell student showDemoProfile={false} dataNote="" title="AI Rekomendasi Beasiswa" description="Tanyakan informasi dan persiapan beasiswa berdasarkan data yang tersedia.">
    <Link className="bc4-button bc4-backRecommendations" href="/siswa/rekomendasi-beasiswa">Kembali ke rekomendasi</Link>
    {unavailable ? <div className="bc4-empty"><p role={authStatus === "loading" ? "status" : "alert"}>{unavailable}</p>{authStatus === "anonymous" && <Link className="bc4-button bc4-primary" href="/login">Masuk sebagai siswa</Link>}{authStatus === "unavailable" && <button type="button" className="bc4-button" onClick={() => void refreshSession()}>Periksa sesi lagi</button>}</div> : <section className="bc4-chat">
      <header className="bc4-chatHeader"><FigmaIcon name="bot" size={30} /><div><h2>Eightracer AI</h2><p>Asisten Informasi Beasiswa</p></div></header>
      <div className="bc4-chatMessages" role="log" aria-label="Percakapan beasiswa" aria-live="polite" aria-busy={busy}>
        <div className="bc4-chatLine"><span className="bc4-botAvatar"><FigmaIcon name="botAvatar" size={30} /></span><div className="bc4-bubble"><p>Hai! 👋 Tulis pertanyaanmu untuk mempelajari informasi beasiswa dari sekolah.</p>{scholarshipId !== undefined && <p>Pertanyaan difokuskan pada beasiswa yang kamu pilih.</p>}<p>Setiap pertanyaan diproses secara terpisah. Sertakan konteks penting dalam pertanyaanmu; hindari mengirim password atau data pribadi.</p>{!messages.length && <><h3>Mulai dengan pertanyaan berikut:</h3><div className="bc4-chatSuggestions">{suggestions.map(question => <button type="button" disabled={busy || cooldown > 0} key={question} onClick={() => void send(question)}>{question}</button>)}</div></>}</div></div>
        {messages.map((message, index) => <div key={index} className={`bc4-chatLine ${message.role === "user" ? "bc4-chatUser" : ""}`}>{message.role === "bot" && <span className="bc4-botAvatar"><FigmaIcon name="botAvatar" size={30} /></span>}<div className="bc4-bubble">{message.role === "user" ? <p>{message.text}</p> : <Answer result={message.result} />}</div></div>)}
        {busy && <p role="status">Memproses pertanyaan…</p>}<div ref={end} />
      </div>
      {error && <div className="bc4-chatError"><p role="alert">{error}</p>{failed && <button type="button" className="bc4-button" disabled={busy || cooldown > 0} onClick={() => void send(failed, true)}>{cooldown ? `Coba lagi dalam ${cooldown} detik` : "Kirim ulang pertanyaan"}</button>}</div>}
      <form className="bc4-chatInput" onSubmit={event => { event.preventDefault(); void send(input); }}><label className="b4-srOnly" htmlFor="b4-chat-question">Pertanyaan tentang beasiswa</label><input id="b4-chat-question" placeholder="Tulis pertanyaanmu tentang beasiswa…" value={input} maxLength={1000} disabled={busy || cooldown > 0} onChange={event => setInput(event.target.value)} /><button type="submit" disabled={busy || cooldown > 0 || !input.trim()} aria-label="Kirim pertanyaan"><FigmaIcon name="send" size={24} /></button><small>Jawaban membantu persiapan dan tidak menggantikan persetujuan Admin/BK. Percakapan tidak disimpan saat halaman ditutup.</small></form>
    </section>}
  </B4Shell>;
}
function Answer({ result }: { result: ScholarshipChatAnswer }) {
  return <><p className="bc4-chatAnswerLabel">{result.llmUsed === true ? "Jawaban berbantuan AI" : result.llmUsed === false ? "Jawaban faktual dari data yang tersedia · tanpa AI generatif" : "Jawaban layanan beasiswa"}</p><p className="bc4-chatAnswerText">{result.answer}</p>
    {result.eligibility && <div className="bc4-chatScholar"><h3>Evaluasi Kriteria</h3><p>Skor kecocokan: {result.eligibility.score === null ? "Belum tersedia" : `${result.eligibility.score}/100`}</p><p>{result.eligibility.complete !== true || result.eligibility.meets === null ? "Data belum cukup untuk penilaian lengkap." : result.eligibility.meets ? "Memenuhi kriteria pada data yang tersedia." : "Belum memenuhi kriteria pada data yang tersedia."}</p>{result.eligibility.checklist.length > 0 && <><h4>Persyaratan dan status</h4><ul>{result.eligibility.checklist.map((item, index) => <li key={index}><strong>{item.criterion}</strong>{item.required !== null && `: ${item.required}`} — {item.status?.replaceAll("_", " ") ?? "Belum dinilai"}</li>)}</ul></>}<p>Skor ini bukan persentase peluang lolos.</p></div>}
    {result.context && <p>Konteks: {result.context}</p>}{result.sources.length > 0 && <div className="bc4-chatSources"><h4>Sumber informasi</h4><ul>{result.sources.map((source, index) => <li key={index}>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a> : source.label}</li>)}</ul></div>}</>;
}
