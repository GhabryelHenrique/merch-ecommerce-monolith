// Modelos do domínio catalog. Pertencem ao domínio — não sobem para shared.

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ColorOption {
  slug: string;
  label: string;
  hex: string;
}

export interface ProductVariant {
  sku: string;
  color?: string;
  size?: string;
  stock: number;
}

export type ProductBadge = 'new' | 'bestseller' | 'sale';

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  collectionSlugs: string[];
  priceInCents: number;
  compareAtPriceInCents?: number;
  images: ProductImage[];
  options: { colors?: ColorOption[]; sizes?: string[] };
  variants: ProductVariant[];
  badges: ProductBadge[];
  featured: boolean;
  popularity: number;
  createdAt: string; // ISO 8601
}

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
}

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  theme: string;
  image: ProductImage;
}

export interface Banner {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  image: ProductImage;
}

export interface Banners {
  hero: Banner;
  seasonal: Banner;
  sustainability: { title: string; text: string; ctaLabel: string; ctaUrl: string };
}
