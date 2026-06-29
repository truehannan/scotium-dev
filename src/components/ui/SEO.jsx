import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, canonical, ogImage = '/logo.png' }) {
  const t = title?.includes('Scotium') ? title : `${title || 'Scotium'} | Scotium`;
  const d = description || 'Discover trending GitHub repositories and open source projects.';
  const base = 'https://scotium.pages.dev';
  return (
    <Helmet>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:image" content={`${base}${ogImage}`} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      {canonical && <link rel="canonical" href={`${base}${canonical}`} />}
    </Helmet>
  );
}
