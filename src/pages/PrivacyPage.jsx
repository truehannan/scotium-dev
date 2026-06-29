import SEO from '../components/ui/SEO';
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SEO title="Privacy Policy" canonical="/privacy" />
      <h1 className="section-title mb-8">Privacy Policy</h1>
      <div className="space-y-4">
        <Section title="Information We Collect" text="Scotium accesses publicly available data from the GitHub API. When you sign in via GitHub OAuth, we access your profile and repos based on permissions granted. Tokens are stored locally in your browser." />
        <Section title="How We Use Data" text="Your GitHub token is stored in localStorage and used only for authenticated API requests. We do not store tokens on our servers or share with third parties." />
        <Section title="Third-Party Services" text="We use GitHub API and Cloudflare Pages. Your use is subject to their respective privacy policies." />
        <Section title="Contact" text="Questions? Visit our support page." />
      </div>
    </div>
  );
}
function Section({ title, text }) { return <div className="card"><h2 className="text-sm font-semibold text-white mb-2">{title}</h2><p className="text-xs text-gray-400 leading-relaxed">{text}</p></div>; }
