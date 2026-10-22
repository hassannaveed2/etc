// Site navigation, ported from mockup/assets/js/partials.js (NAV) with routes mapped to the Next.js app.
export type NavId = "about" | "tests" | "candidate" | "institutions" | "quality" | "news" | "resources" | "contact";
export type NavItem = { id: NavId; label: string; href: string; blurb: string; links: [label: string, href: string][] };

export const NAV: NavItem[] = [
  {
    id: "about",
    label: "About ETC",
    href: "/about",
    blurb: "Pakistan's national testing body under the Higher Education Commission.",
    links: [
      ["Overview", "/about#overview"],
      ["Our journey", "/about#history"],
      ["Legal mandate", "/about#mandate"],
      ["Vision & mission", "/about#vision"],
      ["Governance", "/about#governance"],
      ["Leadership messages", "/about#leadership"],
    ],
  },
  {
    id: "tests",
    label: "Tests & Assessments",
    href: "/tests",
    blurb: "Five national standardized tests plus customized assessments.",
    links: [
      ["Test directory", "/tests"],
      ["LAT — Law Admission Test", "/tests/lat"],
      ["LAW-GAT — Law Graduate Assessment", "/tests/law-gat"],
      ["HAT-General", "/tests/hat"],
      ["HAAT-Subject", "/tests/haat"],
      ["USAT", "/tests/usat"],
      ["Customized tests", "/tests/customized"],
    ],
  },
  {
    id: "candidate",
    label: "Candidate Services",
    href: "/candidate-services",
    blurb: "Guidance and links for registration, admit cards and results.",
    links: [
      ["Test schedules", "/candidate-services#schedule"],
      ["Registration guidance", "/candidate-services#register"],
      ["Admit cards", "/candidate-services#admit-card"],
      ["Results", "/candidate-services#results"],
      ["Test-day guide", "/candidate-services#test-day"],
      ["Accessibility & accommodations", "/candidate-services#accessibility"],
      ["Help & FAQs", "/faqs"],
    ],
  },
  {
    id: "institutions",
    label: "Institutional Solutions",
    href: "/institutions",
    blurb: "Assessment services for universities, departments and regulators.",
    links: [
      ["Admissions testing", "/institutions#services"],
      ["Recruitment & screening", "/institutions#services"],
      ["Scholarship assessments", "/institutions#services"],
      ["How an engagement works", "/institutions#process"],
      ["Our clients", "/institutions#clients"],
      ["Submit an enquiry", "/institutions#enquiry"],
    ],
  },
  {
    id: "quality",
    label: "Quality & Methods",
    href: "/quality",
    blurb: "How every question is written, reviewed, piloted and checked.",
    links: [
      ["Test development", "/quality#workflow"],
      ["The item bank", "/quality#item-bank"],
      ["Psychometric analysis", "/quality#psychometrics"],
      ["Quality assurance", "/quality#qa"],
      ["Fairness & security", "/quality#security"],
    ],
  },
  {
    id: "news",
    label: "News & Notices",
    href: "/news",
    blurb: "Official announcements, schedules and result notices.",
    links: [
      ["All notices", "/news"],
      ["Admissions", "/news?type=admission"],
      ["Schedules", "/news?type=schedule"],
      ["Results", "/news?type=result"],
      ["Recruitment", "/news?type=recruitment"],
    ],
  },
  {
    id: "resources",
    label: "Resources",
    href: "/resources",
    blurb: "Syllabi, sample papers, guides and policies to download.",
    links: [
      ["Syllabi", "/resources?type=syllabus"],
      ["Sample papers", "/resources?type=sample-paper"],
      ["Guides", "/resources?type=guide"],
      ["Policies", "/resources?type=policy"],
    ],
  },
  {
    id: "contact",
    label: "Contact",
    href: "/contact",
    blurb: "Reach the ETC helpline, email support or our offices.",
    links: [
      ["Contact form", "/contact#form"],
      ["Support routes", "/contact#support"],
      ["Office information", "/contact#office"],
    ],
  },
];

/** The nav section a pathname belongs to (detail pages map to their parent; FAQs sit under Candidate Services). */
export function activeSection(pathname: string): NavId | undefined {
  if (pathname === "/faqs") return "candidate";
  const seg = pathname.split("/")[1];
  const map: Record<string, NavId> = {
    about: "about",
    tests: "tests",
    "candidate-services": "candidate",
    institutions: "institutions",
    quality: "quality",
    news: "news",
    resources: "resources",
    contact: "contact",
  };
  return map[seg];
}
