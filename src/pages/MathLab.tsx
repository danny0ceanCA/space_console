import { useEffect, useMemo, useState } from "react";
import { Console } from "../components/Console";
import MissionCard from "../components/MissionCard";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { prefersReducedMotion } from "../lib/theme";

export default function MathLab({onReturn}:{onReturn:()=>void}){
  const [msgs,setMsgs]=useState([{role:'assistant',text:'[TX-101] Math diagnostics online. Quick calibrations first.'}]);
  const [prompt,setPrompt]=useState('');
  const [conversationId] = useState(()=>crypto.randomUUID());
  const system = "You are the Math Lab AI. Generate math problems for the user to solve. When the user answers, check the answer. Provide hints or steps when requested, and give a new problem when the user says NEXT.";
  const reduced = useMemo(()=>prefersReducedMotion(),[]);
  async function submit(t:string){
    const lower=t.toLowerCase();
    if(lower.includes('return')) return onReturn();
    setMsgs(m=>[...m,{role:'user',text:t}]);
    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ conversationId, message: t, system })
      });
      const data = await res.json();
      setMsgs(m=>[...m,{role:'assistant',text:data.reply}]);
      if(t==='NEXT') setPrompt(data.reply);
    } catch(err){
      setMsgs(m=>[...m,{role:'assistant',text:'[ERROR] Unable to fetch response.'}]);
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
      <HeaderBar title="Division: Math Lab" />
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
        <MissionCard mode="math" data={{prompt}}
          onAnswer={(n)=>submit(String(n))}
          onHint={()=>submit('HINT')}
          onSteps={()=>submit('SHOW STEPS')}
          onNext={()=>submit('NEXT')}
        />
      </div>
    </div>
  );
}

