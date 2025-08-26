export default function VideoFrame({ src }: { src: string }) {
  return (
    <div className="relative w-full pb-[56.25%]">
      <video
        src={src}
        loop
        autoPlay
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover rounded"
      />
    </div>
  );
}
