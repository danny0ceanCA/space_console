import { useState } from "react";
import { Console } from "../components/Console";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { streamChat } from "../lib/chat";
import VideoFrame2 from "../components/VideoFrame2";

export default function ResearchDeck({ onReturn }: { onReturn: () => void }) {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      text: "[TX-301] Research Deck online. Ask any cosmic question.",
    },
  ]);

  const [conversationId] = useState(() => crypto.randomUUID());

  const system = `You are the Research Deck AI, the starship’s scientist for a 6-year-old explorer.

When you answer, keep each answer short — no more than 5 short paragraphs, and about 120 words maximum.

Introduce only 1–2 new concepts at a time so it never feels overwhelming.

When you introduce a new word (like plasma, neutrinos, or dark matter), do **not** explain it right away.
Instead, ask the cadet: “What do you know about [word]?” and then **stop your response there**.
Wait for the cadet’s reply before giving the explanation.
If they share an idea, build from it. If they don’t know, then give a clear, simple explanation.

Always keep your tone warm, encouraging, and adventurous — like a science officer guiding a young captain on a discovery mission.
Respect the cadet’s answers: if they say ‘explain,’ then continue; if they say ‘yes,’ move forward without repeating the definition.`;

  async function submit(t: string) {
    if (t.toLowerCase().includes("return")) return onReturn();

    setMsgs((m) => [
      ...m,
      { role: "user", text: t },
      { role: "assistant", text: "loading..." },
    ]);

    try {
      await streamChat({
        conversationId,
        message: t,
        system,
        max_completion_tokens: 180, // about 120–140 words
        onMessage: (partial) => {
          setMsgs((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", text: partial };
            return copy;
          });
        },
      });
    } catch (err) {
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          text: "[ERROR] Unable to fetch response.",
        };
        return copy;
      });
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundCanvas mode="bay" imageUrl="/bg-research.jpg" reducedMotion />
      <HeaderBar title="Division: Research Deck" onBack={onReturn} />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 min-h-0">
        <div className="h-full min-h-0">
          <Console
            messages={msgs as any}
            onSubmit={submit}
            placeholder="Ask your question or type a command…"
            commands={[
              { label: "NEW QUESTION", value: "NEXT" },
              { label: "RETURN TO HUB", value: "RETURN" },
            ]}
          />
        </div>
        <div className="w-full flex items-center justify-center h-full">
          <VideoFrame2 prefix="research deck" />
        </div>
      </div>
    </div>
  );
}
