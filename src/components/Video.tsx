export function Video(props: { video: string }) {
  return (
    <video
      width="320"
      height="240"
      controls={false}
      autoPlay
      loop
      preload="auto"
      className="w-max min-h-max"
    >
      <source src={props.video} type="video/mp4" />
      Seu browser não tewm suporte a vídeos.
    </video>
  );
}
