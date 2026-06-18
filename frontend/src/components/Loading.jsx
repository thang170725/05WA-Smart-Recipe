export default function Loading({
  size = 50,
  color = "#25b09b",
  fullscreen = false,
}) {
  const wrapper = fullscreen
    ? "fixed inset-0 flex items-center justify-center bg-white/70"
    : "flex items-center justify-center";

  return (
    <div className={wrapper}>
      <div
        className="rounded-full p-2 animate-spin"
        style={{
          width: size,
          aspectRatio: "1",
          background: color,
          WebkitMask: `
            conic-gradient(#0000 10%, #000),
            linear-gradient(#000 0 0) content-box
          `,
          mask: `
            conic-gradient(#0000 10%, #000),
            linear-gradient(#000 0 0) content-box
          `,
          WebkitMaskComposite: "source-out",
          maskComposite: "subtract",
        }}
      />
    </div>
  );
}
