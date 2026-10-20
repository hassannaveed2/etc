/* Behaviours, attached by data-* attributes. Runs after partials.js has mounted the chrome. */
(function (w, d) {
  var ETC = (w.ETC = w.ETC || {});
  var reduceMotion = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); };

  /* Images: <img data-media="key"> → CDN src, falling back once to the local copy. */
  function initMedia(root) {
    $$("img[data-media]", root).forEach(function (img) {
      var key = img.getAttribute("data-media");
      if (!ETC.media || !ETC.media[key]) return;
      if (!img.hasAttribute("alt")) img.alt = img.hasAttribute("data-decorative") ? "" : ETC.media[key].alt;
      img.addEventListener("error", function onErr() {
        img.removeEventListener("error", onErr);
        img.src = ETC.localUrl(key);
      });
      img.src = ETC.mediaUrl(key);
    });
  }

  /* Mega-menu: click to toggle, Escape / outside click closes, one open at a time. */
  function initMega() {
    var buttons = $$("[data-mega]");
    function closeAll(except) {
      buttons.forEach(function (b) {
        if (b === except) return;
        b.setAttribute("aria-expanded", "false");
        var p = d.getElementById(b.getAttribute("data-mega"));
        if (p) p.hidden = true;
      });
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = b.getAttribute("aria-expanded") === "true";
        closeAll(b);
        b.setAttribute("aria-expanded", String(!open));
        d.getElementById(b.getAttribute("data-mega")).hidden = open;
      });
    });
    d.addEventListener("click", function (e) {
      if (!e.target.closest("[data-mega-panel]")) closeAll();
    });
    d.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var open = buttons.filter(function (b) { return b.getAttribute("aria-expanded") === "true"; })[0];
      closeAll();
      if (open) open.focus();
    });
  }

  /* Mobile drawer with focus trap. */
  function initDrawer() {
    var toggle = d.querySelector("[data-menu-toggle]");
    var drawer = d.getElementById("mobile-drawer");
    if (!toggle || !drawer) return;
    function focusables() {
      return $$('a[href], button, summary, [tabindex]:not([tabindex="-1"])', drawer).filter(function (el) { return el.offsetParent !== null; });
    }
    function open() {
      drawer.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "true");
      d.body.style.overflow = "hidden";
      var f = focusables();
      if (f[0]) f[0].focus();
    }
    function close() {
      drawer.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
      d.body.style.overflow = "";
      toggle.focus();
    }
    toggle.addEventListener("click", open);
    $$("[data-drawer-close]", drawer).forEach(function (el) { el.addEventListener("click", close); });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      var f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* Reveal on scroll. */
  function initReveal(root) {
    var els = $$("[data-reveal]", root);
    if (reduceMotion || !("IntersectionObserver" in w)) return;
    d.documentElement.classList.add("js-motion");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Count-up numbers: <span data-counter="1852391" data-suffix="+">. Text holds the final value for no-JS. */
  function initCounters(root) {
    var els = $$("[data-counter]", root);
    var fmt = function (n) { return Math.round(n).toLocaleString("en-US"); };
    function run(el) {
      var target = Number(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = fmt(target) + suffix; return; }
      var start = null, dur = 1600;
      function step(t) {
        if (!start) start = t;
        var p = Math.min(1, (t - start) / dur);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in w)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Hero carousel: crossfade, autoplay with pause, prev/next, dots, arrow keys. */
  function initCarousels(root) {
    $$("[data-carousel]", root).forEach(function (car) {
      var slides = $$("[data-slide]", car);
      var dots = $$("[data-dot]", car);
      var live = car.querySelector("[data-carousel-live]");
      var pauseBtn = car.querySelector("[data-carousel-pause]");
      var i = 0, timer = null, playing = !reduceMotion;
      function show(n) {
        i = (n + slides.length) % slides.length;
        slides.forEach(function (s, k) {
          s.setAttribute("aria-hidden", String(k !== i));
          $$("a, button", s).forEach(function (el) { el.tabIndex = k === i ? 0 : -1; });
        });
        dots.forEach(function (dt, k) { dt.setAttribute("aria-current", String(k === i)); });
        if (live) live.textContent = "Slide " + (i + 1) + " of " + slides.length;
      }
      function play() { stop(); timer = setInterval(function () { show(i + 1); }, 7000); }
      function stop() { if (timer) clearInterval(timer); timer = null; }
      function setPlaying(p) {
        playing = p;
        if (pauseBtn) {
          pauseBtn.setAttribute("aria-label", p ? "Pause slideshow" : "Play slideshow");
          pauseBtn.innerHTML = ETC.icon(p ? "pause" : "play", "h-4 w-4");
        }
        p ? play() : stop();
      }
      car.querySelector("[data-carousel-prev]").addEventListener("click", function () { show(i - 1); if (playing) play(); });
      car.querySelector("[data-carousel-next]").addEventListener("click", function () { show(i + 1); if (playing) play(); });
      dots.forEach(function (dt, k) { dt.addEventListener("click", function () { show(k); if (playing) play(); }); });
      if (pauseBtn) pauseBtn.addEventListener("click", function () { setPlaying(!playing); });
      car.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") show(i - 1);
        if (e.key === "ArrowRight") show(i + 1);
      });
      car.addEventListener("focusin", stop);
      car.addEventListener("focusout", function () { if (playing) play(); });
      show(0);
      setPlaying(playing);
    });
  }

  /* Tabs (WAI-ARIA tabs pattern): [data-tabs] > [role=tablist] > [role=tab][aria-controls]. */
  function initTabs(root) {
    $$("[data-tabs]", root).forEach(function (wrap) {
      var tabs = $$('[role="tab"]', wrap);
      function select(t, focus) {
        tabs.forEach(function (x) {
          var on = x === t;
          x.setAttribute("aria-selected", String(on));
          x.tabIndex = on ? 0 : -1;
          var panel = d.getElementById(x.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        if (focus) t.focus();
        wrap.dispatchEvent(new CustomEvent("tabchange", { detail: { tab: t } }));
      }
      tabs.forEach(function (t, k) {
        t.addEventListener("click", function () { select(t); });
        t.addEventListener("keydown", function (e) {
          var n = e.key === "ArrowRight" || e.key === "ArrowDown" ? k + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? k - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
          if (n === null) return;
          e.preventDefault();
          select(tabs[(n + tabs.length) % tabs.length], true);
        });
      });
      var initial = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
      if (initial) select(initial);
    });
  }

  /* Accordion: [data-accordion] button[aria-controls]. */
  function initAccordions(root) {
    $$("[data-accordion] button[aria-controls]", root).forEach(function (btn) {
      if (btn._acc) return;
      btn._acc = true;
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        d.getElementById(btn.getAttribute("aria-controls")).hidden = open;
      });
    });
  }

  /* Forms: <form data-validate data-success-title="..." data-success-text="...">.
     Client-side validation with accessible errors; nothing is sent anywhere in the mockup. */
  function initForms(root) {
    $$("form[data-validate]", root).forEach(function (form) {
      if (form._v) return;
      form._v = true;
      form.setAttribute("novalidate", "");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var controls = $$("input[name], select[name], textarea[name]", form);
        var fields = controls.map(function (c) {
          var label = form.querySelector('label[for="' + c.id + '"]');
          return {
            name: c.name,
            value: c.value,
            required: c.required,
            type: c.type === "email" ? "email" : c.type === "number" ? "number" : null,
            label: label ? label.textContent.replace(/\*|\(optional\)/g, "").trim() : null,
          };
        });
        var res = ETC.validateForm(fields);
        var first = null;
        controls.forEach(function (c) {
          var errId = c.name + "-error";
          var old = d.getElementById(errId);
          if (old) old.remove();
          var desc = (c.getAttribute("aria-describedby") || "").split(" ").filter(function (x) { return x && x !== errId; });
          var msg = res.errors[c.name];
          if (msg) {
            var p = d.createElement("p");
            p.id = errId;
            p.className = "mt-1.5 text-sm font-medium text-red-700";
            p.textContent = msg;
            c.insertAdjacentElement("afterend", p);
            desc.push(errId);
            c.setAttribute("aria-invalid", "true");
            c.classList.add("border-red-600");
            if (!first) first = c;
          } else {
            c.removeAttribute("aria-invalid");
            c.classList.remove("border-red-600");
          }
          if (desc.length) c.setAttribute("aria-describedby", desc.join(" "));
          else c.removeAttribute("aria-describedby");
        });
        var summary = form.querySelector("[data-error-summary]");
        if (summary) {
          var n = Object.keys(res.errors).length;
          summary.hidden = res.valid;
          summary.textContent = n ? "Please correct " + n + (n === 1 ? " field" : " fields") + " below." : "";
        }
        if (!res.valid) { first.focus(); return; }
        var panel = d.createElement("div");
        panel.setAttribute("role", "status");
        panel.tabIndex = -1;
        panel.className = "rounded-2xl border border-green-700/30 bg-mint-50 p-8";
        panel.innerHTML =
          '<span class="grid h-12 w-12 place-items-center rounded-full bg-green-700 text-white">' + ETC.icon("check", "h-6 w-6") + "</span>" +
          '<h3 class="mt-4 font-serif text-2xl font-semibold text-green-700"></h3><p class="mt-2 text-ink/80"></p>' +
          '<p class="mt-4 text-xs text-muted">Mockup only — this form is not connected yet. In the live site, submissions are delivered securely to the designated ETC address.</p>';
        panel.querySelector("h3").textContent = form.getAttribute("data-success-title") || "Thank you";
        panel.querySelector("p").textContent = form.getAttribute("data-success-text") || "We have received your message.";
        form.replaceWith(panel);
        panel.focus();
      });
    });
  }

  /* "On this page" scrollspy: marks the link of the section currently in view. */
  function initScrollspy(root) {
    $$('nav[aria-label="On this page"]', root).forEach(function (nav) {
      var links = $$('a[href^="#"]', nav);
      var map = {};
      links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
      if (!("IntersectionObserver" in w)) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) {
            var on = a === map[en.target.id];
            if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
            a.classList.toggle("text-green-700", on);
            a.classList.toggle("font-semibold", on);
            a.classList.toggle("lg:border-gold-500", on);
          });
        });
      }, { rootMargin: "-35% 0px -60% 0px" });
      Object.keys(map).forEach(function (id) { var s = d.getElementById(id); if (s) io.observe(s); });
    });
  }

  /* Re-run element-level initialisers after a renderer injects new markup. */
  ETC.enhance = function (root) {
    initForms(root);
    initScrollspy(root);
    initMedia(root);
    initReveal(root);
    initCounters(root);
    initTabs(root);
    initAccordions(root);
  };

  ETC.$$ = $$;
  ETC.reduceMotion = reduceMotion;

  function init() {
    initMega();
    initDrawer();
    initCarousels(d);
    ETC.enhance(d);
    (ETC.pageInits || []).forEach(function (fn) { fn(); });
    /* Markup is injected after parsing and the Tailwind CDN styles it asynchronously,
       so re-apply the initial #hash scroll once layout has settled (and again on load). */
    if (location.hash.length > 1) {
      var toHash = function () {
        var target = d.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) target.scrollIntoView({ behavior: "instant" });
      };
      setTimeout(toHash, 150);
      w.addEventListener("load", function () { setTimeout(toHash, 50); });
    }
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
