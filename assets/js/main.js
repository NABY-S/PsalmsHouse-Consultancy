/* PsalmsHouse Consultancy — site behaviour */
(function () {
  "use strict";

  /* ---------- Where contact-form messages are delivered ---------- */
  var FORM_RECIPIENT = "info@psalmshouse.com";

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- About Us dropdown (hover on desktop, tap on touch) ---------- */
  document.querySelectorAll(".has-dd").forEach(function (item) {
    var btn = item.querySelector(".dd-btn");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        item.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".has-dd.open").forEach(function (item) {
      if (!item.contains(e.target)) {
        item.classList.remove("open");
        item.querySelector(".dd-btn").setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- Hero video: assets/video/hero.mp4, falling back to the HLS playlist ---------- */
  var video = document.getElementById("hero-video");
  if (video) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var show = function () { video.classList.add("is-on"); };
    var useHls = function () {
      var hlsSrc = video.getAttribute("data-hls");
      if (!hlsSrc) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsSrc;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ capLevelToPlayerSize: true });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () { video.play().catch(function () {}); });
        hls.on(window.Hls.Events.ERROR, function (_, d) { if (d.fatal) hls.destroy(); });
      }
    };
    if (!reduce) {
      video.addEventListener("playing", show, { once: true });
      video.addEventListener("error", useHls, { once: true });
      video.src = video.getAttribute("data-src");
      video.play().catch(function () {});
    }
  }

  /* ---------- Services: Corporate Finance drop-down (hover on desktop, tap on touch) ---------- */
  document.querySelectorAll(".has-sub").forEach(function (item) {
    var btn = item.querySelector(".sub-btn");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { item.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.focus(); }
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".has-sub.open").forEach(function (item) {
      if (!item.contains(e.target)) { item.classList.remove("open"); item.querySelector(".sub-btn").setAttribute("aria-expanded", "false"); }
    });
  });

  /* ---------- Hero slideshow ---------- */
  var slideBox = document.getElementById("hero-slides");
  if (slideBox) {
    var slides = slideBox.querySelectorAll(".slide");
    var dots = document.querySelectorAll(".hero-dots button");
    var cur = 0, timer = null;
    var go = function (n) {
      slides[cur].classList.remove("is-active");
      dots[cur].classList.remove("is-active");
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add("is-active");
      dots[cur].classList.add("is-active");
    };
    var start = function () { stop(); timer = setInterval(function () { go(cur + 1); }, 6000); };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); start(); }); });
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) start();
  }

  /* ---------- Back to top ---------- */
  var top = document.querySelector(".to-top");
  if (top) {
    top.addEventListener("click", function () {
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    var send = document.getElementById("send-btn");
    var rules = {
      first_name: function (v) { return v.trim() ? "" : "Enter your first name."; },
      last_name: function (v) { return v.trim() ? "" : "Enter your last name."; },
      email: function (v) {
        if (!v.trim()) return "Enter your email address.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email, like name@company.com.";
      },
      phone: function (v) {
        if (!v.trim()) return "Enter your phone number.";
        return v.replace(/\D/g, "").length >= 7 ? "" : "Enter a phone number with at least 7 digits.";
      },
      message: function (v) { return v.trim() ? "" : "Write a short message."; }
    };

    function check(input) {
      var field = input.closest(".field");
      var msg = rules[input.name](input.value);
      field.classList.toggle("invalid", !!msg);
      field.querySelector(".err").textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }

    form.querySelectorAll("input[name], textarea[name]").forEach(function (el) {
      if (!rules[el.name]) return;
      el.addEventListener("blur", function () { check(el); });
      el.addEventListener("input", function () {
        if (el.closest(".field").classList.contains("invalid")) check(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "status";
      status.textContent = "";

      var firstBad = null;
      form.querySelectorAll("input[name], textarea[name]").forEach(function (el) {
        if (rules[el.name] && !check(el) && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }

      /* spam trap: real visitors never fill this */
      if (form.elements["_honey"] && form.elements["_honey"].value) return;

      var payload = {
        name: form.elements.first_name.value.trim() + " " + form.elements.last_name.value.trim(),
        first_name: form.elements.first_name.value.trim(),
        last_name: form.elements.last_name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        message: form.elements.message.value.trim(),
        _subject: "New website enquiry from " + form.elements.first_name.value.trim() + " " + form.elements.last_name.value.trim(),
        _template: "table",
        _captcha: "false"
      };

      send.disabled = true;
      var label = send.textContent;
      send.textContent = "Sending…";

      fetch("https://formsubmit.co/ajax/" + FORM_RECIPIENT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.body.success) === "true") {
            status.className = "status ok";
            status.textContent = "Thank you, " + payload.first_name + ". Your message has been sent to " + FORM_RECIPIENT + ". We will reply shortly.";
            form.reset();
            form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid"); });
          } else {
            throw new Error(res.body && res.body.message ? res.body.message : "Send failed");
          }
        })
        .catch(function () {
          status.className = "status bad";
          var body = "Name: " + payload.name + "\nEmail: " + payload.email + "\nPhone: " + payload.phone + "\n\n" + payload.message;
          var mail = "mailto:" + FORM_RECIPIENT + "?subject=" + encodeURIComponent(payload._subject) + "&body=" + encodeURIComponent(body);
          status.innerHTML = "";
          status.appendChild(document.createTextNode("Your message could not be sent from the website. Please try again, or "));
          var link = document.createElement("a");
          link.href = mail;
          link.textContent = "send it from your email app";
          status.appendChild(link);
          status.appendChild(document.createTextNode(" (it is already filled in for " + FORM_RECIPIENT + ")."));
        })
        .finally(function () {
          send.disabled = false;
          send.textContent = label;
        });
    });
  }
})();
