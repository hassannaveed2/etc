import type { Metadata } from "next";

export const SITE_NAME = "Education Testing Council";
/** Default share image: the homepage hero photograph on Spaces. */
export const DEFAULT_OG_IMAGE = "https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/images/hero-exam-hall.jpg";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function isProduction(): boolean {
  return process.env.NEXT_PUBLIC_SITE_ENV === "production";
}

/** Per-page metadata: title (templated by the root layout), description, canonical path and Open Graph. */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string | { absolute: string };
  description: string;
  path: string;
  image?: string | null;
}): Metadata {
  const ogTitle = typeof title === "string" ? `${title} | ${SITE_NAME}` : title.absolute;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_PK",
      images: [{ url: image || DEFAULT_OG_IMAGE }],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [image || DEFAULT_OG_IMAGE] },
  };
}
