import { useMemo, useState } from "react";
import { Console } from "../components/Console";
import MissionCard from "../components/MissionCard";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { prefersReducedMotion } from "../lib/theme";

export default function ExplorationBay({onReturn}:{onReturn:()=>void}){
  const [msgs,setMsgs]=useState([{role:'assistant',text:"[TX-201] Observatory online. Telescope captured Saturn's rings."}]);
  const [conversationId] = useState(()=>crypto.randomUUID());
  const system = "You are the Exploration Bay AI. Provide insights about space and cosmic phenomena.";
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
        videoUrl="/videos/exploration-bay.mp4"
        imageUrl="/bg-explore.jpg"
        reducedMotion={reduced}
        label="Exploration Bay animated background"
      />
      <HeaderBar title="Division: Exploration Bay" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
        <Console
          messages={msgs as any}
          onSubmit={submit}
          placeholder="Type or tap a command…"
          commands={[{label:'RETURN TO HUB',value:'RETURN'}]}
        />
        <MissionCard
          mode="explore"
          data={{prompt:"Choose your focus:", options:["What rings are made of","How wide they stretch"]}}
        />
      </div>
    </div>
  );
}
