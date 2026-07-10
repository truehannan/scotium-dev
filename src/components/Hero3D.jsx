import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight font-mono">
            Discover.<br />
            Contribute.<br />
            Build.
          </h1>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
          Explore trending repositories, analyze project health, and contribute directly — all in one place.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-8 flex items-center gap-4 justify-center">
          <Link to="/explore" className="btn-primary text-sm">Explore Repos</Link>
          <Link to="/dashboard" className="btn-outline text-sm">Dashboard</Link>
        </motion.div>

        {/* Quick analyze input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="mt-8">
          <form onSubmit={(e) => { e.preventDefault(); const v = e.target.elements.repo.value.trim(); if (v.includes('/')) window.location.href = `/${v}`; }} className="flex items-center gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <input name="repo" placeholder="owner/repo — check health score" className="w-full pl-4 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-secondary/40 transition-all" />
            </div>
            <button type="submit" className="btn-primary text-sm py-2.5 px-4">Analyze</button>
          </form>
          <p className="text-[10px] text-gray-600 mt-2">e.g. facebook/react, vercel/next.js, rust-lang/rust</p>
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
