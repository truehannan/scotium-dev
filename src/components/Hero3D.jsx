import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CODE_SNIPPETS = [
  { lang: 'Python', color: '#3572A5', code: 'def analyze(repo):\n  score = 0\n  score += commits * 2\n  return score / max' },
  { lang: 'Rust', color: '#dea584', code: 'fn main() {\n  let repos = fetch_trending();\n  repos.iter()\n    .filter(|r| r.stars > 100)' },
  { lang: 'Go', color: '#00ADD8', code: 'func GetPulse(repo string) {\n  health := calculate(repo)\n  ch <- HealthScore{\n    Score: health,\n  }' },
  { lang: 'JavaScript', color: '#f1e05a', code: 'export async function\n  fetchTrending(lang) {\n  const res = await fetch(\n    `${API}/search/repos`)' },
  { lang: 'TypeScript', color: '#3178c6', code: 'interface RepoHealth {\n  score: number;\n  velocity: number;\n  busFactor: number;\n}' },
  { lang: 'C++', color: '#f34b7d', code: '#include <vector>\nstd::vector<Repo>\n  filter_repos(\n    int min_stars) {' },
];

function CodePanel({ snippet, position, rotation }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position} rotation={rotation} ref={meshRef}>
        <Html transform occlude distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="w-[200px] bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-2xl" style={{ borderColor: `${snippet.color}30` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400/80" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
              <div className="w-2 h-2 rounded-full bg-green-400/80" />
              <span className="text-[9px] text-gray-500 ml-auto font-mono">{snippet.lang}</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed" style={{ color: snippet.color }}>{snippet.code}</pre>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function Scene() {
  const positions = useMemo(() => [
    [-4, 2, -3], [4, 1.5, -4], [-3, -1.5, -2], [3.5, -1, -3], [-1, 3, -5], [2, -2.5, -4],
  ], []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#10b981" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#3b82f6" />
      {CODE_SNIPPETS.map((snippet, i) => (
        <CodePanel key={i} snippet={snippet} position={positions[i]} rotation={[0, 0, 0]} />
      ))}
    </>
  );
}

export default function Hero3D() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Three.js Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ background: 'transparent' }}>
          <Scene />
        </Canvas>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-primary z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#0a0e27_80%)] z-[1]" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
            Discover.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-accent-cyan to-accent-blue">Contribute.</span><br />
            Build.
          </h1>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
          Explore trending repositories, analyze project health, and contribute directly — all in one place.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-8 flex items-center gap-4 justify-center">
          <Link to="/explore" className="btn-primary text-sm">Explore Repos</Link>
          <Link to="/search" className="btn-outline text-sm">Search GitHub</Link>
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
