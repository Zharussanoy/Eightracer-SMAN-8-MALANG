"use client";

import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {Bot,GraduationCap,Send} from "lucide-react";
import {useUser} from "@/context/UserContext";
import {recommendationRequest,type ScholarshipChatReply} from "@/lib/b4-recommendation-data";
import B4Shell from "./B4Shell";
import {useStudentRecommendations} from "./useStudentRecommendations";
import { displayTitle } from "@/lib/display-copy";

type Message={role:"user"|"bot";text:string;recommendationId?:string};
const suggestions=["Beasiswa apa yang cocok buat aku?","Kenapa beasiswa ini direkomendasikan?","Apa saja persyaratannya?","Apa yang perlu aku persiapkan?"];
export default function ScholarshipChatApi({recommendationId}:{recommendationId?:string}){
 const {currentUser}=useUser();
 const selected=recommendationId&&/^[1-9]\d*$/.test(recommendationId)&&Number.isSafeInteger(Number(recommendationId))?Number(recommendationId):undefined;
 const [messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(""),[busy,setBusy]=useState(false);
 const {result}=useStudentRecommendations(),recommendations=result?.data??[];
 const [cooldown,setCooldown]=useState(0);
 useEffect(()=>{if(cooldown<=0)return;const timer=setTimeout(()=>setCooldown(value=>Math.max(0,value-1)),1000);return()=>clearTimeout(timer);},[cooldown]);
 const [mode,setMode]=useState<string|null>(null),lock=useRef(false),end=useRef<HTMLDivElement>(null);
 const conversation=useRef<{userId:string;scholarshipId:number|undefined}>({userId:String(currentUser.id),scholarshipId:selected});
 useEffect(()=>{if(messages.length)end.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[messages,busy]);
 const context=recommendations.find(item=>item.scholarshipId===selected);
 async function send(question:string){
  if(lock.current||cooldown>0||!question.trim()||currentUser.role!=="siswa")return;
  lock.current=true;setBusy(true);setInput("");setMessages(v=>[...v,{role:"user",text:question.trim()}]);
  try{
   const overview=/beasiswa\s+apa|apa\s+.*beasiswa|(?:aku|saya)\s+cocok|yang\s+cocok|rekomendasikan\s+beasiswa|rekomendasi\s+beasiswa\s+untuk/iu.test(question);
   const remembered=conversation.current.userId===String(currentUser.id)?conversation.current.scholarshipId:undefined;
   const programId=overview?undefined:(remembered??selected);
   const reply=await recommendationRequest<ScholarshipChatReply>("/api/b4/recommendations/chat",{method:"POST",body:{message:question.trim(),...(programId?{beasiswa_id:programId}:{})}});
   conversation.current={userId:String(currentUser.id),scholarshipId:reply.scholarshipId??undefined};
   const choices=reply.suggestions.length?" Program tersedia: "+reply.suggestions.map(v=>v.name).join(", ")+". Ketik nama program yang ingin diperiksa.":"";
   const linked=recommendations.find(item=>item.scholarshipId===reply.scholarshipId);
   setMessages(v=>[...v,{role:"bot",text:reply.answer+choices,recommendationId:linked?.key}]);
   setMode(reply.llmUsed?"Jawaban berdasarkan informasi program dan data siswa yang tersedia.":"Jawaban faktual berdasarkan data dan aturan yang tersedia.");
  }catch(error){
   if(error&&typeof error==="object"&&"status" in error&&error.status===429){
    const seconds="retryAfter" in error&&typeof error.retryAfter==="number"?error.retryAfter:60;
    setCooldown(Math.max(1,Math.min(300,Math.ceil(seconds))));setInput(question.trim());
   }
   setMessages(v=>[...v,{role:"bot",text:error instanceof Error?error.message:"Jawaban belum dapat dimuat. Coba lagi."}]);
  }
  finally{lock.current=false;setBusy(false);}
 }
 return <B4Shell student showDemoProfile={false} title="AI Rekomendasi Beasiswa" description="Pelajari informasi dan alasan kecocokan beasiswa yang direkomendasikan untukmu." dataNote="">
  <section className="bc4-chat"><header className="bc4-chatHeader"><Bot size={36}/><div><h2>Eightracer AI</h2><p>Asisten Informasi Beasiswa</p></div></header>
   <div className="bc4-chatMessages" aria-live="polite"><div className="bc4-chatLine"><span className="bc4-botAvatar"><Bot size={30}/></span><div className="bc4-bubble"><p>Hai, {currentUser.name.split(" ")[0]}! Aku siap membantumu mempelajari informasi rekomendasi beasiswa dari sekolah.</p><p>Data yang belum tercatat akan dijelaskan sebagai belum diketahui. Hasil ini bukan keputusan penerimaan beasiswa.</p>{context&&recommendationId&&<p>Konteks percakapan: <strong>{displayTitle(context.name)}</strong></p>}{!messages.length&&<><h3>Mulai dengan Salah Satu Pertanyaan Berikut:</h3><div className="bc4-chatSuggestions">{suggestions.map(question=><button key={question} disabled={busy||cooldown>0||currentUser.role!=="siswa"} onClick={()=>void send(question)}>{question}</button>)}</div></>}</div></div>
    {messages.map((message,index)=>{
     const linked=recommendations.find(item=>item.key===message.recommendationId);
     return <div key={index} className={"bc4-chatLine "+(message.role==="user"?"bc4-chatUser":"")}>{message.role==="bot"&&<span className="bc4-botAvatar"><Bot size={30}/></span>}<div className="bc4-bubble"><p>{message.text}</p>{linked&&<div className="bc4-chatScholar"><h3><GraduationCap size={25}/>{displayTitle(linked.name)}</h3><p>{displayTitle(linked.provider??"-")}</p><strong>Skor kecocokan: {linked.complete&&linked.score!==null?linked.score+"/100":"-"}</strong><Link className="bc4-button" href={"/siswa/rekomendasi-beasiswa/"+linked.key}>Lihat Detail</Link></div>}</div></div>;
    })}
    {busy&&<div className="bc4-chatLine"><span className="bc4-botAvatar"><Bot size={30}/></span><div className="bc4-bubble"><p role="status">Memeriksa informasi beasiswa…</p></div></div>}<div ref={end}/>
   </div>
   <form className="bc4-chatInput" onSubmit={e=>{e.preventDefault();void send(input);}}><label className="b4-srOnly" htmlFor="b4-chat-question">Pertanyaan Tentang Beasiswa</label><input id="b4-chat-question" placeholder="Tulis pertanyaanmu tentang beasiswa…" value={input} maxLength={1000} disabled={busy||currentUser.role!=="siswa"} onChange={e=>setInput(e.target.value)}/><button type="submit" disabled={busy||cooldown>0||input.trim().length<3||currentUser.role!=="siswa"} aria-label={cooldown>0?"Tunggu "+cooldown+" detik":"Kirim pertanyaan"}><Send size={30}/></button><small>{cooldown>0?"Tunggu "+cooldown+" detik. Pertanyaanmu tetap tersimpan.":mode??"Jawaban berdasarkan informasi yang tersedia."}</small></form>
  </section>
 </B4Shell>;
}
