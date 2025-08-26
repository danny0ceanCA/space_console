import { useMemo, useState } from "react";
import { Console } from "../components/Console";
import MissionCard from "../components/MissionCard";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { prefersReducedMotion } from "../lib/theme";

export default function MathLab({onReturn}:{onReturn:()=>void}){
  const [msgs,setMsgs]=useState([{role:'assistant',text:'[TX-101] Math diagnostics online. Quick calibrations first.'}]);
  const [prompt,setPrompt]=useState('Compute 7 × 6 = ?');
  const reduced = useMemo(()=>prefersReducedMotion(),[]);
  function submit(t:string){
    const lower=t.toLowerCase();
    if(lower.includes('return')) return onReturn();
    if(lower.includes('hint')) setMsgs(m=>[...m,{role:'assistant',text:'[HINT] Think 7 groups of 6 = 6+6+6+6+6+6+6'}]);
    if(lower.includes('show steps')) setMsgs(m=>[...m,{role:'assistant',text:'[STEPS] 7×6 = 42'}]);
    if(lower.startsWith('answer') || /\d+/.test(t)){
      const n=Number(t.match(/\d+/)?.[0]||'NaN');
      setMsgs(m=>[...m,{role:'user',text:`ANSWER ${n}`}, {role:'assistant',text: n===42 ? '[ACK] Correct. Thruster stable. ✓' : '[WARN] Off-nominal. Try grouping in 6s.'}]);
      if(n===42) setPrompt('Rover has 4 wheels, each needs 8 bolts. Total bolts?');
    } else {
      setMsgs(m=>[...m,{role:'user',text:t}]);
    }
  }
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
          onNext={()=>setMsgs(m=>[...m,{role:'assistant',text:'[TX] Next calibration queued.'}])}
        />
      </div>
    </div>
  );
}
