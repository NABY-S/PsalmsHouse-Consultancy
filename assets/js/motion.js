/* PsalmsHouse Consultancy — motion layer: reveals, parallax, 3D tilt, micro-interactions */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- header: compact on scroll + progress bar ---------- */
  var header = document.querySelector(".site-header");
  var bar = null;
  if (header) {
    bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    header.appendChild(bar);
  }

  /* ---------- scroll-reveal ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    root.classList.add("motion");
    var targets = $(".h2, .svc h2, .section .lead, .center > p, .card, .values li, .points li, .frame, .duo img, .portrait, .profile > div > *, .list > li, .info li, .form, .mapbox, .quality h2, .quality .cols p, .cta h2, .cta p, .cta .btn, .foot > *, .pcard, .prose > *, .banner .wrap > *, .split > div > .btn");
    var seen = [];
    targets = targets.filter(function (el) {
      if (seen.indexOf(el) > -1) return false;
      /* skip elements inside another target of the same kind to avoid double motion */
      for (var p = el.parentElement; p; p = p.parentElement) { if (seen.indexOf(p) > -1) return false; }
      seen.push(el);
      return true;
    });
    targets.forEach(function (el) {
      var dir = "up";
      if (el.matches(".frame, .duo, .portrait")) {
        dir = el.parentElement && el === el.parentElement.lastElementChild ? "right" : "left";
        if (el.matches(".portrait")) dir = "left";
      }
      if (el.matches(".duo img")) dir = "zoom";
      if (el.matches(".form, .mapbox")) dir = "zoom";
      el.setAttribute("data-reveal", dir);
    });
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (e, i) {
        var el = e.target;
        el.style.setProperty("--d", Math.min(i, 6) * 0.09 + "s");
        el.classList.add("in");
        io.unobserve(el);
        /* once finished, hand the element back to its own hover/tilt styles */
        setTimeout(function () { el.removeAttribute("data-reveal"); el.classList.remove("in"); el.style.removeProperty("--d"); }, 2200);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- parallax (scroll) ---------- */
  var layers = [];
  function addLayer(el, host, speed, mode, limit) { if (el && host) layers.push({ el: el, host: host, speed: speed, mode: mode, limit: limit }); }
  if (!reduce) {
    $(".hero").forEach(function (h) {
      addLayer(h.querySelector(".hero-media"), h, 0.22, "top", 0.1);
    });
    $(".banner, .cta").forEach(function (h) { addLayer(h.querySelector("img"), h, 0.14, "center", 0.1); });
    $(".purpose-show").forEach(function (h) { addLayer(h.querySelector(".pslides"), h, 0.14, "center", 0.1); });
    $(".frame").forEach(function (f) { addLayer(f, f, 0.05, "center", 0); });
    $(".purpose .bars-bg").forEach(function (b) { addLayer(b, b.parentElement, 0.12, "center", 0); });
  }
  /* ---------- scroll effects: curtain hero, scrubbed words, opening photos, sliding banner ---------- */
  var heroEl = document.querySelector(".hero");
  var frames = $(".frame");
  var rows = $(".m-row");
  var words = [];
  var quote = document.querySelector(".pcard blockquote");
  if (quote && !reduce) {
    var txt = quote.textContent.trim().split(/\s+/);
    quote.setAttribute("aria-label", quote.textContent.trim());
    quote.textContent = "";
    txt.forEach(function (w, i) {
      var sp = document.createElement("span");
      sp.className = "w";
      sp.setAttribute("aria-hidden", "true");
      sp.textContent = w + (i < txt.length - 1 ? " " : "");
      quote.appendChild(sp);
      words.push(sp);
    });
  }
  function setCurtain() {
    if (!heroEl) return;
    var ok = !reduce && window.innerWidth > 820 && heroEl.offsetHeight <= window.innerHeight;
    heroEl.classList.toggle("curtain", ok);
  }
  setCurtain();
  window.addEventListener("resize", setCurtain);

  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight, sy = window.scrollY || window.pageYOffset;
    layers.forEach(function (L) {
      var r = L.host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = L.mode === "top" ? -r.top : -(r.top + r.height / 2 - vh / 2);
      var v = d * L.speed;
      if (L.limit) { var m = r.height * L.limit; v = clamp(v, -m, m); }
      L.el.style.setProperty("--py", v.toFixed(1) + "px");
    });
    /* curtain hero: darken as the next section slides over it */
    if (heroEl && !reduce) {
      var hh2 = heroEl.offsetHeight || 1;
      heroEl.style.setProperty("--k", (clamp(sy / hh2, 0, 1) * 0.62).toFixed(3));
    }
    /* photos open up */
    if (!reduce) frames.forEach(function (f) {
      var r = f.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      f.style.setProperty("--rv", clamp((vh * 0.95 - r.top) / (vh * 0.55), 0, 1).toFixed(3));
    });
    /* quote words light up */
    if (words.length) {
      var qr = quote.getBoundingClientRect();
      var p = clamp((vh * 0.88 - qr.top) / (vh * 0.42), 0, 1);
      var n = Math.round(p * words.length);
      words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
    }
    /* sliding banner rows move in opposite directions */
    if (!reduce) rows.forEach(function (row, i) {
      var br = row.parentElement.getBoundingClientRect();
      if (br.bottom < -100 || br.top > vh + 100) return;
      var d = br.top + br.height / 2 - vh / 2;
      row.style.setProperty("--mx", ((i % 2 ? 1 : -1) * d * 0.55).toFixed(1));
    });
    /* hero content drifts up + fades a touch as you scroll away */
    var inner = document.querySelector(".hero-inner");
    if (inner && !reduce) {
      var hh = inner.parentElement.offsetHeight || 1;
      var k = clamp(sy / hh, 0, 1);
      inner.style.transform = "translate3d(0," + (-sy * 0.12).toFixed(1) + "px,0)";
      inner.style.opacity = (1 - k * 0.7).toFixed(2);
    }
    if (header) {
      header.classList.toggle("scrolled", sy > 40);
      var max = document.documentElement.scrollHeight - vh;
      bar.style.setProperty("--p", max > 0 ? clamp(sy / max, 0, 1).toFixed(4) : 0);
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req);
  frame();

  /* ---------- hero: mouse depth ---------- */
  var hero = document.querySelector(".hero");
  if (hero && fine && !reduce) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (((e.clientX - r.left) / r.width) - 0.5).toFixed(3) * 2);
      hero.style.setProperty("--my", (((e.clientY - r.top) / r.height) - 0.5).toFixed(3) * 2);
    });
    hero.addEventListener("mouseleave", function () { hero.style.setProperty("--mx", 0); hero.style.setProperty("--my", 0); });
  }

  /* ---------- 3D tilt + cursor spotlight ---------- */
  if (fine && !reduce) {
    $(".card, .frame, .duo img").forEach(function (el) {
      var max = el.matches(".duo img") ? 9 : 7;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add("tilt-on");
        el.style.transform = "perspective(900px) rotateX(" + (-y * max).toFixed(2) + "deg) rotateY(" + (x * max).toFixed(2) + "deg) translateY(-4px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; el.classList.remove("tilt-on"); });
    });
    $(".card, .values li, .info li").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--sx", (e.clientX - r.left) + "px");
        el.style.setProperty("--sy", (e.clientY - r.top) + "px");
      });
    });
    /* magnetic buttons */
    $(".btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
        b.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.removeProperty("--bx"); b.style.removeProperty("--by"); });
    });
  }

  /* ---------- Purpose showcase: sliding image background ---------- */
  var show = document.querySelector(".purpose-show");
  if (show) {
    var imgs = $(".pslides img", show), dots = $(".pdots button", show), cur = 0, timer = null;
    var go = function (n) {
      n = (n + imgs.length) % imgs.length;
      if (n === cur) return;
      imgs.forEach(function (i) { i.classList.remove("was"); });
      imgs[cur].classList.remove("is-active");
      imgs[cur].classList.add("was");
      dots[cur].classList.remove("is-active");
      cur = n;
      imgs[cur].classList.add("is-active");
      dots[cur].classList.add("is-active");
    };
    var start = function () { stop(); if (!reduce) timer = setInterval(function () { go(cur + 1); }, 5500); };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); start(); }); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: 0.2 }).observe(show);
    } else { start(); }
    if (fine && !reduce) {
      var card = show.querySelector(".pcard"), slides = show.querySelector(".pslides");
      show.addEventListener("mousemove", function (e) {
        var r = show.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        slides.style.setProperty("--mx", (-x * 36).toFixed(1) + "px");
        card.style.setProperty("--ry", (x * 7).toFixed(2) + "deg");
        card.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg");
      });
      show.addEventListener("mouseleave", function () {
        slides.style.setProperty("--mx", "0px");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    }
  }
})();
