/* ETC design tokens for the Tailwind Play CDN. The Next.js build reuses these values. */
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        green: { 950: "#0B231A", 900: "#0F2E22", 800: "#174634", 700: "#1F5E45", 600: "#276E51", 500: "#2E7D5B", 100: "#DCEBE2" },
        gold: { 600: "#7E6224", 500: "#B8913A", 300: "#D9BE7C", 100: "#F3E9CF" },
        mint: { 50: "#EEF5F0", 100: "#E2EEE6" },
        cream: { 50: "#FAF6EA", 100: "#F4ECD6" },
        ink: "#12261E",
        muted: "#56655E",
        line: "#D7E2DB",
        status: { open: "#1F7A4D", closing: "#955800", result: "#1D5C96", closed: "#5B6270" },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: { site: "80rem" },
      letterSpacing: { eyebrow: "0.22em" },
      boxShadow: {
        card: "0 1px 2px rgba(18,38,30,.06), 0 8px 24px -12px rgba(18,38,30,.18)",
        lift: "0 2px 4px rgba(18,38,30,.06), 0 18px 40px -18px rgba(18,38,30,.35)",
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: { marquee: "marquee 60s linear infinite" },
    },
  },
};
