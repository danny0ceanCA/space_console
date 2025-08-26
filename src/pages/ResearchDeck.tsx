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
  const system = `You are the Research Deck AI, the starship’s scientist for a 9-year-old explorer.
When you answer questions, keep explanations short, clear, and playful, but not so silly that the science gets lost.
Always explain new words (like plasma, neutrinos, or dark matter) in kid-friendly terms.
Before moving forward, ask if the cadet already knows the word, so they feel in control:
Example: “Plasma is like super-hot glowing gas—do you want me to explain more, or should we scan the next ingredient of space?”
Keep responses fun, but focused—like a science adventure that’s easy to follow.`;
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
