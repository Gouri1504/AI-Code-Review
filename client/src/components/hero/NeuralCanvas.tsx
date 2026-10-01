import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useMedia';
import { useMouseFrame } from '../../hooks/useMouse';

type Particle = { x: number; y: number; vx: number; vy: number; r: number; z: number; hue: number };

const LINK_DIST = 130;

/** Particle field with neural-network style connections. Pauses when off-screen or the tab is hidden. */
export function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  useMouseFrame(({ current }) => {
    mouse.current.x = current.x;
    mouse.current.y = current.y;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.round((w * h) / 15000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.3 + 0.4,
        z: Math.random() * 0.8 + 0.2,
        hue: Math.random() < 0.5 ? 220 : 258,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouse.current.x * 18;
      const my = mouse.current.y * 18;
      const pts = particles.map((p) => ({ x: p.x + mx * p.z, y: p.y + my * p.z, p }));

      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.14 * Math.min(a.p.z, b.p.z) * 1.4;
            ctx.strokeStyle = `rgba(148,163,255,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const { x, y, p } of pts) {
        ctx.fillStyle = `hsla(${p.hue}, 95%, 78%, ${(0.25 + p.z * 0.5).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r * (0.6 + p.z * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced) draw();
      else if (visible && !document.hidden) raf = requestAnimationFrame(step);
    };

    resize();
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
