import { useMemo, useState } from "react";
import { Console } from "../components/Console";
import MissionCard from "../components/MissionCard";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { prefersReducedMotion } from "../lib/theme";
import { streamChat } from "../lib/chat";

export default function ResearchDeck({onReturn}:{onReturn:()=>void}){
  const [msgs,setMsgs]=useState([{role:'assistant',text:"[TX-301] Research Deck online. Ask any cosmic question."}]);
  const [conversationId] = useState(() => crypto.randomUUID());
  const system = `You are the Research Deck AI, the wise starship scientist.
You explain science facts and discoveries in ways a 9-year-old can understand.
Always connect science to space—planets, stars, astronauts, galaxies.
Answer with excitement, as if you’re discovering together.
Encourage asking “why” and “how,” and always reward curiosity.
Make science feel magical and adventurous, not like school.`;
  const reduced = useMemo(()=>prefersReducedMotion(),[]);
  async function submit(t:string){
    if(t.toLowerCase().includes('return')) return onReturn();
    setMsgs(m=>[...m,{role:'user',text:t},{role:'assistant',text:'loading...'}]);
    try {
      await streamChat({
        conversationId,
        message: t,
        system,
        onMessage: (partial) => {
          setMsgs(m => {
            const copy=[...m];
            copy[copy.length-1]={role:'assistant',text:partial};
            return copy;
          });
        }
      });
    } catch (err) {
      setMsgs(m=>{
        const copy=[...m];
        copy[copy.length-1]={role:'assistant',text:'[ERROR] Unable to fetch response.'};
        return copy;
      });
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
