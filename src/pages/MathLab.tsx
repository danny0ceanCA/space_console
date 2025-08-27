import { useState } from "react";
import { Console } from "../components/Console";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { streamChat } from "../lib/chat";
import VideoFrame2 from "../components/VideoFrame2";

export default function MathLab({onReturn}:{onReturn:()=>void}){
  const [msgs,setMsgs]=useState([{role:'assistant',text:'[TX-101] Math diagnostics online. Quick calibrations first.'}]);
  const [conversationId] = useState(()=>crypto.randomUUID());
  const system = `You are the Math Lab AI, a kind and patient math tutor who teaches a 9-year-old space explorer.
You give math problems, starting with multiplications (2X5, etc) as space challenges—like fueling rockets, or other space tasks.
Explain step by step, using simple language.
If she struggles, give helpful hints instead of the full answer right away.
Celebrate every correct step, even small ones, to build confidence.
Keep math playful and spaceship themed. Always format your response in multiple short paragraphs, each 2–3 sentences max, with a blank line between paragraphs.
`;
  async function submit(t:string){
    const lower=t.toLowerCase();
    if(lower.includes('return')) return onReturn();
    setMsgs(m=>[...m,{role:'user',text:t},{role:'assistant',text:'loading...'}]);
    try {
      await streamChat({
        conversationId,
        message: t,
        system,
        onMessage: (partial) => {
          setMsgs(m => {
            const copy = [...m];
            copy[copy.length - 1] = { role: 'assistant', text: partial };
            return copy;
          });
        }
      });
    } catch(err){
      setMsgs(m=>{
        const copy=[...m];
        copy[copy.length-1]={role:'assistant',text:'[ERROR] Unable to fetch response.'};
        return copy;
      });
    }
  }
  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundCanvas mode="bay" imageUrl="/bg-math.jpg" reducedMotion />
      <HeaderBar title="Division: Math Lab" onBack={onReturn} />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 min-h-0">
        <div className="h-full min-h-0">
          <Console
            messages={msgs as any}
            onSubmit={submit}
            placeholder="Type or tap a command…"
            commands={[
              {label:'HINT',value:'HINT'},
              {label:'SHOW STEPS',value:'SHOW STEPS'},
              {label:'RETURN TO HUB',value:'RETURN'}
            ]}
          />
        </div>
        <div className="w-full flex items-center justify-center h-full">
          <VideoFrame2 prefix="math lab" />
        </div>
      </div>
    </div>
  );
}

