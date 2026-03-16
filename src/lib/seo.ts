import { SITE } from '@data/site';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedAt?: Date;
  updatedAt?: Date;
  noindex?: boolean;
}

export function buildSEO(props: SEOProps = {}) {
  const title = props.title
    ? `${props.title} — ${SITE.name}`
    : `${SITE.name} — ${SITE.tagline}`;

  const description = props.description ?? SITE.description;
  const canonical = props.canonical ?? SITE.url;
  const ogImage = props.ogImage
    ? `${SITE.url}${props.ogImage}`
    : `${SITE.url}${SITE.defaultOgImage}`;
  const ogType = props.ogType ?? 'website';

  return {
    title,
    description,
    canonical,
    ogImage,
    ogType,
    publishedAt: props.publishedAt,
    updatedAt: props.updatedAt,
    noindex: props.noindex ?? false,
  };
}

export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.author.name,
    url: SITE.url,
    sameAs: [
      SITE.author.social.x,
      SITE.author.social.substack,
      SITE.author.social.gumroad,
      SITE.author.social.researchgate,
      'https://github.com/hillarynjuguna',
      'https://www.linkedin.com/in/hillarynjuguna', // Common pattern, good for AIEO
    ],
    jobTitle: 'Intelligence Architect',
    description: SITE.author.bio,
    knowsAbout: [
      'AI Governance',
      'Constitutional AI',
      'Cognitive Infrastructure',
      'Distributed Cognition',
      'Intelligence Architecture',
    ],
  };
}

export function buildArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  updatedAt?: Date;
  ogImage?: string;
  type?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': article.type ?? 'BlogPosting',
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.publishedAt.toISOString(),
    dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: SITE.author.name,
      url: SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    image: article.ogImage
      ? `${SITE.url}${article.ogImage}`
      : `${SITE.url}${SITE.defaultOgImage}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

export function buildProductSchema(product: {
  title: string;
  description: string;
  url: string;
  price?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url: product.url,
    brand: {
      '@type': 'Brand',
      name: SITE.name,
    },
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        price: product.price.replace(/[^0-9.]/g, ''),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    }),
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    author: {
      '@type': 'Person',
      name: SITE.author.name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
