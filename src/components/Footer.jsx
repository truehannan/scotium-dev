import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-primary-dark/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-gray-400">Scotium &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/support" className="text-sm text-gray-400 hover:text-secondary transition-colors">
              Support
            </Link>
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-secondary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-gray-400 hover:text-secondary transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com/truehannan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-secondary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
