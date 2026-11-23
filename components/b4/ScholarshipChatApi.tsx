"use client";

import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import FigmaIcon from "./FigmaIcon";
import {useUser} from "@/context/UserContext";
import {recommendationRequest,type ScholarshipChatReply,type StudentRecommendation} from "@/lib/b4-recommendation-data";
import B4Shell from "./B4Shell";
import {useStudentRecommendations} from "./useStudentRecommendations";
import ChatMessageText from "./ChatMessageText";
import type {GeneralScholarship} from "@/lib/b4-general-scholarships";
import {useStudentScholarshipCatalog} from "./useStudentScholarshipCatalog";
import {isRecommendationRequest} from "@/lib/b4-recommendation-copy";
import { displayTitle } from "@/lib/display-copy";

type Message={role:"user"|"bot";text:string;recommendationId?:string};
const suggestions=["Beasiswa apa yang cocok buat aku?","Bagaimana cara memilih beasiswa?","Apa saja persyaratannya?","Apa yang perlu aku persiapkan?"];
export default function ScholarshipChatApi({recommendationId,targetLevel}:{recommendationId?:string;targetLevel?:string}){
 const {currentUser}=useUser();
 const selected=recommendationId&&/^[1-9]\d*$/.test(recommendationId)&&Number.isSafeInteger(Number(recommendationId))?Number(recommendationId):undefined;
 const [messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(""),[busy,setBusy]=useState(false);
 const {result}=useStudentRecommendations();
 const [calculated,setCalculated]=useState<StudentRecommendation[]|null>(null);
 const recommendations=calculated??result?.data??[];
 const [cooldown,setCooldown]=useState(0);
 useEffect(()=>{if(cooldown<=0)return;const timer=setTimeout(()=>setCooldown(value=>Math.max(0,value-1)),1000);return()=>clearTimeout(timer);},[cooldown]);
 const [mode,setMode]=useState<string|null>(null),lock=useRef(false),end=useRef<HTMLDivElement>(null);
 const conversation=useRef<{userId:string;scholarshipId:number|undefined}>({userId:String(currentUser.id),scholarshipId:selected});
 useEffect(()=>{if(messages.length)end.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[messages,busy]);
 const programInfo=useStudentScholarshipCatalog<{data:GeneralScholarship}>(selected?"/api/b4/student-scholarships/"+selected:null);
 const context=programInfo.data?.data??recommendations.find(item=>item.scholarshipId===selected);
 const contextReady=!selected||!!programInfo.data;
 const questions=selected?["Apa saja persyaratan beasiswa ini?","Siapa saja penerima beasiswa ini?","Bagaimana cara mendaftar?","Apakah beasiswa ini cocok untukku?"]:suggestions;
 async function send(question:string){
  if(lock.current||!contextReady||cooldown>0||!question.trim()||currentUser.role!=="siswa")return;
  lock.current=true;setBusy(true);setInput("");setMessages(v=>[...v,{role:"user",text:question.trim()}]);
  try{
   const overview=isRecommendationRequest(question);
   const focused=conversation.current.userId===String(currentUser.id)?conversation.current.scholarshipId:selected;
   if(overview){
    const generated=await recommendationRequest<({data:StudentRecommendation[];state:"ready"}|(ScholarshipChatReply&{state:"general_information"}))>("/api/b4/recommendations/generate",{method:"POST",body:(targetLevel??(context&&["SMA","Kuliah"].includes(context.level??"")?context.level:undefined))?{target_jenjang:targetLevel??context?.level}:{}});
    if(generated.state==="general_information"){
     const reply=focused?await recommendationRequest<ScholarshipChatReply>("/api/b4/recommendations/chat",{method:"POST",body:{message:question.trim(),beasiswa_id:focused,...(targetLevel?{target_jenjang:targetLevel}:{})}}):generated;
     setMessages(v=>[...v,{role:"bot",text:reply.answer}]);
     conversation.current={userId:String(currentUser.id),scholarshipId:reply.scholarshipId??focused};
     setMode("Informasi umum beasiswa; kecocokan pribadi belum dihitung.");
     return;
    }
    setCalculated(generated.data);
    const focusedItems=focused?generated.data.filter(item=>item.scholarshipId===focused):generated.data;
    const first=focusedItems[0];
    conversation.current={userId:String(currentUser.id),scholarshipId:focused??first?.scholarshipId};
    const list=focusedItems.slice(0,3).map(item=>"- **"+item.name+"**: "+(item.complete&&item.score!==null?"skor kecocokan "+item.score+"/100":"sebagian kriteria belum dapat dinilai")).join("\n");
    setMessages(v=>[...v,{role:"bot",text:focusedItems.length?"Rekomendasimu sudah siap! 🎓\n\n**Pilihan Berdasarkan Profilmu:**\n"+list+"\n\nBuka hasil untuk melihat evaluasi kriteria dan alasan rekomendasinya. Hasil ini bukan jaminan penerimaan beasiswa.":"Program ini belum tersedia dalam hasil perhitungan saat ini. Kamu tetap bisa mempelajari informasi dan jadwalnya, atau menanyakan pilihan beasiswa lain.",recommendationId:first?.key}]);
    setMode("Hasil dihitung dari profil dan kriteria beasiswa, lalu disimpan untukmu.");
    return;
   }
   const remembered=conversation.current.userId===String(currentUser.id)?conversation.current.scholarshipId:undefined;
   const programId=overview?undefined:(remembered??selected);
   const reply=await recommendationRequest<ScholarshipChatReply>("/api/b4/recommendations/chat",{method:"POST",body:{message:question.trim(),...(targetLevel?{target_jenjang:targetLevel}:{}),...(programId?{beasiswa_id:programId}:{})}});
   conversation.current={userId:String(currentUser.id),scholarshipId:reply.scholarshipId??undefined};
   const choices=reply.suggestions.length?"\n\n**Program yang bisa kamu bahas:**\n"+reply.suggestions.map(v=>"- "+v.name).join("\n")+"\n\nKetik nama program yang ingin kamu pelajari, ya.":"";
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
  {selected&&programInfo.error&&<p role="alert">Informasi beasiswa ini belum dapat dimuat. Kembali ke katalog untuk memilih program.</p>}
  <section className="bc4-chat"><header className="bc4-chatHeader"><FigmaIcon name="bot" size={36}/><div><h2>Eightracer AI</h2><p>Asisten Informasi Beasiswa</p></div></header>
   <div className="bc4-chatMessages" aria-live="polite"><div className="bc4-chatLine"><span className="bc4-botAvatar"><FigmaIcon name="botAvatar" size={30}/></span><div className="bc4-bubble"><p><strong>Hai {displayTitle(currentUser.name.trim().split(/\s+/)[0]||"teman")}! 👋🏻</strong></p><p>Aku siap membantumu mencari pilihan beasiswa, memahami persyaratannya, dan menyiapkan langkah berikutnya. Yuk, kita pelajari bersama! 🎓</p><p>Data yang belum tercatat akan dijelaskan sebagai belum diketahui. Hasil ini bukan keputusan penerimaan beasiswa.</p>{context&&recommendationId&&<p>Konteks percakapan: <strong>{displayTitle(context.name)}</strong></p>}{!messages.length&&<><h3>Mulai dengan Salah Satu Pertanyaan Berikut:</h3><div className="bc4-chatSuggestions">{questions.map(question=><button key={question} disabled={busy||!contextReady||cooldown>0||currentUser.role!=="siswa"} onClick={()=>void send(question)}>{question}</button>)}</div></>}</div></div>
    {messages.map((message,index)=>{
     const linked=recommendations.find(item=>item.key===message.recommendationId);
     return <div key={index} className={"bc4-chatLine "+(message.role==="user"?"bc4-chatUser":"")}>{message.role==="bot"&&<span className="bc4-botAvatar"><FigmaIcon name="botAvatar" size={30}/></span>}<div className="bc4-bubble">{message.role==="bot"?<ChatMessageText text={message.text}/>:<p>{message.text}</p>}{linked&&<div className="bc4-chatScholar"><h3><FigmaIcon name="graduate" size={25}/>{displayTitle(linked.name)}</h3><p>{displayTitle(linked.provider??"-")}</p><strong>Skor kecocokan: {linked.complete&&linked.score!==null?linked.score+"/100":"-"}</strong><Link className="bc4-button" href={"/siswa/rekomendasi-beasiswa/"+linked.key}>Lihat Detail</Link></div>}</div></div>;
    })}
    {busy&&<div className="bc4-chatLine"><span className="bc4-botAvatar"><FigmaIcon name="botAvatar" size={30}/></span><div className="bc4-bubble"><p role="status">Memeriksa informasi beasiswa…</p></div></div>}<div ref={end}/>
   </div>
   {messages.some(message=>message.role==="bot")&&<div className="bc4-chatFollowups"><h3>Pertanyaan yang bisa kamu ajukan ↗</h3><div className="bc4-chatSuggestions">{["Kenapa beasiswa ini sesuai untuk saya?","Apa yang perlu aku persiapkan?","Apa saja persyaratannya?"].map(question=><button type="button" key={question} disabled={busy||!contextReady||cooldown>0||currentUser.role!=="siswa"} onClick={()=>void send(question)}>{question}</button>)}</div></div>}
   {messages.some(message=>message.role==="bot")&&<div className="bc4-chatFollowups">{recommendations.length?<Link className="bc4-button" href="/siswa/rekomendasi-beasiswa?hasil=1">Lihat Hasil Rekomendasi</Link>:<button type="button" className="bc4-button" disabled={busy||!contextReady||cooldown>0||currentUser.role!=="siswa"} onClick={()=>void send("Beasiswa apa yang cocok buat aku?")}>Hitung Rekomendasi Saya</button>}</div>}
   <form className="bc4-chatInput" onSubmit={e=>{e.preventDefault();void send(input);}}><label className="b4-srOnly" htmlFor="b4-chat-question">Pertanyaan Tentang Beasiswa</label><input id="b4-chat-question" placeholder="Tulis pertanyaanmu tentang beasiswa…" value={input} maxLength={1000} disabled={busy||!contextReady||currentUser.role!=="siswa"} onChange={e=>setInput(e.target.value)}/><button type="submit" disabled={busy||!contextReady||cooldown>0||input.trim().length<3||currentUser.role!=="siswa"} aria-label={cooldown>0?"Tunggu "+cooldown+" detik":"Kirim pertanyaan"}><FigmaIcon name="send" size={30}/></button><small>{cooldown>0?"Tunggu "+cooldown+" detik. Pertanyaanmu tetap tersimpan.":mode??"Jawaban berdasarkan informasi yang tersedia."}</small></form>
  </section>
 </B4Shell>;
}
