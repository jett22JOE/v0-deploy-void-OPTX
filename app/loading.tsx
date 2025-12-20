export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Loading text */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <h1
          className="text-4xl md:text-6xl font-bold text-white tracking-wider animate-pulse"
          style={{
            fontFamily: "var(--font-orbitron), sans-serif",
            textShadow: "0 0 40px rgba(181, 82, 0, 0.6), 0 0 80px rgba(181, 82, 0, 0.3)",
          }}
        >
          Loading...
        </h1>
      </div>
    </div>
  )
}
