/** Static-ish ambience: grid, radial light, drifting gradient blobs and an occasional scan line. */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Radial light */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 50% 42%, rgba(79,70,229,0.16) 0%, rgba(5,5,5,0) 70%)' }}
      />

      {/* Gradient blobs */}
      <div
        className="absolute -left-[10%] top-[8%] h-[46vmax] w-[46vmax] rounded-full opacity-[0.22] blur-[110px]"
        style={{ background: 'radial-gradient(circle, #2563eb, transparent 65%)', animation: 'blob-drift 26s ease-in-out infinite' }}
      />
      <div
        className="absolute -right-[12%] top-[26%] h-[42vmax] w-[42vmax] rounded-full opacity-[0.2] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 65%)', animation: 'blob-drift 32s ease-in-out -8s infinite reverse' }}
      />

      {/* Subtle grid, faded toward the edges */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          backgroundPosition: 'center center',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)',
        }}
      />

      {/* Occasional scan line (visible ~half of each 11s cycle) */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(165,180,252,0.35) 30%, rgba(196,181,253,0.45) 50%, rgba(165,180,252,0.35) 70%, transparent)',
          boxShadow: '0 0 18px 2px rgba(129,140,248,0.18)',
          animation: 'scanline 11s cubic-bezier(0.45,0,0.55,1) 2s infinite',
        }}
      />

      {/* Bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent to-[#050505]" />
    </div>
  );
}
