import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { DEFAULT_OG_IMAGE, isProduction, siteUrl, SITE_NAME } from "@/lib/seo";
import "./globals.css";

const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Pakistan's national testing body under the Higher Education Commission.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_PK", images: [{ url: DEFAULT_OG_IMAGE }] },
  // staging and development are never indexed (spec §4)
  robots: isProduction() ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#1F5E45" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-white font-sans text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-green-700 focus:shadow-lift"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
