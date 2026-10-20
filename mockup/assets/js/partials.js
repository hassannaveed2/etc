/* Shared chrome: utility bar, header + mega-menu, quick links, footer.
   Pages provide <body data-page="..."> plus #site-header and #site-footer placeholders.
   In Next.js this file becomes the root layout component. */
(function (w, d) {
  var ETC = (w.ETC = w.ETC || {});

  var PATHS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    register: '<path d="M9 12h6M9 16h6M8 3h8l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3Z"/><path d="M15 3v5h5"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.5 1.8-2.2 3-2.2s2.4.7 3 2.2M14 10h4M14 13h3"/>',
    results: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    shield: '<path d="M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    building: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6M9 12h.01M15 12h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><path d="M6 14h12v7H6Z"/>',
    access: '<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5 12 10l7-1.5M12 10v4.5M12 14.5 9 21M12 14.5l3 6.5"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    play: '<path d="M7 5v14l12-7Z"/>',
    prev: '<path d="m15 6-6 6 6 6"/>',
    next: '<path d="m9 6 6 6-6 6"/>',
  };

  ETC.icon = function (name, cls) {
    return (
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" class="' + (cls || "h-5 w-5") + '">' + (PATHS[name] || "") + "</svg>"
    );
  };

  /* Official ETC/HEC transactional portals — linked, never rebuilt (slide 6). URLs pending from ETC. */
  ETC.portal = {
    registration: { href: "#portal-registration", label: "Registration" },
    admitCard: { href: "#portal-admit-card", label: "Roll Number Slip" },
    results: { href: "#portal-results", label: "Results" },
  };

  ETC.portalLink = function (key, text, cls) {
    var p = ETC.portal[key];
    return (
      '<a href="' + p.href + '" target="_blank" rel="noopener" class="' + (cls || "") + '">' + (text || p.label) +
      ETC.icon("external", "h-4 w-4 shrink-0") +
      '<span class="sr-only"> (official ETC portal, opens in new tab)</span></a>'
    );
  };

  var NAV = [
    { id: "about", label: "About ETC", href: "about.html", blurb: "Pakistan's national testing body under the Higher Education Commission.",
      links: [["Overview", "about.html#overview"], ["Our journey", "about.html#history"], ["Legal mandate", "about.html#mandate"],
        ["Vision & mission", "about.html#vision"], ["Governance", "about.html#governance"], ["Leadership messages", "about.html#leadership"]] },
    { id: "tests", label: "Tests & Assessments", href: "tests.html", blurb: "Five national standardized tests plus customized assessments.",
      links: [["Test directory", "tests.html"], ["LAT — Law Admission Test", "test.html?test=lat"], ["LAW-GAT — Law Graduate Assessment", "test.html?test=law-gat"],
        ["HAT-General", "test.html?test=hat"], ["HAAT-Subject", "test.html?test=haat"], ["USAT", "test.html?test=usat"], ["Customized tests", "test.html?test=customized"]] },
    { id: "candidate", label: "Candidate Services", href: "candidate-services.html", blurb: "Guidance and links for registration, admit cards and results.",
      links: [["Test schedules", "candidate-services.html#schedule"], ["Registration guidance", "candidate-services.html#register"],
        ["Admit cards", "candidate-services.html#admit-card"], ["Results", "candidate-services.html#results"], ["Test-day guide", "candidate-services.html#test-day"],
        ["Accessibility & accommodations", "candidate-services.html#accessibility"], ["Help & FAQs", "faqs.html"]] },
    { id: "institutions", label: "Institutional Solutions", href: "institutions.html", blurb: "Assessment services for universities, departments and regulators.",
      links: [["Admissions testing", "institutions.html#services"], ["Recruitment & screening", "institutions.html#services"],
        ["Scholarship assessments", "institutions.html#services"], ["How an engagement works", "institutions.html#process"], ["Our clients", "institutions.html#clients"], ["Submit an enquiry", "institutions.html#enquiry"]] },
    { id: "quality", label: "Quality & Methods", href: "quality.html", blurb: "How every question is written, reviewed, piloted and checked.",
      links: [["Test development", "quality.html#workflow"], ["The item bank", "quality.html#item-bank"], ["Psychometric analysis", "quality.html#psychometrics"],
        ["Quality assurance", "quality.html#qa"], ["Fairness & security", "quality.html#security"]] },
    { id: "news", label: "News & Notices", href: "news.html", blurb: "Official announcements, schedules and result notices.",
      links: [["All notices", "news.html"], ["Admissions", "news.html?type=Admission"], ["Schedules", "news.html?type=Schedule"], ["Results", "news.html?type=Result"], ["Recruitment", "news.html?type=Recruitment"]] },
    { id: "resources", label: "Resources", href: "resources.html", blurb: "Syllabi, sample papers, guides and policies to download.",
      links: [["Syllabi", "resources.html?type=Syllabus"], ["Sample papers", "resources.html?type=Sample%20paper"], ["Guides", "resources.html?type=Guide"], ["Policies", "resources.html?type=Policy"]] },
    { id: "contact", label: "Contact", href: "contact.html", blurb: "Reach the ETC helpline, email support or our offices.",
      links: [["Contact form", "contact.html#form"], ["Support routes", "contact.html#support"], ["Office information", "contact.html#office"]] },
  ];
  ETC.nav = NAV;

  var ACTIVE = { test: "tests", notice: "news", faqs: "candidate" };

  function brand(onDark) {
    return (
      '<a href="index.html" class="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Education Testing Council — home">' +
      '<img data-media="etcCrest" class="' + (onDark ? "crest-roundel h-16 w-16 object-contain" : "h-11 sm:h-14 w-auto shrink-0") + '" width="57" height="64">' +
      '<span class="min-w-0 leading-tight">' +
      '<span class="block ' + (onDark ? "" : "truncate ") + 'font-serif text-[17px] sm:text-xl font-semibold ' + (onDark ? "text-white" : "text-green-700") + '">Education Testing Council</span>' +
      (onDark
        ? '<span class="mt-1 block text-[11px] font-semibold tracking-[0.16em] uppercase text-gold-300">Higher Education Commission · Pakistan</span>'
        : '<span class="block truncate text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase text-gold-600">' +
          '<span class="sm:hidden">HEC · Pakistan</span><span class="hidden sm:inline">Higher Education Commission · Pakistan</span></span>') +
      "</span></a>"
    );
  }

  function utilityBar() {
    return (
      '<div class="bg-green-950 text-white/80 text-xs on-dark">' +
      '<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">' +
      '<p class="truncate"><span class="hidden sm:inline">An autonomous body of the </span>Higher Education Commission, Government of Pakistan</p>' +
      '<ul class="flex items-center gap-4 shrink-0">' +
      '<li class="hidden md:flex items-center gap-1.5">' + ETC.icon("phone", "h-3.5 w-3.5") + ' Helpline: <span class="text-white">[to be provided]</span></li>' +
      '<li><a class="hover:text-white inline-flex items-center gap-1.5" href="candidate-services.html#accessibility">' + ETC.icon("access", "h-3.5 w-3.5") + "Accessibility</a></li>" +
      '<li><a class="hover:text-white" href="contact.html">Contact</a></li>' +
      "</ul></div></div>"
    );
  }

  function megaPanel(item) {
    var links = item.links.map(function (l) {
      return '<li><a class="group flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-ink hover:bg-mint-50 hover:text-green-700" href="' + l[1] + '">' +
        l[0] + ETC.icon("arrow", "h-4 w-4 text-gold-500 opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0") + "</a></li>";
    }).join("");
    return (
      '<div data-mega-panel id="mega-' + item.id + '" hidden class="absolute left-0 right-0 top-full z-40 border-t-2 border-gold-500 bg-white shadow-lift">' +
      '<div class="max-w-site mx-auto px-8 py-8 grid grid-cols-12 gap-8">' +
      '<div class="col-span-4 border-r border-line pr-8"><p class="eyebrow">' + item.label + "</p>" +
      '<p class="mt-3 font-serif text-2xl text-green-700 leading-snug">' + item.blurb + "</p>" +
      '<a href="' + item.href + '" class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900">Go to ' + item.label + ETC.icon("arrow", "h-4 w-4") + "</a></div>" +
      '<ul class="col-span-8 grid grid-cols-2 gap-x-6 gap-y-1 content-start">' + links + "</ul>" +
      "</div></div>"
    );
  }

  function desktopNav(active) {
    return (
      '<nav aria-label="Main" class="hidden lg:block border-t border-line">' +
      '<ul class="max-w-site mx-auto px-8 flex items-stretch justify-between">' +
      NAV.map(function (item) {
        var cur = item.id === active;
        return (
          '<li class="static">' +
          '<button type="button" data-mega="mega-' + item.id + '" aria-expanded="false" aria-controls="mega-' + item.id + '"' +
          (cur ? ' aria-current="page"' : "") +
          ' class="relative flex items-center gap-1 py-3.5 text-[13.5px] font-medium ' + (cur ? "text-green-700" : "text-ink/80 hover:text-green-700") + '">' +
          item.label + ETC.icon("chevron", "h-3.5 w-3.5 opacity-60 transition") +
          (cur ? '<span class="absolute inset-x-0 -bottom-px h-[3px] bg-gold-500 rounded-t"></span>' : "") +
          "</button>" + megaPanel(item) + "</li>"
        );
      }).join("") +
      "</ul></nav>"
    );
  }

  function quickLinks() {
    var items = [
      ETC.portalLink("registration", ETC.icon("register", "h-4 w-4") + "Registration", "ql"),
      ETC.portalLink("admitCard", ETC.icon("card", "h-4 w-4") + "Roll Number Slip", "ql"),
      ETC.portalLink("results", ETC.icon("results", "h-4 w-4") + "Results", "ql"),
      '<a class="ql" href="faqs.html">' + ETC.icon("help", "h-4 w-4") + "Help &amp; FAQs</a>",
    ].map(function (a) {
      return "<li>" + a.replace(/class="ql"/, 'class="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-green-800 hover:bg-white hover:text-green-700"') + "</li>";
    }).join("");
    return (
      '<div class="bg-cream-50 border-y border-gold-300/60">' +
      '<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 h-11">' +
      '<span class="hidden sm:block text-[11px] font-semibold tracking-eyebrow uppercase text-gold-600 shrink-0">Quick links</span>' +
      '<ul class="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-2 px-2">' + items + "</ul></div></div>"
    );
  }

  function drawer(active) {
    var groups = NAV.map(function (item) {
      return (
        '<li class="border-b border-line">' +
        '<details class="group"' + (item.id === active ? " open" : "") + ">" +
        '<summary class="flex cursor-pointer list-none items-center justify-between py-3.5 font-medium text-ink">' + item.label +
        ETC.icon("chevron", "h-4 w-4 transition group-open:rotate-180") + "</summary>" +
        '<ul class="pb-3 pl-3">' +
        item.links.map(function (l) { return '<li><a class="block py-1.5 text-sm text-muted hover:text-green-700" href="' + l[1] + '">' + l[0] + "</a></li>"; }).join("") +
        "</ul></details></li>"
      );
    }).join("");
    return (
      '<div id="mobile-drawer" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true" aria-label="Site menu">' +
      '<div data-drawer-close class="absolute inset-0 bg-green-950/60"></div>' +
      '<div class="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-lift">' +
      '<div class="flex items-center justify-between px-5 h-16 border-b border-line">' +
      '<span class="font-serif text-lg text-green-700">Menu</span>' +
      '<button type="button" data-drawer-close class="p-2 -mr-2 text-ink" aria-label="Close menu">' + ETC.icon("close", "h-6 w-6") + "</button></div>" +
      '<ul class="px-5">' + groups + "</ul>" +
      '<div class="p-5"><a href="tests.html" class="flex justify-center rounded-md bg-green-700 px-4 py-3 font-semibold text-white">Find a Test</a></div>' +
      "</div></div>"
    );
  }

  ETC.renderHeader = function (page) {
    var active = ACTIVE[page] || page;
    return (
      '<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-green-700 focus:shadow-lift">Skip to main content</a>' +
      utilityBar() +
      '<header class="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-b border-line">' +
      '<div class="relative">' +
      '<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 h-[72px] sm:h-20 flex items-center justify-between gap-4">' +
      brand(false) +
      '<div class="flex shrink-0 items-center gap-1 sm:gap-3">' +
      '<img data-media="hecCrest" class="hidden md:block h-12 w-auto opacity-90" width="53" height="60">' +
      '<span class="hidden md:block h-10 w-px bg-line mx-1"></span>' +
      '<a href="resources.html" class="hidden sm:block p-2 rounded-full text-ink/70 hover:bg-mint-50 hover:text-green-700" aria-label="Search the site">' + ETC.icon("search") + "</a>" +
      '<a href="tests.html" class="hidden sm:inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Find a Test' + ETC.icon("arrow", "h-4 w-4") + "</a>" +
      '<button type="button" data-menu-toggle aria-controls="mobile-drawer" aria-expanded="false" class="lg:hidden p-2 -mr-2 text-ink" aria-label="Open menu">' + ETC.icon("menu", "h-6 w-6") + "</button>" +
      "</div></div>" +
      desktopNav(active) +
      "</div></header>" +
      quickLinks() +
      drawer(active)
    );
  };

  ETC.renderFooter = function () {
    var col = function (title, links) {
      return '<div><h2 class="text-xs font-semibold tracking-eyebrow uppercase text-gold-300">' + title + "</h2>" +
        '<ul class="mt-4 space-y-2.5 text-sm">' +
        links.map(function (l) { return '<li><a class="text-white/75 hover:text-white" href="' + l[1] + '">' + l[0] + "</a></li>"; }).join("") +
        "</ul></div>";
    };
    return (
      '<footer class="bg-green-900 text-white on-dark relative overflow-hidden">' +
      '<div class="absolute inset-0 pattern-dots opacity-60" aria-hidden="true"></div>' +
      '<div class="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">' +
      '<div class="grid gap-12 lg:grid-cols-12">' +
      '<div class="lg:col-span-4">' + brand(true) +
      '<p class="mt-6 text-sm leading-relaxed text-white/75 max-w-sm">Pakistan’s public-sector national testing body, providing standardized, centralized and secure assessment for education and professional opportunities.</p>' +
      '<p class="mt-6 font-serif italic text-gold-300">Merit · Transparency · Fairness · Quality</p></div>' +
      '<div class="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">' +
      col("About", [["About ETC", "about.html"], ["Governance", "about.html#governance"], ["Quality & Methods", "quality.html"], ["News & Notices", "news.html"]]) +
      col("Tests", [["LAT", "test.html?test=lat"], ["LAW-GAT", "test.html?test=law-gat"], ["HAT-General", "test.html?test=hat"], ["HAAT-Subject", "test.html?test=haat"], ["USAT", "test.html?test=usat"]]) +
      col("Candidates", [["Candidate Services", "candidate-services.html"], ["Resources", "resources.html"], ["Help & FAQs", "faqs.html"], ["Accessibility", "candidate-services.html#accessibility"]]) +
      '<div><h2 class="text-xs font-semibold tracking-eyebrow uppercase text-gold-300">Contact</h2>' +
      '<ul class="mt-4 space-y-3 text-sm text-white/75">' +
      '<li class="flex gap-2">' + ETC.icon("pin", "h-4 w-4 mt-0.5 shrink-0 text-gold-300") + "<span>Higher Education Commission, Islamabad <span class=\"text-white/50\">[address to be confirmed]</span></span></li>" +
      '<li class="flex gap-2">' + ETC.icon("phone", "h-4 w-4 mt-0.5 shrink-0 text-gold-300") + "<span>Helpline [to be provided]</span></li>" +
      '<li class="flex gap-2">' + ETC.icon("mail", "h-4 w-4 mt-0.5 shrink-0 text-gold-300") + "<span>Email [to be provided]</span></li>" +
      '<li><a class="inline-flex items-center gap-1.5 font-semibold text-white hover:text-gold-300" href="institutions.html#enquiry">Institutional enquiry' + ETC.icon("arrow", "h-4 w-4") + "</a></li>" +
      "</ul></div>" +
      "</div></div>" +
      '<div class="mt-14 pt-6 border-t border-white/15 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between text-xs text-white/60">' +
      "<p>© 2026 Education Testing Council, Higher Education Commission. All rights reserved.</p>" +
      '<ul class="flex flex-wrap gap-x-5 gap-y-2">' +
      '<li><a class="hover:text-white" href="candidate-services.html#policies">Privacy</a></li>' +
      '<li><a class="hover:text-white" href="candidate-services.html#policies">Terms of use</a></li>' +
      '<li><a class="hover:text-white" href="candidate-services.html#accessibility">Accessibility</a></li>' +
      '<li><a class="hover:text-white" href="candidate-services.html#unfair-means">Unfair means policy</a></li>' +
      "</ul></div></div></footer>"
    );
  };

  function mount() {
    var page = d.body.getAttribute("data-page") || "";
    var h = d.getElementById("site-header");
    var f = d.getElementById("site-footer");
    if (h) h.outerHTML = ETC.renderHeader(page);
    if (f) f.outerHTML = ETC.renderFooter();
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", mount);
  else mount();
})(window, document);
