import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-primary-dark/60 mt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Scotium" className="h-5 opacity-60" />
            <span className="text-sm text-gray-500">
              Built by <a href="https://hannan.page.dev" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary-light font-medium transition-colors">Hannan</a>
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <Link to="/support" className="hover:text-secondary transition-colors">Support</Link>
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms</Link>
            <a href="https://github.com/truehannan" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">GitHub</a>
            <a href="https://twitter.com/truehannan" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
