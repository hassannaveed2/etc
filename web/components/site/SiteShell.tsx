import { getSettings } from "@/lib/content/settings";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RevealInit } from "./RevealInit";

/** Public chrome around page content. Used by the (site) layout and by the root not-found page. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Header settings={settings} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <RevealInit />
    </>
  );
}
