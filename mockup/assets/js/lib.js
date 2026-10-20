/* Pure helpers over ETC.data: lookups, filters, formatting, validation. No DOM access. */
(function (w) {
  var ETC = (w.ETC = w.ETC || {});
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function norm(s) { return String(s == null ? "" : s).toLowerCase().trim(); }
  function byNewest(a, b) { return a.published < b.published ? 1 : a.published > b.published ? -1 : 0; }

  ETC.getTest = function (slug) {
    var list = (ETC.data && ETC.data.tests) || [];
    for (var i = 0; i < list.length; i++) if (list[i].slug === slug) return list[i];
    return null;
  };

  ETC.getNotice = function (id) {
    var list = (ETC.data && ETC.data.notices) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };

  ETC.filterNotices = function (list, f) {
    f = f || {};
    var q = norm(f.q);
    return list.filter(function (n) {
      if (f.type && n.type !== f.type) return false;
      if (f.test && n.test !== f.test) return false;
      if (q && norm(n.title + " " + n.summary + " " + n.test).indexOf(q) === -1) return false;
      return true;
    }).sort(byNewest);
  };

  ETC.filterResources = function (list, f) {
    f = f || {};
    var q = norm(f.q);
    return list.filter(function (r) {
      if (f.type && r.type !== f.type) return false;
      if (f.test && r.test !== f.test) return false;
      if (q && norm(r.title + " " + r.type + " " + r.test).indexOf(q) === -1) return false;
      return true;
    }).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  };

  ETC.searchFaqs = function (list, q, category) {
    q = norm(q);
    return list.filter(function (f) {
      if (category && f.category !== category) return false;
      return !q || norm(f.q + " " + f.a).indexOf(q) !== -1;
    });
  };

  ETC.formatFee = function (n) {
    return n == null ? "By agreement" : "Rs. " + Number(n).toLocaleString("en-US");
  };

  ETC.formatDate = function (iso) {
    var p = String(iso).split("-");
    return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0];
  };

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* fields: [{ name, value, required?, type?: "email"|"number", label? }] */
  ETC.validateForm = function (fields) {
    var errors = {};
    fields.forEach(function (f) {
      var v = String(f.value == null ? "" : f.value).trim();
      var label = f.label || "This field";
      if (f.required && !v) errors[f.name] = label + " is required.";
      else if (v && f.type === "email" && !EMAIL.test(v)) errors[f.name] = "Enter an email address like name@example.com.";
      else if (v && f.type === "number" && !(Number(v) > 0)) errors[f.name] = "Enter a number greater than zero.";
    });
    return { valid: Object.keys(errors).length === 0, errors: errors };
  };
})(window);
