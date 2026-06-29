import SEO from '../components/ui/SEO';
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SEO title="Terms of Service" canonical="/terms" />
      <h1 className="section-title mb-8">Terms of Service</h1>
      <div className="space-y-4">
        <Section title="Acceptance" text="By using Scotium you agree to these terms. Scotium is provided as-is without warranty." />
        <Section title="Use of Service" text="You agree not to abuse the service, attempt to circumvent rate limits, or use for unlawful purposes." />
        <Section title="GitHub API" text="Your use is subject to GitHub's Terms of Service. Rate limits and availability depend on GitHub's infrastructure." />
        <Section title="Disclaimer" text="Scotium is provided without warranties. We are not responsible for data accuracy or availability." />
      </div>
    </div>
  );
}
function Section({ title, text }) { return <div className="card"><h2 className="text-sm font-semibold text-white mb-2">{title}</h2><p className="text-xs text-gray-400 leading-relaxed">{text}</p></div>; }
