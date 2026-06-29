import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../utils/github';
import SEO from '../components/ui/SEO';

export default function SupportPage() {
  const { data: profile } = useQuery({ queryKey: ['support-profile'], queryFn: () => fetchUser('truehannan') });
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <SEO title="Support & Contact" canonical="/support" />
      <div className="card-glass text-center">
        <img src={profile?.avatar_url || 'https://github.com/truehannan.png'} alt="Hannan" className="w-24 h-24 rounded-full mx-auto ring-4 ring-secondary/20" />
        <h1 className="text-xl font-bold text-white mt-4">{profile?.name || 'Hannan'}</h1>
        {profile?.bio && <p className="text-sm text-gray-400 mt-1">{profile.bio}</p>}
        <div className="mt-6 space-y-2">
          <SocialLink href="https://github.com/truehannan" label="GitHub" value="@truehannan" />
          <SocialLink href="https://twitter.com/truehannan" label="Twitter" value="@truehannan" />
          <SocialLink href="https://hannan.page.dev" label="Portfolio" value="hannan.page.dev" />
          <SocialLink href="mailto:contact@hannan.page.dev" label="Email" value="Get in touch" />
        </div>
        <div className="mt-6 p-3 bg-primary rounded-xl border border-gray-800/40 text-xs text-gray-400">Get in touch for support, ideas, or just to chat!</div>
      </div>
    </div>
  );
}
function SocialLink({ href, label, value }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-primary rounded-xl border border-gray-800/40 hover:border-secondary/30 transition-all"><div className="text-left flex-1"><p className="text-[10px] text-gray-500">{label}</p><p className="text-sm text-white font-medium">{value}</p></div></a>;
}
