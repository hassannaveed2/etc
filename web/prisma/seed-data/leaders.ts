// Leadership messages, ported from mockup/about.html#leadership and the homepage quote.
// The photo is the user-supplied headshot, served locally (never uploaded to Spaces).
export const leaderPhoto = {
  key: "local/img/leaders/imtiaz-haider.jpg",
  url: "/img/leaders/imtiaz-haider.jpg",
  mime: "image/jpeg",
  width: 300,
  height: 300,
  alt: "Dr Muhammad Imtiaz Haider",
};

const name = "Dr Muhammad Imtiaz Haider";

export const leaders = [
  {
    role: "CHAIRMAN",
    name,
    title: "Chairman, Board of Governors",
    quote: "A fair test opens a door. Our duty is to make sure that every door opens for the right reason: merit.",
    messageHtml:
      "<p>ETC was created with one simple belief: every young person in Pakistan deserves an equal chance to show what they know and what they can do. Our tests must measure ability and effort, not background, connections or luck.</p>",
  },
  {
    role: "EXECUTIVE_DIRECTOR",
    name,
    title: "Executive Director, Higher Education Commission",
    quote: "Strengthening assessment through integrity, innovation, standardization and excellent service.",
    messageHtml:
      "<p>HEC established ETC to give Pakistan a credible, professionally managed and self-sustaining national testing body — so that access to higher education and professional opportunities is decided by merit.</p>",
  },
  {
    role: "CEO",
    name,
    title: "Chief Executive Officer, ETC",
    quote: "Building confidence in assessment by placing merit, integrity and the candidate experience at the heart of everything we do.",
    messageHtml:
      "<p>Every candidate deserves a test that is fair, transparent, secure and consistent — whether applying to a law college, entering a PhD programme or seeking a professional licence.</p>",
  },
] as const;
