"use client";

import {useEffect,useRef,useState} from "react";
import {Bot,Send} from "lucide-react";
import {useUser} from "@/context/UserContext";
import {recommendationRequest,type ScholarshipChatReply} from "@/lib/b4-recommendation-data";
import B4Shell from "./B4Shell";
type Message={role:"user"|"bot";text:string};
const suggestions=["Beasiswa apa yang cocok buat aku?","Kenapa beasiswa ini direkomendasikan?","Apa saja persyaratannya?","Apa yang perlu aku persiapkan?"];
export default function ScholarshipChatApi({recommendationId}:{recommendationId?:string}){
 const {currentUser}=useUser();
 const selected=recommendationId&&/^[1-9]\d*$/.test(recommendationId)&&Number.isSafeInteger(Number(recommendationId))?Number(recommendationId):undefined;
 const [messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(""),[busy,setBusy]=useState(false);
 const [mode,setMode]=useState<string|null>(null),lock=useRef(false),end=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(messages.length)end.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[messages,busy]);
 async function send(question:string){
  if(lock.current||!question.trim()||currentUser.role!=="siswa")return;
  lock.current=true;setBusy(true);setInput("");setMessages(v=>[...v,{role:"user",text:question.trim()}]);
  try{
   const reply=await recommendationRequest<ScholarshipChatReply>("/api/b4/recommendations/chat",{method:"POST",body:{message:question.trim(),...(selected?{beasiswa_id:selected}:{})}});
   const choices=reply.suggestions.length?" Program tersedia: "+reply.suggestions.map(v=>v.name).join(", ")+". Ketik nama program yang ingin diperiksa.":"";
   setMessages(v=>[...v,{role:"bot",text:reply.answer+choices}]);setMode(reply.llmUsed?"Gemini membantu memilih informasi relevan; hasil kriteria tetap dihitung backend.":"Jawaban faktual berdasarkan data dan aturan yang tersedia di backend.");
  }catch(error){setMessages(v=>[...v,{role:"bot",text:error instanceof Error?error.message:"Jawaban belum dapat dimuat. Coba lagi."}]);}
  finally{lock.current=false;setBusy(false);}
 }
 return <B4Shell student showDemoProfile={false} title="AI Rekomendasi Beasiswa" description="Pelajari informasi dan alasan kecocokan beasiswa yang direkomendasikan untukmu." dataNote="">
  <section className="bc4-chat"><header className="bc4-chatHeader"><Bot size={36}/><div><h2>Eightracer AI</h2><p>Asisten Informasi Beasiswa</p></div></header>
   <div className="bc4-chatMessages" aria-live="polite"><div className="bc4-chatLine"><span className="bc4-botAvatar"><Bot size={30}/></span><div className="bc4-bubble"><p>Hai, {currentUser.name.split(" ")[0]}! Aku siap membantumu mempelajari beasiswa berdasarkan katalog dan data milikmu.</p><p>Data yang belum tercatat akan dijelaskan sebagai belum diketahui. Hasil ini bukan keputusan penerimaan beasiswa.</p>{!messages.length&&<><h3>Mulai dengan salah satu pertanyaan berikut:</h3><div className="bc4-chatSuggestions">{suggestions.map(question=><button key={question} disabled={busy||currentUser.role!=="siswa"} onClick={()=>void send(question)}>{question}</button>)}</div></>}</div></div>
    {messages.map((message,index)=><div key={index} className={"bc4-chatLine "+(message.role==="user"?"bc4-chatUser":"")}>{message.role==="bot"&&<span className="bc4-botAvatar"><Bot size={30}/></span>}<div className="bc4-bubble"><p>{message.text}</p></div></div>)}
    {busy&&<div className="bc4-chatLine"><span className="bc4-botAvatar"><Bot size={30}/></span><div className="bc4-bubble"><p role="status">Memeriksa informasi beasiswa…</p></div></div>}<div ref={end}/>
   </div>
   <form className="bc4-chatInput" onSubmit={e=>{e.preventDefault();void send(input);}}><label className="b4-srOnly" htmlFor="b4-chat-question">Pertanyaan tentang beasiswa</label><input id="b4-chat-question" placeholder="Tulis pertanyaanmu tentang beasiswa…" value={input} maxLength={1000} disabled={busy||currentUser.role!=="siswa"} onChange={e=>setInput(e.target.value)}/><button type="submit" disabled={busy||input.trim().length<3||currentUser.role!=="siswa"} aria-label="Kirim pertanyaan"><Send size={30}/></button><small>{mode??"Jawaban mengikuti data sekolah dan kriteria program yang tersedia."}</small></form>
  </section>
 </B4Shell>;
}
