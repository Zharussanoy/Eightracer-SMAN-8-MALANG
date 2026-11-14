"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import ScholarshipChatApi from "./ScholarshipChatApi";
import { Bot, GraduationCap, Send } from "lucide-react";
import B4Shell from "./B4Shell";
import { publishedFor, STUDENTS, useDemoData } from "./demoStore";
import ChatMessageText from "./ChatMessageText";
import { displayTitle } from "@/lib/display-copy";

type Message = { role: "user" | "bot"; text: string; recommendationId?: string };
const suggestions = ["Beasiswa apa yang cocok buat aku?", "Kenapa beasiswa ini direkomendasikan?", "Apa saja persyaratannya?", "Apa yang perlu aku persiapkan?"];
function ScholarshipChatDemo({ recommendationId }: { recommendationId?: string }) {
  const data = useDemoData();
  return <Chat key={`${data.viewerId}-${recommendationId}`} recommendationId={recommendationId} />;
}
function Chat({ recommendationId }: { recommendationId?: string }) {
  const data = useDemoData();
  const viewer = STUDENTS.find((student) => student.id === data.viewerId)!;
  const recommendations = publishedFor(data, data.viewerId);
  const selected = recommendations.find((item) => item.id === recommendationId) ?? recommendations[0];
  const catalog = data.catalog.find((item) => item.id === selected?.scholarshipId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { if (messages.length) end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages]);
  function send(question: string) {
    if (!question.trim()) return;
    const normalized = question.toLowerCase();
    let text: string;
    let linkedId: string | undefined;
    if (!selected || !catalog) text = "Belum ada rekomendasi yang dipublikasikan untuk profilmu. Kamu dapat menunggu peninjauan Admin/BK atau mempelajari Jejak Alumni terlebih dahulu.";
    else if (/syarat|kriteria|persiap/.test(normalized)) text = `Yuk, kita lihat informasinya! 🎓\n\n**Persyaratan ${catalog.name}:**\n${catalog.criteria.map(value => "- " + value).join("\n")}\n\n**Langkah Berikutnya:**\n- Siapkan dokumen pendukung.\n- Periksa ketentuan resmi penyelenggara.\n\n**Periode Pendaftaran:**\n${catalog.applyPeriod}`;
    else if (/kenapa|alasan|cocok|rekomendasi|beasiswa/.test(normalized)) { text = `Berdasarkan rekomendasi yang dipublikasikan sekolah: ${selected.reason} Waktu yang disarankan: ${selected.timing}.`; linkedId = selected.id; }
    else text = "Percakapan ini masih demo dengan jawaban contoh. Coba pilih pertanyaan tentang rekomendasi, alasan kecocokan, persyaratan, atau persiapan pendaftaran.";
    setMessages((current) => [...current, { role: "user", text: question.trim() }, { role: "bot", text, recommendationId: linkedId }]);
    setInput("");
  }
  return <B4Shell student showDemoProfile={false} title="AI Rekomendasi Beasiswa" description="Pelajari informasi dan alasan kecocokan beasiswa yang direkomendasikan untukmu."><section className="bc4-chat"><header className="bc4-chatHeader"><Bot size={36} /><div><h2>Eightracer AI</h2><p>Asisten Informasi Beasiswa · Demo percakapan</p></div></header><div className="bc4-chatMessages" aria-live="polite"><div className="bc4-chatLine"><span className="bc4-botAvatar"><Bot size={30} /></span><div className="bc4-bubble"><p><strong>Hai {displayTitle(viewer.name.trim().split(/\s+/)[0]||"teman")}! 👋🏻</strong></p><p>Aku siap membantumu mencari pilihan beasiswa, memahami persyaratannya, dan menyiapkan langkah berikutnya. Yuk, kita pelajari bersama! 🎓</p><p>Mode demo ini menggunakan jawaban contoh, belum terhubung ke layanan AI.</p>{catalog && recommendationId && <p>Konteks percakapan: <strong>{displayTitle(catalog.name)}</strong></p>}{!messages.length && <><h3>Mulai dengan Salah Satu Pertanyaan Berikut:</h3><div className="bc4-chatSuggestions">{suggestions.map((question) => <button key={question} onClick={() => send(question)}>{question}</button>)}</div></>}</div></div>{messages.map((message, index) => {
    const linked = recommendations.find((item) => item.id === message.recommendationId);
    const master = data.catalog.find((item) => item.id === linked?.scholarshipId);
    return <div key={index} className={`bc4-chatLine ${message.role === "user" ? "bc4-chatUser" : ""}`}>{message.role === "bot" && <span className="bc4-botAvatar"><Bot size={30} /></span>}<div className="bc4-bubble">{message.role==="bot"?<ChatMessageText text={message.text}/>:<p>{message.text}</p>}{linked && master && <div className="bc4-chatScholar"><h3><GraduationCap size={25} />{displayTitle(master.name)}</h3><p>{displayTitle(master.provider)}</p><strong>Skor contoh: {linked.score}/100</strong><Link className="bc4-button" href={`/siswa/rekomendasi-beasiswa/${linked.id}`}>Lihat Detail</Link></div>}</div></div>;
  })}<div ref={end} /></div><form className="bc4-chatInput" onSubmit={(event) => { event.preventDefault(); send(input); }}><label className="b4-srOnly" htmlFor="b4-chat-question">Pertanyaan Tentang Beasiswa</label><input id="b4-chat-question" placeholder="Tulis pertanyaanmu tentang beasiswa…" value={input} maxLength={1000} onChange={(event) => setInput(event.target.value)} /><button type="submit" disabled={!input.trim()} aria-label="Kirim pertanyaan"><Send size={30} /></button><small>Jawaban demo berdasarkan informasi contoh yang tersedia.</small></form></section></B4Shell>;
}

export default function ScholarshipChatPage({recommendationId}:{recommendationId?:string}){
 const {authStatus,currentUser,authMessage}=useUser();
 if(authStatus==="authenticated")return <ScholarshipChatApi key={currentUser.id+":"+recommendationId} recommendationId={recommendationId}/>;
 if(authStatus==="anonymous")return <ScholarshipChatDemo recommendationId={recommendationId}/>;
 return <B4Shell student showDemoProfile={false} title="AI Rekomendasi Beasiswa" description="Informasi beasiswa dari sekolah." dataNote=""><p role="status">{authStatus==="loading"?"Memeriksa sesi akun…":authMessage}</p></B4Shell>;
}
