import {Fragment} from "react";

// Only paragraphs, lists, and bold text are supported. HTML and links stay literal.
function inline(text:string){
 return text.split(/(\*\*[^*\n]+\*\*)/g).map((part,index)=>part.startsWith("**")&&part.endsWith("**")?<strong key={index}>{part.slice(2,-2)}</strong>:<Fragment key={index}>{part}</Fragment>);
}
export default function ChatMessageText({text}:{text:string}){
 const blocks:{list:boolean;lines:string[]}[]=[];
 for(const raw of text.replace(/\r\n/g,"\n").split("\n")){
  const line=raw.trim();if(!line){blocks.push({list:false,lines:[]});continue;}
  const match=line.match(/^(?:[-•]|\d+[.)])\s+(.+)$/);
  const previous=blocks[blocks.length-1];
  if(match&&previous?.list)previous.lines.push(match[1]);
  else blocks.push({list:!!match,lines:[match?match[1]:line]});
 }
 return <div className="bc4-chatText">{blocks.filter(b=>b.lines.length).map((b,index)=>b.list?<ul key={index}>{b.lines.map((line,i)=><li key={i}>{inline(line)}</li>)}</ul>:<p key={index}>{inline(b.lines[0])}</p>)}</div>;
}
