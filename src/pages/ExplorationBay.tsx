import { useMemo, useState } from "react";
import { Console } from "../components/Console";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { prefersReducedMotion } from "../lib/theme";
import { streamChat } from "../lib/chat";
import VideoFrame2 from "../components/VideoFrame2";

export default function ExplorationBay({onReturn}:{onReturn:()=>void}){
  const [msgs,setMsgs]=useState([{role:'assistant',text:"[TX-201] Observatory online. Telescope captured Saturn's rings."}]);
  const [conversationId] = useState(()=>crypto.randomUUID());
  const system = `You are the Exploration Bay AI, the friendly mission commander on a spaceship.
You guide a 6-year-old space explorer on exciting missions across the galaxy.
Keep explanations simple, fun, and full of space adventure.
Always encourage curiosity and bravery.
Make math and science feel like part of the journey, using fun examples
like rockets, planets, and stars.
Never criticize—only encourage and gently guide forward.`;
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
    <div className="relative min-h-screen flex flex-col">
      <BackgroundCanvas
        mode="bay"
        imageUrl="/bg-explore.jpg"
        reducedMotion={reduced}
        label="Exploration Bay animated background"
      />
      <HeaderBar title="Division: Exploration Bay" onBack={onReturn} />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 min-h-0">
        <div className="h-full min-h-0">
          <Console
            messages={msgs as any}
            onSubmit={submit}
            placeholder="Type or tap a command…"
            commands={[{label:'RETURN TO HUB',value:'RETURN'}]}
          />
        </div>
        <div className="w-full flex items-center justify-center h-full">
          <VideoFrame2 prefix="exploration bay" />
        </div>
      </div>
    </div>
  );
}
