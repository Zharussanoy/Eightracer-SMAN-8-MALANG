export interface GeneralScholarship {
 id:number;name:string;provider:string|null;description:string|null;level:string;opens:string|null;closes:string|null;period:string|null;duration:number|null;durationUnit:string|null;registrationUrl:string|null;
 criteria?:{name:string;operator:string;required:string}[];
 recipients?:{data:{admissionId:number;name:string;university:string|null;program:string|null;cohort:string|null;evidence:string}[];total:number};
}
export interface GeneralScholarshipPage {data:GeneralScholarship[];currentPage:number;lastPage:number;total:number}
const object=(v:unknown):Record<string,unknown>=>{if(!v||typeof v!=="object"||Array.isArray(v))throw Error("Informasi beasiswa belum dapat dibaca.");return v as Record<string,unknown>;};
const number=(v:unknown)=>{if(typeof v!=="number"||!Number.isSafeInteger(v)||v<0)throw Error("Angka katalog tidak valid.");return v;};
const text=(v:unknown)=>typeof v==="string"&&v.trim()?v:null;
export function parseGeneralScholarship(value:unknown,detail=false):GeneralScholarship {
 const r=object(value),id=number(r.id),name=text(r.name),level=text(r.level);
 if(id<1||!name||!["SMA","Kuliah","Keduanya"].includes(level??""))throw Error("Program beasiswa tidak valid.");
 let registrationUrl=null;try{const u=new URL(String(r.registrationUrl));if(["https:","http:"].includes(u.protocol)&&!u.username&&!u.password)registrationUrl=u.href;}catch{}
 const item:GeneralScholarship={id,name,level:level!,provider:text(r.provider),description:text(r.description),opens:text(r.opens),closes:text(r.closes),period:text(r.period),duration:typeof r.duration==="number"&&Number.isFinite(r.duration)&&r.duration>0?r.duration:null,durationUnit:text(r.durationUnit),registrationUrl};
 if(detail){
  const recipients=object(r.recipients);if(!Array.isArray(r.criteria)||!Array.isArray(recipients.data))throw Error("Detail beasiswa belum lengkap.");
  item.criteria=r.criteria.map(v=>{const c=object(v);return {name:text(c.name)??"Persyaratan",operator:text(c.operator)??"",required:text(c.required)??""};});
  item.recipients={total:number(recipients.total),data:recipients.data.map(v=>{const a=object(v),admissionId=number(a.admissionId),name=text(a.name);if(!admissionId||!name)throw Error("Penerima tidak valid.");return{admissionId,name,university:text(a.university),program:text(a.program),cohort:text(a.cohort),evidence:a.evidence==="confirmed_award"?"confirmed_award":"school_record"};})};
 }
 return item;
}
export function parseGeneralScholarshipPage(value:unknown):GeneralScholarshipPage {
 const r=object(value);if(!Array.isArray(r.data))throw Error("Katalog tidak valid.");
 return {data:r.data.map(v=>parseGeneralScholarship(v)),currentPage:number(r.current_page),lastPage:number(r.last_page),total:number(r.total)};
}
