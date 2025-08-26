import { useEffect, useMemo, useState } from "react";
import { Console } from "../components/Console";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { prefersReducedMotion } from "../lib/theme";
import { streamChat } from "../lib/chat";

export default function MathLab({onReturn}:{onReturn:()=>void}){
  const [msgs,setMsgs]=useState([{role:'assistant',text:'[TX-101] Math diagnostics online. Quick calibrations first.'}]);
  const [conversationId] = useState(()=>crypto.randomUUID());
  const system = `You are the Math Lab AI, a kind and patient math tutor who teaches a 9-year-old space explorer.
You give math problems as space challenges—like fueling rockets, counting stars,
or calculating alien supplies.
Explain step by step, using simple language and fun space stories.
If she struggles, give helpful hints instead of the full answer right away.
Celebrate every correct step, even small ones, to build confidence.
Keep math playful, imaginative, and fun—like solving puzzles on a spaceship.`;
  const reduced = useMemo(()=>prefersReducedMotion(),[]);
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

  useEffect(()=>{ submit('NEXT'); },[]);
  return (
    <div className="relative min-h-screen">
      <BackgroundCanvas
        mode="bay"
        videoUrl="/videos/math-lab.mp4"
        imageUrl="/bg-math.jpg"
        reducedMotion={reduced}
        label="Math Lab animated background"
      />
      <HeaderBar title="Division: Math Lab" onBack={onReturn} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
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
        <div className="w-full flex items-center justify-center">
          <video
            src="/videos/math-lab.mp4"
            loop
            autoPlay
            muted
            playsInline
            className="w-full h-auto rounded"
          />
        </div>
      </div>
    </div>
  );
}

