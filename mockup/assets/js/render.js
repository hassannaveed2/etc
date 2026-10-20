/* HTML string renderers for data-driven content. Pure: they return strings and never touch the
   DOM, so they can be unit-tested. Page scripts mount the strings and call ETC.enhance(root). */
(function (w) {
  var ETC = (w.ETC = w.ETC || {});
  var R = (ETC.render = ETC.render || {});
  var icon = function (n, c) { return ETC.icon ? ETC.icon(n, c) : ""; };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  R.esc = esc;

  var STATUS = {
    open: { label: "Open", cls: "bg-status-open/10 text-status-open ring-status-open/30" },
    closing: { label: "Closing soon", cls: "bg-status-closing/10 text-status-closing ring-status-closing/30" },
    result: { label: "Result announced", cls: "bg-status-result/10 text-status-result ring-status-result/30" },
    closed: { label: "Closed", cls: "bg-status-closed/10 text-status-closed ring-status-closed/30" },
  };

  R.statusChip = function (status) {
    var s = STATUS[status] || STATUS.closed;
    return '<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ' + s.cls + '">' +
      '<span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>' + s.label + "</span>";
  };

  R.sampleChip = function () {
    return '<span class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold-100 text-gold-600" title="Sample content for the mockup">Sample</span>';
  };

  function testCode(slug) {
    var t = ETC.getTest ? ETC.getTest(slug) : null;
    return t ? t.code : "General";
  }

  /* One row in a notices list. */
  R.noticeRow = function (n) {
    var d = n.published.split("-");
    var mon = ETC.formatDate(n.published).split(" ")[1];
    return (
      '<li class="group relative flex gap-4 sm:gap-5 py-5 border-b border-line last:border-b-0">' +
      '<div class="shrink-0 w-14 text-center rounded-lg bg-mint-50 py-2" aria-hidden="true">' +
      '<span class="block font-serif text-2xl leading-none text-green-700">' + Number(d[2]) + "</span>" +
      '<span class="block mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">' + mon + "</span></div>" +
      '<div class="min-w-0 flex-1">' +
      '<div class="flex flex-wrap items-center gap-2 text-xs">' +
      '<span class="font-semibold uppercase tracking-wider text-gold-600">' + esc(n.type) + "</span>" +
      '<span class="text-line">•</span><span class="font-medium text-muted">' + esc(testCode(n.test)) + "</span>" +
      R.statusChip(n.status) + R.sampleChip() + "</div>" +
      '<h3 class="mt-1.5 font-semibold text-ink leading-snug group-hover:text-green-700">' +
      '<a href="notice.html?id=' + encodeURIComponent(n.id) + '" class="after:absolute after:inset-0">' + esc(n.title) + "</a></h3>" +
      '<p class="mt-1 text-sm text-muted line-clamp-2">' + esc(n.summary) + "</p>" +
      '<p class="mt-2 text-xs text-muted"><span class="sr-only">Published </span><time datetime="' + n.published + '">' + ETC.formatDate(n.published) + "</time>" +
      (n.deadline ? ' · <span class="font-medium text-ink">Deadline ' + ETC.formatDate(n.deadline) + "</span>" : "") + "</p>" +
      "</div>" +
      icon("arrow", "hidden sm:block h-5 w-5 self-center text-gold-500 transition group-hover:translate-x-1") +
      "</li>"
    );
  };

  /* Card in the tests directory. */
  R.testCard = function (t) {
    return (
      '<article class="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">' +
      '<div class="relative aspect-[16/10] overflow-hidden bg-mint-50">' +
      '<img data-media="' + t.image + '" data-decorative class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" width="640" height="400">' +
      '<span class="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 font-serif text-sm font-semibold text-green-700 shadow">' + esc(t.code) + "</span>" +
      '<span class="absolute right-4 top-4 rounded-full bg-green-900/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">' + esc(t.category) + "</span>" +
      "</div>" +
      '<div class="flex flex-1 flex-col p-6">' +
      '<h3 class="font-serif text-xl font-semibold text-ink leading-snug">' +
      '<a href="test.html?test=' + t.slug + '" class="after:absolute after:inset-0 group-hover:text-green-700">' + esc(t.name) + "</a></h3>" +
      '<p class="mt-2 mb-5 text-sm text-muted">' + esc(t.short) + "</p>" +
      '<dl class="mt-auto grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">' +
      '<div><dt class="text-xs text-muted">For</dt><dd class="font-medium text-ink">' + esc(t.level) + "</dd></div>" +
      '<div><dt class="text-xs text-muted">Fee*</dt><dd class="font-medium text-ink">' + ETC.formatFee(t.fee) + "</dd></div>" +
      '<div class="col-span-2"><dt class="text-xs text-muted">Frequency</dt><dd class="font-medium text-ink">' + esc(t.frequency) + "</dd></div>" +
      "</dl></div></article>"
    );
  };

  /* Compact upcoming-date row (homepage sidebar, candidate services). */
  R.scheduleItem = function (s) {
    var t = ETC.getTest(s.test);
    return (
      '<li class="flex items-start gap-3 py-3 border-b border-white/10 last:border-0">' +
      icon("calendar", "h-5 w-5 mt-0.5 shrink-0 text-gold-300") +
      '<div class="min-w-0"><p class="font-semibold text-white"><a class="hover:underline" href="test.html?test=' + t.slug + '">' + esc(s.session) + "</a></p>" +
      '<p class="text-sm text-white/70">Test ' + ETC.formatDate(s.testDate) + " · Registration closes " + ETC.formatDate(s.regCloses) + "</p></div></li>"
    );
  };

  R.feeNote = "As per ETC Institutional Profile 2026; always confirm in the official announcement.";

  var TYPE_ICON = { Syllabus: "file", "Sample paper": "register", Guide: "help", Policy: "shield" };

  /* Downloadable resource card (PDF placeholder links in the mockup). */
  R.resourceCard = function (r) {
    return (
      '<li class="group relative flex gap-4 rounded-xl border border-line bg-white p-5 hover:border-green-700 hover:shadow-card">' +
      '<span class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-mint-50 text-green-700">' + icon(TYPE_ICON[r.type] || "file", "h-5 w-5") + "</span>" +
      '<div class="min-w-0 flex-1">' +
      '<p class="text-xs font-semibold uppercase tracking-wider text-gold-600">' + esc(r.type) + " · " + esc(testCode(r.test)) + "</p>" +
      '<h3 class="mt-1 font-semibold text-ink leading-snug"><a href="#download-' + r.id + '" class="after:absolute after:inset-0 group-hover:text-green-700">' + esc(r.title) + "</a></h3>" +
      '<p class="mt-1 text-xs text-muted">PDF · ' + esc(r.size) + " · Updated " + ETC.formatDate(r.date) + "</p></div>" +
      icon("download", "h-5 w-5 shrink-0 self-center text-gold-500") + "</li>"
    );
  };

  function section(id, eyebrow, title, body) {
    return '<section id="' + id + '" aria-labelledby="' + id + '-h" class="scroll-mt-40 border-b border-line py-12 first:pt-0 last:border-0">' +
      '<p class="eyebrow">' + eyebrow + "</p>" +
      '<h2 id="' + id + '-h" class="mt-3 font-serif text-3xl font-semibold text-green-700">' + title + "</h2>" + body + "</section>";
  }

  var LEVEL_NAMES = ["Knowledge", "Understanding", "Application", "Analysis", "Evaluation", "Create"];
  var LEVEL_COLORS = ["#DCEBE2", "#9CC7AE", "#2E7D5B", "#1F5E45", "#B8913A", "#7A5C1E"];

  function bloomBar(levels) {
    var total = levels.reduce(function (a, b) { return a + b; }, 0);
    var segs = levels.map(function (v, k) {
      return v ? '<span title="' + LEVEL_NAMES[k] + ": " + v + '" style="width:' + (v / total * 100).toFixed(2) + "%;background:" + LEVEL_COLORS[k] + '" class="h-full"></span>' : "";
    }).join("");
    var legend = levels.map(function (v, k) {
      return '<li class="flex items-center gap-2"><span class="h-3 w-3 rounded-sm ring-1 ring-black/5" style="background:' + LEVEL_COLORS[k] + '"></span>' + LEVEL_NAMES[k] + ' <span class="font-semibold text-ink">' + v + "</span></li>";
    }).join("");
    return '<div class="mt-4 flex h-4 overflow-hidden rounded-full ring-1 ring-line" role="img" aria-label="Thinking-level profile: ' +
      levels.map(function (v, k) { return LEVEL_NAMES[k] + " " + v; }).join(", ") + '">' + segs + "</div>" +
      '<ul class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted" aria-hidden="true">' + legend + "</ul>";
  }

  function usatExtras(t) {
    var tabs = t.categories.map(function (c, k) {
      return '<button type="button" role="tab" id="tab-' + c.code + '" aria-controls="panel-' + c.code + '" aria-selected="' + (k === 0) + '" ' +
        'class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-muted ring-1 ring-line aria-selected:bg-green-700 aria-selected:text-white aria-selected:ring-green-700 hover:text-green-700">' + c.code + "</button>";
    }).join("");
    var panels = t.categories.map(function (c) {
      return '<div role="tabpanel" id="panel-' + c.code + '" aria-labelledby="tab-' + c.code + '" tabindex="0" class="rounded-xl border border-line bg-white p-6">' +
        '<p class="text-sm text-muted">' + esc(c.stream) + "</p>" +
        '<p class="mt-1 font-serif text-2xl text-green-700">' + esc(c.code) + "</p>" +
        '<p class="mt-4 text-sm"><span class="font-semibold">Discipline-specific subjects (30 MCQs):</span> ' + esc(c.subjects) + "</p>" +
        '<p class="mt-6 text-sm font-semibold">Thinking-level profile of all 75 MCQs</p>' + bloomBar(c.levels) + "</div>";
    }).join("");
    var head = '<tr><th scope="col">Content area</th>' + t.tos.levels.map(function (l) { return '<th scope="col" class="num">' + l + "</th>"; }).join("") + '<th scope="col" class="num">Total</th></tr>';
    var rows = t.tos.rows.map(function (r) {
      var cls = r.subtotal ? ' class="font-semibold bg-cream-50"' : "";
      return "<tr" + cls + "><td" + (r.subtotal ? ' style="background:#FAF6EA"' : "") + ">" + esc(r.area) + "</td>" +
        r.v.map(function (v) { return '<td class="num"' + (r.subtotal ? ' style="background:#FAF6EA"' : "") + ">" + v + "</td>"; }).join("") +
        '<td class="num"' + (r.subtotal ? ' style="background:#FAF6EA"' : "") + ">" + r.total + "</td></tr>";
    }).join("");
    return (
      '<h3 class="mt-10 font-serif text-xl font-semibold text-ink">Six categories, matched to your intermediate stream</h3>' +
      '<div data-tabs class="mt-5"><div role="tablist" aria-label="USAT categories" class="flex gap-2 overflow-x-auto no-scrollbar pb-1">' + tabs + "</div>" +
      '<div class="mt-4">' + panels + "</div></div>" +
      '<h3 class="mt-10 font-serif text-xl font-semibold text-ink">Common Core — Table of Specifications (45 MCQs)</h3>' +
      '<div class="table-wrap mt-4" tabindex="0" role="region" aria-label="Common Core table of specifications"><table class="data-table"><thead>' + head + "</thead><tbody>" + rows + "</tbody></table></div>" +
      '<p class="mt-2 text-xs text-muted">K = Knowledge, U = Understanding, Ap = Application, An = Analysis, E = Evaluation, C = Create.</p>'
    );
  }

  function portalCard(key, title, text) {
    return '<li class="rounded-xl border border-line bg-white p-6">' +
      '<h3 class="font-semibold text-ink">' + title + "</h3>" +
      '<p class="mt-1 text-sm text-muted">' + text + "</p>" +
      ETC.portalLink(key, ETC.portal[key].label === "Registration" ? "Register on the portal " : "Open the portal ", "mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900") +
      "</li>";
  }

  /* Full test-detail page body (one template for all six tests, slide 5). */
  R.testDetail = function (slug) {
    var t = slug ? ETC.getTest(slug) : null;
    if (!t) return { notFound: true };

    var D = ETC.data;
    var notices = D.notices.filter(function (n) { return t.notices.indexOf(n.id) !== -1; });
    var resources = D.resources.filter(function (r) { return t.resources.indexOf(r.id) !== -1; });
    var sched = D.schedule.filter(function (s) { return s.test === t.slug; })[0];
    var isCustom = t.slug === "customized";

    var hero =
      '<section class="relative isolate overflow-hidden bg-green-900 text-white on-dark">' +
      '<img data-media="' + t.image + '" data-decorative class="absolute inset-y-0 right-0 h-full w-full lg:w-[55%] object-cover" width="2000" height="1493">' +
      '<div class="absolute inset-0 bg-gradient-to-r from-green-900 via-green-900/95 lg:via-green-900/90 to-green-900/40" aria-hidden="true"></div>' +
      '<div class="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">' +
      '<nav aria-label="Breadcrumb" class="text-sm text-white/70"><ol class="flex flex-wrap items-center gap-2">' +
      '<li><a class="hover:text-white" href="index.html">Home</a></li><li aria-hidden="true">/</li>' +
      '<li><a class="hover:text-white" href="tests.html">Tests &amp; Assessments</a></li><li aria-hidden="true">/</li>' +
      '<li aria-current="page" class="text-white">' + esc(t.code) + "</li></ol></nav>" +
      '<div class="mt-8 max-w-2xl">' +
      '<p class="eyebrow">' + esc(t.category) + " · " + esc(t.level) + "</p>" +
      '<p class="mt-4"><span class="inline-block rounded-md bg-gold-500 px-3 py-1 font-serif text-lg font-semibold text-green-950">' + esc(t.code) + "</span></p>" +
      '<h1 class="mt-4 font-serif text-4xl sm:text-5xl font-semibold leading-tight">' + esc(t.name) + "</h1>" +
      '<p class="mt-4 text-lg text-white/80">' + esc(t.short) + "</p>" +
      '<dl class="mt-8 grid grid-cols-3 gap-4 max-w-xl border-t border-white/15 pt-6">' +
      '<div><dt class="text-xs uppercase tracking-wider text-white/60">Fee*</dt><dd class="mt-1 font-serif text-lg sm:text-2xl">' + ETC.formatFee(t.fee) + "</dd></div>" +
      '<div><dt class="text-xs uppercase tracking-wider text-white/60">Frequency</dt><dd class="mt-1 font-serif text-lg sm:text-2xl">' + esc(t.frequency) + "</dd></div>" +
      '<div><dt class="text-xs uppercase tracking-wider text-white/60">For</dt><dd class="mt-1 font-serif text-lg sm:text-2xl break-words">' + esc(t.level) + "</dd></div></dl>" +
      '<div class="mt-8 flex flex-wrap gap-3">' +
      (isCustom
        ? '<a href="institutions.html#enquiry" class="rounded-md bg-gold-500 px-5 py-3 font-semibold text-green-950 hover:bg-gold-300">Submit an enquiry</a>'
        : ETC.portalLink("registration", "Register ", "inline-flex items-center gap-2 rounded-md bg-gold-500 px-5 py-3 font-semibold text-green-950 hover:bg-gold-300")) +
      '<a href="#pattern" class="rounded-md border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">Pattern &amp; syllabus</a>' +
      "</div></div></div></section>";

    var navItems = [["overview", "Overview"], ["eligibility", "Eligibility"], ["pattern", "Pattern & syllabus"], ["fees", "Fees & notices"], ["schedule", "Schedule & preparation"], ["services", isCustom ? "Get started" : "Register & results"]];
    var nav =
      '<nav aria-label="On this page" class="lg:sticky lg:top-40">' +
      '<p class="text-xs font-semibold uppercase tracking-eyebrow text-gold-600">On this page</p>' +
      '<ul class="mt-4 flex gap-2 overflow-x-auto no-scrollbar lg:block lg:space-y-1 lg:border-l lg:border-line">' +
      navItems.map(function (n) {
        return '<li><a href="#' + n[0] + '" class="block whitespace-nowrap rounded-full lg:rounded-none px-3 py-1.5 lg:py-2 lg:pl-4 lg:-ml-px lg:border-l-2 lg:border-transparent text-sm ring-1 ring-line lg:ring-0 text-muted hover:text-green-700 hover:lg:border-gold-500">' + n[1] + "</a></li>";
      }).join("") + "</ul></nav>";

    var patternRows = t.pattern.sections.map(function (s) {
      return "<tr><td class=\"font-medium\">" + esc(s.name) + '</td><td class="num">' + (s.items == null ? '<span class="text-muted">As published</span>' : esc(s.items)) + "</td><td>" + esc(s.detail) + "</td></tr>";
    }).join("");

    var body =
      section("overview", "Overview", "Purpose of the test",
        '<p class="mt-5 text-lg leading-relaxed text-ink/90">' + esc(t.purpose) + "</p>" +
        '<div class="mt-6 rounded-xl border-l-4 border-gold-500 bg-mint-50 p-5"><p class="font-semibold text-green-700">How results are used</p><p class="mt-1 text-sm text-ink/80">' + esc(t.resultsUse) + "</p></div>") +
      section("eligibility", "Eligibility", "Who should take it",
        '<dl class="mt-6 grid gap-4 sm:grid-cols-2">' +
        '<div class="rounded-xl border border-line p-5"><dt class="text-sm font-semibold text-gold-600">Eligibility</dt><dd class="mt-2 text-ink/90">' + esc(t.eligibility) + "</dd></div>" +
        '<div class="rounded-xl border border-line p-5"><dt class="text-sm font-semibold text-gold-600">Target candidates</dt><dd class="mt-2 text-ink/90">' + esc(t.audience) + "</dd></div>" +
        '<div class="rounded-xl border border-line p-5"><dt class="text-sm font-semibold text-gold-600">What it measures</dt><dd class="mt-2 text-ink/90">' + esc(t.measures) + "</dd></div>" +
        '<div class="rounded-xl border border-line p-5"><dt class="text-sm font-semibold text-gold-600">Frequency</dt><dd class="mt-2 text-ink/90">' + esc(t.frequency) + ". " + esc(t.frequencyNote) + "</dd></div>" +
        "</dl>") +
      section("pattern", "Test pattern", "Pattern and syllabus",
        '<div class="table-wrap mt-6" tabindex="0" role="region" aria-label="' + esc(t.code) + ' test pattern"><table class="data-table"><thead><tr><th scope="col">Section</th><th scope="col" class="num">Items / marks</th><th scope="col">What it covers</th></tr></thead><tbody>' + patternRows + "</tbody></table></div>" +
        '<p class="mt-3 text-sm text-muted">' + esc(t.pattern.note) + "</p>" +
        (t.categories ? usatExtras(t) : "") +
        '<h3 class="mt-10 font-serif text-xl font-semibold text-ink">Syllabus areas</h3>' +
        '<ul class="mt-4 grid gap-2 sm:grid-cols-2">' + t.syllabus.map(function (s) { return '<li class="flex gap-3 rounded-lg bg-mint-50 px-4 py-3 text-sm">' + icon("check", "h-5 w-5 shrink-0 text-green-700") + esc(s) + "</li>"; }).join("") + "</ul>" +
        '<div class="mt-8 rounded-xl bg-green-900 p-6 text-white on-dark"><p class="text-sm font-semibold text-gold-300">How we make sure scores are reliable</p><p class="mt-2 text-sm text-white/80">' + esc(t.reliability) + '</p><a href="quality.html" class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-gold-300">Quality &amp; methods' + icon("arrow", "h-4 w-4") + "</a></div>") +
      section("fees", "Fees & notices", "Fee and official notices",
        '<div class="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gold-300 bg-cream-50 p-6">' +
        '<p class="font-serif text-4xl font-semibold text-green-700">' + ETC.formatFee(t.fee) + "</p>" +
        '<p class="text-sm text-ink/80 sm:border-l sm:border-gold-300 sm:pl-4">' + (isCustom ? "Fees are agreed with each client institution." : "Per candidate. " + R.feeNote) + "</p></div>" +
        (notices.length ? '<ul class="mt-6 border-t border-line">' + notices.map(R.noticeRow).join("") + "</ul>" : '<p class="mt-6 text-muted">There are no current notices for this test.</p>') +
        '<a href="news.html?test=' + t.slug + '" class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900">All ' + esc(t.code) + " notices" + icon("arrow", "h-4 w-4") + "</a>") +
      section("schedule", "Schedule & preparation", "Dates and preparation material",
        (sched
          ? '<div class="mt-6 grid gap-4 sm:grid-cols-3">' +
            '<div class="rounded-xl bg-mint-50 p-5"><p class="text-xs uppercase tracking-wider text-muted">Next session</p><p class="mt-1 font-semibold">' + esc(sched.session) + "</p>" + R.sampleChip() + "</div>" +
            '<div class="rounded-xl bg-mint-50 p-5"><p class="text-xs uppercase tracking-wider text-muted">Registration closes</p><p class="mt-1 font-serif text-2xl text-green-700">' + ETC.formatDate(sched.regCloses) + "</p></div>" +
            '<div class="rounded-xl bg-mint-50 p-5"><p class="text-xs uppercase tracking-wider text-muted">Test date</p><p class="mt-1 font-serif text-2xl text-green-700">' + ETC.formatDate(sched.testDate) + "</p></div></div>"
          : '<p class="mt-6 text-muted">' + esc(t.frequencyNote) + "</p>") +
        (resources.length ? '<ul class="mt-6 grid gap-3 sm:grid-cols-2">' + resources.map(R.resourceCard).join("") + "</ul>" : "")) +
      section("services", isCustom ? "Get started" : "Candidate services", isCustom ? "Plan a customized assessment" : "Registration and results",
        (isCustom
          ? '<p class="mt-5 text-ink/90">Tell us about the posts or programme, the number of candidates and your timeline. ETC will arrange a requirement study and propose a blueprint and paper pattern.</p>' +
            '<a href="institutions.html#enquiry" class="mt-6 inline-flex rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">Submit an institutional enquiry</a>'
          : '<ul class="mt-6 grid gap-4 sm:grid-cols-3">' +
            portalCard("registration", "Register", "Apply and pay on the official ETC portal before the deadline.") +
            portalCard("admitCard", "Roll number slip", "Download your admit card with test centre, date and time.") +
            portalCard("results", "Results", "View and download your result after it is announced.") + "</ul>" +
            '<p class="mt-5 flex gap-3 rounded-xl bg-cream-50 p-4 text-sm text-ink/80">' + icon("shield", "h-5 w-5 shrink-0 text-gold-600") +
            "<span>Registration, payments, admit cards and results are handled only by the official ETC/HEC portal. This website never asks for payment details.</span></p>"));

    var html = hero +
      '<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid gap-10 lg:grid-cols-12">' +
      '<aside class="lg:col-span-3 min-w-0">' + nav + "</aside>" +
      '<div class="lg:col-span-9 min-w-0">' + body +
      '<p class="mt-2 text-xs text-muted">*' + R.feeNote + "</p></div></div>";

    return { title: (isCustom ? t.name : t.code + " — " + t.name) + " | ETC", html: html };
  };

  /* Notice detail page body. */
  R.noticeDetail = function (id) {
    var n = id ? ETC.getNotice(id) : null;
    if (!n) return { notFound: true };
    var t = ETC.getTest(n.test);
    var related = ETC.filterNotices(ETC.data.notices, { test: n.test }).filter(function (x) { return x.id !== n.id; }).slice(0, 3);

    var html =
      '<section class="relative overflow-hidden bg-green-900 text-white on-dark"><div class="absolute inset-0 pattern-dots" aria-hidden="true"></div>' +
      '<div class="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">' +
      '<nav aria-label="Breadcrumb" class="text-sm text-white/70"><ol class="flex flex-wrap items-center gap-2">' +
      '<li><a class="hover:text-white" href="index.html">Home</a></li><li aria-hidden="true">/</li>' +
      '<li><a class="hover:text-white" href="news.html">News &amp; Notices</a></li><li aria-hidden="true">/</li>' +
      '<li aria-current="page" class="text-white">' + esc(n.type) + " notice</li></ol></nav>" +
      '<div class="mt-8 flex flex-wrap items-center gap-2 text-sm"><span class="font-semibold uppercase tracking-wider text-gold-300">' + esc(n.type) + "</span>" +
      '<span class="text-white/40">•</span><span>' + esc(t ? t.code : "General") + "</span>" +
      '<span class="rounded-full bg-white px-0.5">' + R.statusChip(n.status) + "</span>" + R.sampleChip() + "</div>" +
      '<h1 class="mt-4 max-w-4xl font-serif text-3xl sm:text-5xl font-semibold leading-tight">' + esc(n.title) + "</h1>" +
      '<p class="mt-4 max-w-3xl text-lg text-white/80">' + esc(n.summary) + "</p></div></section>" +

      '<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 lg:grid-cols-12">' +
      '<article class="lg:col-span-8 min-w-0">' +
      '<dl class="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-2xl bg-mint-50 p-5 ring-1 ring-line">' +
      '<div><dt class="text-xs uppercase tracking-wider text-muted">Published</dt><dd class="mt-1 font-semibold"><time datetime="' + n.published + '">' + ETC.formatDate(n.published) + "</time></dd></div>" +
      (n.deadline ? '<div><dt class="text-xs uppercase tracking-wider text-muted">Deadline</dt><dd class="mt-1 font-semibold text-status-closing"><time datetime="' + n.deadline + '">' + ETC.formatDate(n.deadline) + "</time></dd></div>" : "") +
      '<div><dt class="text-xs uppercase tracking-wider text-muted">Related test</dt><dd class="mt-1 font-semibold">' +
      (t ? '<a class="text-green-700 hover:underline" href="test.html?test=' + t.slug + '">' + esc(t.code) + "</a>" : "General") + "</dd></div></dl>" +
      '<div class="mt-8 space-y-5 text-lg leading-relaxed text-ink/90">' + n.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" +
      '<h2 class="mt-10 font-serif text-2xl font-semibold text-green-700">Attachments</h2>' +
      '<ul class="mt-4 grid gap-3 sm:grid-cols-2">' + n.attachments.map(function (a, k) {
        return '<li class="group relative flex items-center gap-4 rounded-xl border border-line p-4 hover:border-green-700">' +
          '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint-50 text-green-700">' + icon("file", "h-5 w-5") + "</span>" +
          '<span class="min-w-0 flex-1"><a href="#attachment-' + k + '" class="font-semibold leading-snug after:absolute after:inset-0 group-hover:text-green-700">' + esc(a.label) + "</a>" +
          '<span class="block text-xs text-muted">PDF · ' + esc(a.size) + "</span></span>" + icon("download", "h-5 w-5 text-gold-500") + "</li>";
      }).join("") + "</ul>" +
      '<div class="mt-10 flex flex-wrap gap-3" data-noprint>' +
      '<button type="button" data-share data-share-title="' + esc(n.title) + '" class="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50">' + icon("external", "h-4 w-4") + "Share notice</button>" +
      '<button type="button" data-print class="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50">' + icon("print", "h-4 w-4") + "Print notice</button>" +
      '<p data-share-status role="status" class="w-full text-sm text-muted"></p>' +
      '<a href="news.html" class="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50">All notices</a></div>' +
      "</article>" +
      '<aside class="lg:col-span-4 min-w-0" aria-labelledby="related-h">' +
      (t && t.slug !== "customized"
        ? '<div class="rounded-2xl bg-green-900 p-6 text-white on-dark"><p class="text-sm font-semibold text-gold-300">Ready to apply?</p>' +
          '<p class="mt-2 text-sm text-white/80">Registration and payment are handled only on the official ETC portal.</p>' +
          ETC.portalLink("registration", "Register for " + esc(t.code) + " ", "mt-4 inline-flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-semibold text-green-950 hover:bg-gold-300") + "</div>"
        : "") +
      '<h2 id="related-h" class="mt-8 font-serif text-xl font-semibold text-green-700">Related notices</h2>' +
      (related.length
        ? '<ul class="mt-3 divide-y divide-line">' + related.map(function (r) {
            return '<li class="py-3"><a class="font-semibold leading-snug hover:text-green-700" href="notice.html?id=' + encodeURIComponent(r.id) + '">' + esc(r.title) + "</a>" +
              '<span class="block text-xs text-muted">' + ETC.formatDate(r.published) + "</span></li>";
          }).join("") + "</ul>"
        : '<p class="mt-3 text-sm text-muted">No related notices.</p>') +
      "</aside></div>";

    return { title: n.title + " | ETC", html: html };
  };

  R.noticeNotFound = function () {
    return '<section class="relative overflow-hidden bg-green-900 text-white on-dark"><div class="absolute inset-0 pattern-dots" aria-hidden="true"></div>' +
      '<div class="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-20"><p class="eyebrow">News &amp; Notices</p>' +
      '<h1 class="mt-3 font-serif text-4xl sm:text-5xl font-semibold">Notice not found</h1>' +
      '<p class="mt-4 max-w-xl text-lg text-white/80">This notice may have been withdrawn or the link may be incomplete.</p>' +
      '<a href="news.html" class="mt-8 inline-flex rounded-md bg-gold-500 px-5 py-3 font-semibold text-green-950 hover:bg-gold-300">Browse all notices</a></div></section>';
  };

  R.testNotFound = function () {
    return '<section class="relative overflow-hidden bg-green-900 text-white on-dark"><div class="absolute inset-0 pattern-dots" aria-hidden="true"></div>' +
      '<div class="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-20"><p class="eyebrow">Tests &amp; Assessments</p>' +
      '<h1 class="mt-3 font-serif text-4xl sm:text-5xl font-semibold">Test not found</h1>' +
      '<p class="mt-4 max-w-xl text-lg text-white/80">We couldn’t find that test. It may have been renamed, or the link may be incomplete.</p>' +
      '<a href="tests.html" class="mt-8 inline-flex rounded-md bg-gold-500 px-5 py-3 font-semibold text-green-950 hover:bg-gold-300">Browse all tests</a></div></section>';
  };
})(window);
