import { useMemo, useState } from "react";
import { Console } from "../components/Console";
import MissionCard from "../components/MissionCard";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { prefersReducedMotion } from "../lib/theme";

export default function ResearchDeck({onReturn}:{onReturn:()=>void}){
  const [msgs,setMsgs]=useState([{role:'assistant',text:"[TX-301] Research Deck online. Ask any cosmic question."}]);
  const [conversationId] = useState(() => crypto.randomUUID());
  const system = "You are the Research Deck AI. Answer cosmic questions concisely.";
  const reduced = useMemo(()=>prefersReducedMotion(),[]);
  async function submit(t:string){
    if(t.toLowerCase().includes('return')) return onReturn();
    setMsgs(m=>[...m,{role:'user',text:t}]);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: t, system })
      });
      const data = await res.json();
      setMsgs(m=>[...m,{role:'assistant',text:data.reply}]);
    } catch (err) {
      setMsgs(m=>[...m,{role:'assistant',text:'[ERROR] Unable to fetch response.'}]);
    }
  }
  return (
    <div className="relative min-h-screen">
      <BackgroundCanvas
        mode="bay"
        videoUrl="/videos/research-deck.mp4"
        imageUrl="/bg-research.jpg"
        reducedMotion={reduced}
        label="Research Deck animated background"
      />
      <HeaderBar title="Division: Research Deck" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
        <Console
          messages={msgs as any}
          onSubmit={submit}
          placeholder="Ask your question or type a command…"
          commands={[
            {label:'NEW QUESTION',value:'NEXT'},
            {label:'RETURN TO HUB',value:'RETURN'}
          ]}
        />
        <MissionCard
          mode="research"
          data={{prompt:"Any cosmic question is valid.", suggestion:"Examples: stars twinkle? live on Mars? how far is Neptune?"}}
        />
      </div>
    </div>
  );
}
