import { useState } from "react";
import { Console } from "../components/Console";
import BackgroundCanvas from "../components/BackgroundCanvas";
import HeaderBar from "../components/HeaderBar";
import { streamChat } from "../lib/chat";
import { researchSystemPrompt } from "../lib/prompts";
import VideoFrame2 from "../components/VideoFrame2";

export default function ResearchDeck({ onReturn }: { onReturn: () => void }) {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      text: "[TX-301] Research Deck online. Ask any cosmic question.",
    },
  ]);

  const [conversationId] = useState(() => crypto.randomUUID());

  const system = researchSystemPrompt;

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
