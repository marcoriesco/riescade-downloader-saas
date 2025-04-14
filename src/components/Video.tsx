export function Video(props: { video: string }) {
  return (
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
  );
}
