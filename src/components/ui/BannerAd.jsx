import { useCMS } from '../../context/CMSContext';

export default function BannerAd({ slot }) {
  const { banners } = useCMS();
  const banner = banners.find(b => b.slot === slot && b.active);
  if (!banner) return null;

  return (
    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block my-8 rounded-2xl overflow-hidden border border-gray-800/40 hover:border-secondary/30 transition-all group">
      <div className="relative flex items-stretch min-h-[140px]">
        {/* Text side with gradient fade */}
        <div className="flex-1 p-6 flex flex-col justify-center relative z-10" style={{ background: `linear-gradient(90deg, ${banner.bgColor || '#0a0e27'} 60%, transparent 100%)` }}>
          {banner.badge && <span className="badge bg-secondary/10 text-secondary mb-2 w-fit">{banner.badge}</span>}
          <h3 className="text-lg font-bold text-white group-hover:text-secondary transition-colors">{banner.title}</h3>
          {banner.description && <p className="text-sm text-gray-400 mt-1">{banner.description}</p>}
          {banner.cta && <span className="text-xs text-secondary mt-2 font-medium">{banner.cta} →</span>}
        </div>
        {/* Image side */}
        {banner.imageUrl && (
          <div className="w-1/3 sm:w-2/5 relative flex-shrink-0">
            <img src={banner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
      </div>
    </a>
  );
}
