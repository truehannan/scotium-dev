import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CODE_CHARS = 'const fn async await return import export function class interface struct impl pub let var def yield match for while if else try catch throw new delete void typeof instanceof switch case break continue do enum extends super this static get set from of in'.split(' ');
const SYMBOLS = '{}[]();<>=+-*/&|!?:,.@#$%^~`_0123456789'.split('');
const ALL_CHARS = [...CODE_CHARS, ...SYMBOLS, ...SYMBOLS, ...SYMBOLS];

export default function HeroMatrixRain() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      setDimensions({ w, h });
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 14;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(0).map(() => Math.floor(Math.random() * -50));
    const speeds = Array(cols).fill(0).map(() => 0.3 + Math.random() * 0.7);
    const charCache = Array(cols).fill('').map(() => ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)]);

    let animId;
    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(13, 13, 15, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const spotlightRadius = 120;

      for (let i = 0; i < cols; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Change char occasionally
        if (Math.random() > 0.95) {
          charCache[i] = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
        }

        // Calculate distance from mouse for spotlight
        const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
        const inSpotlight = dist < spotlightRadius;

        if (inSpotlight) {
          const intensity = 1 - (dist / spotlightRadius);
          const alpha = 0.3 + intensity * 0.7;
          ctx.fillStyle = `rgba(0, 191, 99, ${alpha})`;
          ctx.shadowColor = '#00bf63';
          ctx.shadowBlur = intensity * 8;
        } else {
          ctx.fillStyle = 'rgba(0, 191, 99, 0.12)';
          ctx.shadowBlur = 0;
        }

        ctx.fillText(charCache[i], x, y);
        ctx.shadowBlur = 0;

        // Reset drop when off screen
        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += speeds[i];
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };

    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Matrix Rain Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #0D0D0F 85%)' }} />

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight font-mono">
            Github Powers<br />
            34 tools, Discovery engine<br />
            and much more...
          </h1>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
          Analyze any repository's health, get actionable insights, and plan your next moves.
        </motion.p>

        {/* Split owner/repo input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-10">
          <form id="hero-form" className="flex items-center justify-center gap-0 max-w-md mx-auto">
            <input id="hero-owner" placeholder="owner" autoComplete="off"
              className="w-[140px] pl-4 pr-2 py-3 bg-white/[0.04] border border-white/[0.08] border-r-0 rounded-l-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-secondary/40 focus:bg-white/[0.06] transition-all text-right"
              onKeyDown={(e) => { if (e.key === '/' || e.key === 'Tab') { e.preventDefault(); document.getElementById('hero-repo').focus(); } }}
            />
            <span className="py-3 px-1.5 bg-white/[0.04] border-y border-white/[0.08] text-gray-500 text-sm font-mono">/</span>
            <input id="hero-repo" placeholder="repo" autoComplete="off"
              className="w-[140px] pl-2 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] border-l-0 rounded-r-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-secondary/40 focus:bg-white/[0.06] transition-all"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const o = document.getElementById('hero-owner').value.trim(); const r = e.target.value.trim(); if (o && r) window.location.href = `/${o}/${r}`; } }}
            />
            <button type="button" onClick={() => { const o = document.getElementById('hero-owner').value.trim(); const r = document.getElementById('hero-repo').value.trim(); if (o && r) window.location.href = `/${o}/${r}`; }}
              className="btn-primary text-sm py-3 px-5 ml-3 rounded-xl">
              Analyze
            </button>
          </form>
          <p className="text-[10px] text-gray-600 mt-3 text-center">Try: facebook / react &nbsp;&bull;&nbsp; vercel / next.js &nbsp;&bull;&nbsp; rust-lang / rust</p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-5 h-8 border-2 border-gray-600 rounded-full flex items-start justify-center pt-1.5">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1 h-1.5 bg-secondary rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
