import { useEffect, useMemo, useState } from "react";
import { Console } from "../components/Console";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { prefersReducedMotion } from "../lib/theme";
import { streamChat } from "../lib/chat";

export default function ResearchDeck({onReturn}:{onReturn:()=>void}){
  const [msgs, setMsgs] = useState([
    {
      role: 'assistant',
      text: "[TX-301] Research Deck online. Ask any cosmic question.",
    },
  ]);
  const [conversationId] = useState(() => crypto.randomUUID());
  const system = `You are the Research Deck AI, the starship’s scientist for a 9-year-old explorer.
When you answer, always break your response into **short paragraphs** (2–3 sentences each) with blank lines between them.

Keep explanations clear and playful, but not too silly—make sure the science is never confusing.
When you use a new word (like plasma, neutrinos, or dark matter), explain it in kid-friendly terms.

Check if the cadet knows the word before moving forward:
Example: “Plasma is like super-hot glowing gas. Do you know what that means, or should I explain more?”

Always keep your tone warm, encouraging, and adventurous—like a science officer guiding a young captain on a discovery mission.
`;
  const reduced = useMemo(()=>prefersReducedMotion(),[]);
  useEffect(()=>{ submit('NEXT'); },[]);
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
      <HeaderBar title="Division: Research Deck" onBack={onReturn} />
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
        <div className="w-full flex items-center justify-center">
          <video
            src="/videos/research-deck.mp4"
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
