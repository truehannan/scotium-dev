export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

      <div className="prose prose-invert max-w-none space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">Acceptance of Terms</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            By using Scotium, you agree to these terms of service. Scotium is a tool for exploring
            and discovering GitHub repositories and is provided as-is without warranty.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">Use of Service</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Scotium provides a user interface for interacting with publicly available GitHub data.
            You agree not to abuse the service, attempt to circumvent rate limits, or use it for
            any unlawful purpose.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">GitHub API</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Scotium relies on the GitHub API. Your use of Scotium is also subject to GitHub's
            Terms of Service and Acceptable Use Policies. Rate limits and availability depend
            on GitHub's infrastructure.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">Disclaimer</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Scotium is provided "as is" without warranties of any kind. We are not responsible
            for the accuracy, completeness, or availability of data displayed through the platform.
            The service may be modified or discontinued at any time.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Questions about these terms? Visit our
            <a href="/support" className="text-secondary hover:underline ml-1">support page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
