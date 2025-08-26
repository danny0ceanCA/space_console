import { useMemo, useState } from "react";
import { Console } from "../components/Console";
import MissionCard from "../components/MissionCard";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { prefersReducedMotion } from "../lib/theme";

export default function ResearchDeck({onReturn}:{onReturn:()=>void}){
  const [msgs,setMsgs]=useState([{role:'assistant',text:"[TX-301] Research Deck online. Ask any cosmic question."}]);
  const reduced = useMemo(()=>prefersReducedMotion(),[]);
  function submit(t:string){
    if(t.toLowerCase().includes('return')) return onReturn();
    setMsgs(m=>[...m,{role:'user',text:t},{role:'assistant',text:'[INFO] Stars twinkle because air bends their light. Field task: compare horizon vs overhead.'}]);
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
