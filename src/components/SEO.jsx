import { Helmet } from "react-helmet-async";

const BASE_URL = "https://prestalya.com";
const DEFAULT_IMG = `${BASE_URL}/og-image.jpg`;

export default function SEO({ title, description, path = "/", image = DEFAULT_IMG, type = "website", jsonLd = null }) {
  const fullTitle = title ? `${title} | Prestalya` : "Prestalya – Services à domicile de confiance en France";
  const canonical = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD structuré */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
