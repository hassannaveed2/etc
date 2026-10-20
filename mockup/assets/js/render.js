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
})(window);
