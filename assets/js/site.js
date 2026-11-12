/* Layla Aletheia Rose — site behaviour
   1. "Ask this" cards on Home carry a sample question into the Contact form.
   2. The Contact form is checked in the browser, then opens WhatsApp with the
      enquiry written out. The website itself stores and sends nothing.
*/
(function () {
  "use strict";

  var QUESTIONS = {
    year: "Show me the major events and undercurrents that will potentially affect my life over the next twelve months.",
    timing: "Within what timeframe (weeks or months) is this specific situation most likely to reach its peak or resolve?",
    decision: "If I commit to [specific job offer / project / educational program], how will that choice potentially unfold over the next year?",
    work: "Will remaining in my current employment over the next six months serve my long-term stability, or is it wiser to seek a new direction?",
    impasse: "What is the underlying cause of the disruption or impasse in [specific situation], and what is the most constructive action to resolve it?",
    daily: "What patterns in my daily life deserve a closer look right now?",
    relationship: "How will my relationship with [specific person] develop over the next twelve months, and what dynamics need honest attention?",
    home: "Show me the hidden factors, vulnerabilities, or undercurrents currently influencing my home and living environment."
  };
  var STORE_KEY = "lar-question";

  function store(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }
  function recall(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function forget(key) {
    try { window.sessionStorage.removeItem(key); } catch (e) { /* storage unavailable */ }
  }

  /* ---------- Home: remember which question was chosen ---------- */
  document.querySelectorAll("[data-question]").forEach(function (link) {
    link.addEventListener("click", function () {
      store(STORE_KEY, link.getAttribute("data-question"));
    });
  });
  // "Ask for this reading" cards carry the chosen reading into the form.
  var READING_KEY = "lar-reading";
  document.querySelectorAll("[data-reading]").forEach(function (link) {
    link.addEventListener("click", function () {
      store(READING_KEY, link.getAttribute("data-reading"));
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("enquiry-form");
  if (!form) return;

  var fields = {
    name: document.getElementById("enquiry-name"),
    phone: document.getElementById("enquiry-phone"),
    email: document.getElementById("enquiry-email"),
    question: document.getElementById("enquiry-question"),
    age: document.getElementById("enquiry-age"),
    consent: document.getElementById("enquiry-consent")
  };
  var summary = document.getElementById("enquiry-errors");
  var summaryList = document.getElementById("enquiry-errors-list");
  var counter = document.getElementById("enquiry-counter");
  var status = document.getElementById("enquiry-status");
  var prefillNote = document.getElementById("enquiry-prefill");
  var max = parseInt(fields.question.getAttribute("maxlength"), 10) || 1500;

  // Carry a chosen sample question into the form.
  var params = new URLSearchParams(window.location.search);
  var chosen = params.get("q") || recall(STORE_KEY);
  if (chosen && QUESTIONS[chosen] && !fields.question.value) {
    fields.question.value = QUESTIONS[chosen];
    if (prefillNote) prefillNote.hidden = false;
  }
  forget(STORE_KEY);

  // Pre-select the reading chosen on a reading card.
  var chosenReading = params.get("reading") || recall(READING_KEY);
  var readingInput = chosenReading && /^[a-z]+$/.test(chosenReading) ? document.getElementById("reading-" + chosenReading) : null;
  if (readingInput && readingInput.name === "reading") readingInput.checked = true;
  forget(READING_KEY);

  function updateCounter() {
    if (counter) counter.textContent = fields.question.value.length + " / " + max;
  }
  fields.question.addEventListener("input", updateCounter);
  updateCounter();

  /* Each check returns "" when the field is fine, or a message saying exactly what to fix. */
  var CHECKS = {
    name: function () {
      return fields.name.value.trim() ? "" : "Please enter your name.";
    },
    phone: function () {
      var v = fields.phone.value.trim();
      if (!v) return "Please enter your contact number.";
      var digits = v.replace(/\D/g, "");
      if (!/^[+0-9()\-.\s]+$/.test(v) || digits.length < 7 || digits.length > 15) {
        return "Please enter a full contact number, for example +44 7700 900123.";
      }
      return "";
    },
    email: function () {
      var v = fields.email.value.trim();
      if (!v) return "Please enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a complete email address, for example name@example.com.";
      return "";
    },
    question: function () {
      return fields.question.value.trim() ? "" : "Please write a few words about what you’d like to explore.";
    },
    age: function () {
      return fields.age.checked ? "" : "Please tick the box to confirm you are 18 or over.";
    },
    consent: function () {
      return fields.consent.checked ? "" : "Please tick the box so I can use what you share to reply.";
    }
  };
  var ORDER = ["name", "phone", "email", "question", "age", "consent"];
  var flagged = {}; // fields currently showing an error, by key

  function setError(key, message) {
    var input = fields[key];
    var error = document.getElementById(input.id + "-error");
    var wrap = input.closest(".field");
    if (message) {
      flagged[key] = message;
      input.setAttribute("aria-invalid", "true");
      if (wrap) wrap.classList.add("field--error");
      if (error) {
        error.innerHTML = "";
        var tag = document.createElement("span");
        tag.className = "visually-hidden";
        tag.textContent = "Error: ";
        error.appendChild(tag);
        error.appendChild(document.createTextNode(message));
        error.hidden = false;
      }
    } else {
      delete flagged[key];
      input.removeAttribute("aria-invalid");
      if (wrap) wrap.classList.remove("field--error");
      if (error) { error.textContent = ""; error.hidden = true; }
    }
  }

  // The summary at the top of the form lists every part still to fill in, each linked to its field.
  function renderSummary() {
    if (!summary || !summaryList) return;
    summaryList.innerHTML = "";
    ORDER.forEach(function (key) {
      if (!flagged[key]) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + fields[key].id;
      a.textContent = flagged[key];
      a.addEventListener("click", function (e) {
        e.preventDefault();
        fields[key].focus();
        fields[key].scrollIntoView({ block: "center" });
      });
      li.appendChild(a);
      summaryList.appendChild(li);
    });
    summary.hidden = !summaryList.children.length;
  }

  function validate() {
    var problems = [];
    ORDER.forEach(function (key) {
      var message = CHECKS[key]();
      setError(key, message);
      if (message) problems.push(fields[key]);
    });
    renderSummary();
    return problems;
  }

  function compose() {
    var format = form.querySelector('input[name="format"]:checked');
    var reading = form.querySelector('input[name="reading"]:checked');
    var lines = ["Hello Layla, I’d like to enquire about a reading.", ""];
    lines.push("Name: " + fields.name.value.trim());
    lines.push("Contact number: " + fields.phone.value.trim());
    lines.push("Email: " + fields.email.value.trim());
    if (reading) lines.push("Interested in: " + reading.value);
    if (format) lines.push("Preferred format: " + format.value);
    lines.push("", "What I’d like to explore:", fields.question.value.trim(), "");
    lines.push("I confirm I am 18 or over.");
    lines.push("(Sent from laylaaletheiarose.com)");
    return lines.join("\n");
  }

  function show(nodes) {
    status.innerHTML = "";
    nodes.forEach(function (n) { status.appendChild(n); });
    status.hidden = false;
  }
  function para(text) {
    var p = document.createElement("p");
    p.textContent = text;
    return p;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var problems = validate();
    if (problems.length) {
      if (status) status.hidden = true;
      if (summary) {
        summary.focus({ preventScroll: true });
        summary.scrollIntoView({ block: "start", behavior: "smooth" });
      } else {
        problems[0].focus();
      }
      return;
    }

    var message = compose();
    var number = (form.getAttribute("data-whatsapp") || "").replace(/\D/g, "");

    // Preview mode: no WhatsApp number configured yet.
    if (!number) {
      var pre = document.createElement("pre");
      pre.textContent = message;
      show([
        para("Preview: Layla’s WhatsApp number hasn’t been added to the site yet, so nothing was sent. When it is, WhatsApp opens with this message ready to send:"),
        pre
      ]);
      status.focus();
      return;
    }

    var url = "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Open WhatsApp";
    var fallback = para("WhatsApp should now be open with your message ready. Press send there and it reaches me. If nothing opened, ");
    fallback.appendChild(link);
    fallback.appendChild(document.createTextNode("."));
    show([fallback]);

    var win = window.open(url, "_blank");
    if (win) {
      try { win.opener = null; } catch (e) { /* ignore */ }
    } else {
      window.location.href = url;
    }
  });

  // Once a field is flagged, clear its error (and its line in the summary) as soon as it's fixed.
  ["name", "phone", "email", "question"].forEach(function (key) {
    fields[key].addEventListener("input", function () {
      if (flagged[key] && !CHECKS[key]()) { setError(key, ""); renderSummary(); }
    });
    fields[key].addEventListener("blur", function () {
      if (flagged[key]) { setError(key, CHECKS[key]()); renderSummary(); }
    });
  });
  ["age", "consent"].forEach(function (key) {
    fields[key].addEventListener("change", function () {
      if (flagged[key] && !CHECKS[key]()) { setError(key, ""); renderSummary(); }
    });
  });
})();

/* ==========================================================================
   Atmosphere: header glass, scroll reveals, parallax, candle-light canvas,
   pointer tilt on question cards. All of it stops under reduced motion.
   ========================================================================== */
(function () {
  "use strict";
  window.__larMotion = true;
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vh = window.innerHeight;

  /* ---------- Header glass ---------- */
  var header = document.querySelector(".site-header");
  function onHeader() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 24); }

  /* ---------- Reveals ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal], .convergence"));
  if (!root.classList.contains("js-motion") || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    // Stagger children that ask for it.
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var step = parseInt(group.getAttribute("data-stagger"), 10) || 90;
      Array.prototype.forEach.call(group.querySelectorAll("[data-reveal]"), function (el, i) {
        el.style.setProperty("--d", i * step);
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target.__reveal || [e.target]).forEach(function (el) { el.classList.add("is-in"); });
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) {
      // An element hidden by clip-path (the signature) has no visible area until it is revealed,
      // so the observer would never see it. Watch its parent instead.
      var clipped = getComputedStyle(el).clipPath !== "none";
      var watch = clipped && el.parentElement ? el.parentElement : el;
      (watch.__reveal = watch.__reveal || []).push(el);
      io.observe(watch);
    });
  }

  /* ---------- Parallax ---------- */
  var layers = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll("[data-depth]"));
  function parallax() {
    for (var i = 0; i < layers.length; i++) {
      var el = layers[i];
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      var offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.getAttribute("data-depth"));
      el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onHeader(); parallax(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { vh = window.innerHeight; onScroll(); });
  onHeader(); parallax();

  /* ---------- Pointer tilt + foil on question cards ---------- */
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.querySelectorAll(".qcard").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      if (fine && !reduce) {
        card.style.setProperty("--rx", (x - 0.5).toFixed(3));
        card.style.setProperty("--ry", (y - 0.5).toFixed(3));
      }
    });
    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--rx", 0); card.style.setProperty("--ry", 0);
    });
  });

  /* ---------- Candle-light canvas ---------- */
  var hosts = document.querySelectorAll("[data-atmos]");
  if (!hosts.length || !window.HTMLCanvasElement) return;

  var ROSE = [217, 161, 169], DEEP = [138, 54, 68], OCHRE = [201, 168, 110];

  function Atmos(host) {
    var canvas = document.createElement("canvas");
    canvas.className = "atmos-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.insertBefore(canvas, host.firstChild);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var density = parseFloat(host.getAttribute("data-atmos")) || 1;
    var orbs = [], motes = [], running = false, visible = false, t0 = performance.now();

    function seed() {
      orbs = [
        { x: 0.78, y: 0.35, r: 0.55, c: DEEP, a: 0.45, sx: 0.00011, sy: 0.00008, ax: 0.08, ay: 0.06, p: 0 },
        { x: 0.68, y: 0.55, r: 0.32, c: ROSE, a: 0.10, sx: 0.00017, sy: 0.00013, ax: 0.10, ay: 0.08, p: 2 },
        { x: 0.15, y: 0.85, r: 0.40, c: OCHRE, a: 0.07, sx: 0.00009, sy: 0.00012, ax: 0.07, ay: 0.05, p: 4 },
        { x: 0.40, y: 0.10, r: 0.30, c: ROSE, a: 0.05, sx: 0.00014, sy: 0.0001, ax: 0.12, ay: 0.04, p: 1 }
      ];
      var n = Math.round(Math.min(70, (w * h) / 22000) * density);
      motes = [];
      for (var i = 0; i < n; i++) motes.push(newMote(true));
    }
    function newMote(anywhere) {
      return {
        x: Math.random() * w, y: anywhere ? Math.random() * h : h + 10,
        r: 0.4 + Math.random() * 1.3, vy: 0.08 + Math.random() * 0.25,
        sway: 0.3 + Math.random() * 0.8, ph: Math.random() * 6.28, tw: 0.0008 + Math.random() * 0.0016,
        c: Math.random() < 0.7 ? OCHRE : ROSE
      };
    }
    function size() {
      var r = host.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    function frame(now) {
      var t = now - t0;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      var m = Math.max(w, h);
      for (var i = 0; i < orbs.length; i++) {
        var o = orbs[i];
        var x = (o.x + Math.sin(t * o.sx + o.p) * o.ax) * w;
        var y = (o.y + Math.cos(t * o.sy + o.p) * o.ay) * h;
        var flick = 1 + Math.sin(t * 0.0021 + o.p) * 0.06 + Math.sin(t * 0.0057 + o.p * 2) * 0.04;
        var g = ctx.createRadialGradient(x, y, 0, x, y, o.r * m);
        g.addColorStop(0, "rgba(" + o.c + "," + (o.a * flick).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + o.c + ",0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      for (var j = 0; j < motes.length; j++) {
        var d = motes[j];
        if (!reduce) { d.y -= d.vy; d.x += Math.sin(t * 0.0006 + d.ph) * d.sway * 0.15; }
        if (d.y < -10) motes[j] = d = newMote(false);
        var alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * d.tw + d.ph));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 6.283);
        ctx.fillStyle = "rgba(" + d.c + "," + (alpha * 0.7).toFixed(3) + ")";
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      if (running) requestAnimationFrame(frame);
    }
    function start() { if (running || reduce) return; running = true; requestAnimationFrame(frame); }
    function stop() { running = false; }

    size();
    frame(performance.now()); // one complete still frame, always
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }).observe(host);
    } else { start(); }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else if (visible) start();
    });
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { size(); if (!running) frame(performance.now()); }, 150);
    });
  }
  Array.prototype.forEach.call(hosts, Atmos);
})();
