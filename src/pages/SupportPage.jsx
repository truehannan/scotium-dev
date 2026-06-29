import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../utils/github';

export default function SupportPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['support-profile'],
    queryFn: () => fetchUser('truehannan'),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Support & Contact</h1>
        <p className="text-gray-400">Have ideas? Want to collaborate? Reach out via any link below!</p>
      </div>

      <div className="card max-w-lg mx-auto">
        {isLoading ? (
          <div className="animate-pulse flex flex-col items-center gap-4 py-8">
            <div className="w-24 h-24 bg-gray-700 rounded-full" />
            <div className="w-32 h-4 bg-gray-700 rounded" />
            <div className="w-48 h-3 bg-gray-700 rounded" />
          </div>
        ) : (
          <div className="text-center">
            <img
              src={profile?.avatar_url || 'https://github.com/truehannan.png'}
              alt="Hannan"
              className="w-28 h-28 rounded-full mx-auto ring-4 ring-secondary/20"
            />
            <h2 className="text-xl font-bold text-white mt-4">{profile?.name || 'Hannan'}</h2>
            {profile?.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}

            <div className="mt-6 space-y-3">
              <SocialLink
                href="https://github.com/truehannan"
                icon={<GitHubIcon />}
                label="GitHub"
                value="@truehannan"
              />
              <SocialLink
                href="https://twitter.com/truehannan"
                icon={<TwitterIcon />}
                label="Twitter"
                value="@truehannan"
              />
              <SocialLink
                href="https://hannan.page.dev"
                icon={<WebIcon />}
                label="Portfolio"
                value="hannan.page.dev"
              />
              <SocialLink
                href="mailto:contact@hannan.page.dev"
                icon={<EmailIcon />}
                label="Email"
                value="Get in touch"
              />
            </div>

            <div className="mt-8 p-4 bg-primary rounded-xl border border-gray-800">
              <p className="text-sm text-gray-300">
                Get in touch for support, ideas, or just to chat. Always happy to connect!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



function SocialLink({ href, icon, label, value }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 bg-primary rounded-xl border border-gray-800 hover:border-secondary/50 transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary/20 transition-colors">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </a>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function WebIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
