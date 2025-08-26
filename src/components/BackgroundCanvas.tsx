import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

type Mode = "boot" | "bay";

export default function BackgroundCanvas({
  mode = "boot",
  imageUrl,
  videoUrl,
  reducedMotion,     // pass from theme or media query
  label = "Background video", // for accessibility
  videoClassName,
}: {
  mode?: Mode;
  imageUrl?: string;
  videoUrl?: string;
  reducedMotion?: boolean;
  label?: string;
  videoClassName?: string;
}) {
  const rainRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [useImageFallback, setUseImageFallback] = useState(false);

  // Matrix glyph rain on boot
  useEffect(() => {
    if (mode !== "boot" || !rainRef.current) return;
    const host = rainRef.current;
    for (let i = 0; i < 40; i++) {
      const s = document.createElement("span");
      s.textContent = "| 01 10 11 00 |";
      s.style.left = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 6 + "s";
      host.appendChild(s);
    }
    return () => { host.innerHTML = ""; };
  }, [mode]);

  // Handle autoplay & fallback
  useEffect(() => {
    if (mode !== "bay" || !videoUrl || reducedMotion) return;
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = async () => {
      try {
        await v.play();
        setUseImageFallback(false);
      } catch {
        // Autoplay blocked or failed: show fallback image until user interacts
        setPlaying(false);
        setUseImageFallback(true);
      }
    };
    // Start muted to satisfy browser autoplay policies
    v.muted = true;
    if (v.readyState >= 2) {
      tryPlay();
    } else {
      const onLoad = () => {
        tryPlay();
      };
      v.addEventListener("loadeddata", onLoad, { once: true });
      return () => v.removeEventListener("loadeddata", onLoad);
    }
  }, [videoUrl, mode, reducedMotion]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      // Unmute on explicit user intent
      v.muted = false;
      v.play().catch(() => setUseImageFallback(true));
      setUseImageFallback(false);
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="absolute inset-0 -z-10 flex items-center justify-center">
      {mode === "bay" && videoUrl && !reducedMotion && (
        <>
          <div className="relative">
            <video
              ref={videoRef}
              src={videoUrl}
              loop
              muted
              playsInline
              preload="auto"
              aria-label={label}
              className={
                (videoClassName ||
                  "w-[640px] max-w-full h-auto object-cover brightness-[.35] blur-sm") +
                (useImageFallback ? " hidden" : "")
              }
              onError={() => setUseImageFallback(true)}
            />
            {useImageFallback && (
              <div
                className={
                  videoClassName ||
                  "w-[640px] max-w-full h-auto bg-center bg-cover brightness-[.35] blur-sm"
                }
                style={{ backgroundImage: `url(${imageUrl || ""})` }}
                aria-hidden="true"
              />
            )}
            {/* Pause/Play overlay */}
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pause background video" : "Play background video"}
              className="absolute bottom-4 right-4 z-10 px-3 py-2 rounded-lg bg-black/40 hover:bg-black/55 border border-white/20 text-white backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </>
      )}

      {mode === "boot" && <div ref={rainRef} className="glyph-rain" />}

      {/* Scanlines overlay for subtle CRT vibe */}
      <div className="scanlines" />
    </div>
  );
}
