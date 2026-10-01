import { useRef } from 'react';
import { useMouseFrame } from '../../hooks/useMouse';

const MERIDIANS = 9;
const PARALLELS = [-0.72, -0.4, 0, 0.4, 0.72]; // sin(latitude)
const RING_MASK = 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))';

/**
 * The layered AI Core behind the hero. Each layer animates at its own speed:
 * outer ring (clockwise), middle ring (counter-clockwise), a true 3D wireframe
 * sphere built from CSS-transformed circles, and a pulsing glowing center.
 * The whole object tilts and drifts toward the mouse with eased interpolation.
 */
export function AICore() {
  const ref = useRef<HTMLDivElement>(null);

  useMouseFrame(({ current: { x, y } }) => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      `translate3d(${(x * 20).toFixed(2)}px, ${(y * 20).toFixed(2)}px, 0) ` +
      `rotateX(${(y * -8).toFixed(3)}deg) rotateY(${(x * 12).toFixed(3)}deg)`;
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: 'clamp(340px, 62vw, 780px)', aspectRatio: '1', perspective: '1400px' }}
    >
      <div ref={ref} className="relative h-full w-full will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
        {/* Soft halo */}
        <div
          className="absolute inset-[8%] rounded-full opacity-70 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(59,130,246,0.10) 40%, transparent 70%)' }}
        />

        {/* Outer orbital ring — clockwise */}
        <div className="absolute inset-0" style={{ transform: 'rotateX(72deg) rotateY(-8deg)', transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 rounded-full" style={{ animation: 'spin-cw 60s linear infinite' }}>
            <div className="absolute inset-0 rounded-full border border-white/[0.09]" />
            <div className="absolute inset-[3%] rounded-full border border-dashed border-indigo-300/[0.14]" />
            <OrbitNode angle={0} color="#93c5fd" />
            <OrbitNode angle={130} color="#c4b5fd" size={5} />
            <OrbitNode angle={245} color="#a5b4fc" size={4} />
          </div>
        </div>

        {/* Middle orbital ring — counter-clockwise, different tilt */}
        <div
          className="absolute inset-[17%]"
          style={{ transform: 'rotateX(64deg) rotateY(24deg)', transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-0 rounded-full" style={{ animation: 'spin-ccw 38s linear infinite' }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(96,165,250,0.55), transparent 30%, rgba(167,139,250,0.5) 55%, transparent 80%, rgba(96,165,250,0.55))',
                WebkitMask: RING_MASK,
                mask: RING_MASK,
              }}
            />
            <OrbitNode angle={60} color="#a78bfa" size={7} />
            <OrbitNode angle={220} color="#60a5fa" size={5} />
          </div>
        </div>

        {/* Inner fast ring */}
        <div className="absolute inset-[27%]" style={{ transform: 'rotateX(-58deg) rotateY(-30deg)', transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 rounded-full border border-white/[0.07]" style={{ animation: 'spin-cw 22s linear infinite' }}>
            <OrbitNode angle={90} color="#e0e7ff" size={4} />
          </div>
        </div>

        {/* Wireframe sphere */}
        <div className="absolute inset-[31%]" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-14deg) rotateZ(10deg)' }}>
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', animation: 'spin-y 26s linear infinite' }}>
            {Array.from({ length: MERIDIANS }, (_, i) => (
              <div
                key={`m${i}`}
                className="absolute inset-0 rounded-full border border-indigo-200/[0.16]"
                style={{ transform: `rotateY(${(180 / MERIDIANS) * i}deg)` }}
              />
            ))}
            {PARALLELS.map((s) => {
              const r = Math.sqrt(1 - s * s);
              const inset = `${((1 - r) / 2) * 100}%`;
              return (
                <div
                  key={`p${s}`}
                  className="absolute rounded-full border border-sky-200/[0.13]"
                  style={{ inset, transform: `translateY(${((s / (2 * r)) * 100).toFixed(2)}%) rotateX(90deg)` }}
                />
              );
            })}
          </div>
        </div>

        {/* Glowing center */}
        <div className="absolute inset-[43%]" style={{ animation: 'core-pulse 4.5s ease-in-out infinite' }}>
          <div
            className="absolute -inset-[60%] rounded-full blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.55), rgba(59,130,246,0.18) 45%, transparent 70%)' }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 40% 35%, #ffffff 0%, #c7d2fe 22%, #818cf8 50%, rgba(79,70,229,0.2) 75%, transparent 100%)',
              boxShadow: '0 0 60px 10px rgba(129,140,248,0.35), 0 0 140px 40px rgba(59,130,246,0.15)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function OrbitNode({ angle, color, size = 6 }: { angle: number; color: string; size?: number }) {
  return (
    <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
      <span
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: size, height: size, background: color, boxShadow: `0 0 12px 3px ${color}` }}
      />
    </div>
  );
}
