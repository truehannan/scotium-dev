export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

      <div className="prose prose-invert max-w-none space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">Information We Collect</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Scotium accesses publicly available data from the GitHub API. When you sign in with GitHub OAuth,
            we access your profile information and repository data based on the permissions you grant.
            We do not collect personal information beyond what GitHub provides.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">How We Use Your Data</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your GitHub access token is stored locally in your browser (localStorage) and is only used
            to make authenticated API requests to GitHub on your behalf. We do not store your token on
            our servers or share it with any third parties.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">Third-Party Services</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Scotium uses the GitHub API to display repository and user information. Your interactions
            with GitHub are subject to GitHub's own privacy policy. We also use Cloudflare Pages for
            hosting, which may collect standard web analytics.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">Data Retention</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            We do not permanently store user data. Authentication tokens are stored in your browser
            and can be removed by signing out or clearing your browser data. Cached API responses
            expire after a short period.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            If you have questions about this privacy policy, please reach out via our
            <a href="/support" className="text-secondary hover:underline ml-1">support page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
