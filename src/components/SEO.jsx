import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'Scotium - Discover Trending GitHub Repos',
  description = 'Find trending open source projects and repositories on GitHub.',
  canonical,
  ogType = 'website',
  ogImage = '/logo.png',
}) {
  const siteUrl = 'https://scotium.pages.dev';
  const fullTitle = title.includes('Scotium') ? title : `${title} | Scotium`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      {canonical && <meta property="og:url" content={`${siteUrl}${canonical}`} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}
    </Helmet>
  );
}
