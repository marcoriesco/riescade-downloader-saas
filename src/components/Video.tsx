import Image from "next/image";

export function Video(props: { video: string }) {
  return (
    <div className="relative w-full h-full">
      <video
        width="100%"
        height="100%"
        controls={false}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover absolute inset-0"
      >
        <source src={props.video} type="video/mp4" />
        <source src={props.video} type="video/webm" />
        Seu navegador não tem suporte a vídeos.
      </video>

      {/* Overlay image - ajustado para ser mais transparente */}
      <div className="absolute inset-0 z-5">
        <Image
          src="/images/overlay.webp"
          alt="Overlay"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
    </div>
  );
}
