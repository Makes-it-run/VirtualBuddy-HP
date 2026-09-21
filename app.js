/* VirtualBuddy — virtualbuddy.ai
   Statische Seite, keine Abhängigkeiten. */
(function () {
  "use strict";

  /* ---------- Hover-/Focus-Styles aus style-hover / style-focus ---------- */
  function styleStates() {
    var parse = function (txt) {
      var out = [];
      (txt || "").split(";").forEach(function (rule) {
        var i = rule.indexOf(":");
        if (i < 0) return;
        out.push([rule.slice(0, i).trim(), rule.slice(i + 1).trim()]);
      });
      return out;
    };
    ["hover", "focus", "active"].forEach(function (state) {
      var on = state === "hover" ? "mouseenter" : (state === "focus" ? "focus" : "pointerdown");
      var off = state === "hover" ? "mouseleave" : (state === "focus" ? "blur" : "pointerup");
      Array.prototype.forEach.call(document.querySelectorAll("[style-" + state + "]"), function (el) {
        var rules = parse(el.getAttribute("style-" + state));
        if (!rules.length) return;
        var prev = [];
        el.addEventListener(on, function () {
          prev = rules.map(function (r) { return [r[0], el.style.getPropertyValue(r[0])]; });
          rules.forEach(function (r) { el.style.setProperty(r[0], r[1]); });
        });
        el.addEventListener(off, function () {
          prev.forEach(function (r) {
            if (r[1]) el.style.setProperty(r[0], r[1]);
            else el.style.removeProperty(r[0]);
          });
        });
      });
    });
  }

  /* ---------- E-Mail-Adresse setzen ---------- */
  function mailLinks() {
    var addr = ["info", "virtualbuddy.ai"].join("@");
    Array.prototype.forEach.call(document.querySelectorAll("[data-mail]"), function (a) {
      var subject = a.getAttribute("data-mail-subject");
      a.setAttribute("href", "mailto:" + addr + (subject ? "?subject=" + encodeURIComponent(subject) : ""));
      a.textContent = addr;
    });
  }

  /* ---------- Hell/Dunkel ---------- */
  function theme() {
    var root = document.documentElement;
    var meta = document.querySelector('meta[name="theme-color"]');
    var btns = Array.prototype.slice.call(document.querySelectorAll("[data-theme-toggle]"));
    var read = function () { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; };
    var apply = function (mode, save) {
      if (mode === "light") root.setAttribute("data-theme", "light");
      else root.removeAttribute("data-theme");
      if (save) { try { localStorage.setItem("vb-theme", mode); } catch (e) {} }
      btns.forEach(function (b) {
        b.setAttribute("aria-pressed", mode === "light" ? "true" : "false");
        b.setAttribute("aria-label", mode === "light" ? "Dunkles Design aktivieren" : "Helles Design aktivieren");
      });
      if (meta) {
        var bg = getComputedStyle(document.body).backgroundColor;
        if (bg) meta.setAttribute("content", bg);
      }
      window.dispatchEvent(new CustomEvent("vb:theme", { detail: mode }));
    };
    btns.forEach(function (b) {
      b.addEventListener("click", function () { apply(read() === "light" ? "dark" : "light", true); });
    });
    apply(read(), false);
  }

  /* ---------- Navigation ---------- */
  function nav() {
    var el = document.getElementById("nav");
    if (!el) return;
    var apply = function () {
      var on = (window.scrollY || window.pageYOffset || 0) > 18;
      el.style.background = on ? "rgba(var(--nav),0.86)" : "rgba(var(--nav),0.28)";
      el.style.borderBottomColor = on ? "rgba(var(--w),0.09)" : "rgba(var(--w),0.03)";
      el.style.boxShadow = on ? "0 20px 50px -34px rgba(var(--sh),calc(.95*var(--shm)))" : "none";
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
  }

  /* ---------- Dropdowns + Mobile-Drawer ---------- */
  function menu() {
    var fine = !window.matchMedia || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var open = null;
    var show = function (panel, on) {
      panel.style.opacity = on ? "1" : "0";
      panel.style.visibility = on ? "visible" : "hidden";
      panel.style.transform = on ? "translateY(0)" : "translateY(-6px)";
    };
    Array.prototype.forEach.call(document.querySelectorAll("[data-menu]"), function (item) {
      var panel = item.querySelector("[data-menu-panel]");
      if (!panel) return;
      var t = 0, pt = 0, viaPointer = false;
      var openIt = function () {
        clearTimeout(t);
        if (open && open !== panel) show(open, false);
        open = panel;
        show(panel, true);
      };
      var closeIt = function (delay) {
        clearTimeout(t);
        t = setTimeout(function () {
          show(panel, false);
          if (open === panel) open = null;
        }, delay || 0);
      };
      if (fine) {
        item.addEventListener("mouseenter", openIt);
        item.addEventListener("mouseleave", function () { closeIt(120); });
      }
      item.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse") return;
        viaPointer = true;
        clearTimeout(pt);
        pt = setTimeout(function () { viaPointer = false; }, 700);
      });
      item.addEventListener("focusin", function () { if (viaPointer) return; openIt(); });
      item.addEventListener("focusout", function () {
        setTimeout(function () { if (!item.contains(document.activeElement)) closeIt(0); }, 0);
      });
      item.addEventListener("click", function (e) {
        if (fine) return;
        var link = e.target.closest ? e.target.closest("a") : null;
        if (link && panel.contains(link)) return;
        e.preventDefault();
        if (open === panel) closeIt(0); else openIt();
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) { show(open, false); open = null; }
    });
    document.addEventListener("pointerdown", function (e) {
      if (!open) return;
      var host = e.target && e.target.closest ? e.target.closest("[data-menu]") : null;
      if (host && host.contains(open)) return;
      show(open, false);
      open = null;
    }, true);

    var btn = document.querySelector("[data-nav-toggle]");
    var drawer = document.querySelector("[data-nav-drawer]");
    if (!btn || !drawer) return;
    var on = false;
    var bars = btn.querySelectorAll("span");
    var toggle = function (next) {
      on = next;
      drawer.style.display = on ? "block" : "none";
      document.documentElement.style.overflow = on ? "hidden" : "";
      btn.setAttribute("aria-expanded", on ? "true" : "false");
      btn.setAttribute("aria-label", on ? "Menü schließen" : "Menü öffnen");
      if (bars.length === 3) {
        bars[0].style.transform = on ? "translateY(6px) rotate(45deg)" : "none";
        bars[1].style.opacity = on ? "0" : "1";
        bars[2].style.transform = on ? "translateY(-6px) rotate(-45deg)" : "none";
        Array.prototype.forEach.call(bars, function (b) { b.style.transition = "transform .22s ease,opacity .18s ease"; });
      }
    };
    btn.addEventListener("click", function () { toggle(!on); });
    drawer.addEventListener("click", function (e) {
      if (e.target === drawer) toggle(false);
    });
    window.addEventListener("resize", function () { if (on && window.innerWidth >= 1180) toggle(false); });
  }

  /* ---------- Einblenden beim Scrollen ---------- */
  function reveal() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return;
    els.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity .75s cubic-bezier(.2,.7,.2,1), transform .75s cubic-bezier(.2,.7,.2,1)";
    });
    var clear = function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    };
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sib = Array.prototype.slice.call(e.target.parentNode ? e.target.parentNode.children : []);
        var d = Math.min(Math.max(0, sib.indexOf(e.target)), 5) * 80;
        setTimeout(function () { clear(e.target); }, d);
        o.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { obs.observe(el); });

    /* Sichtbarer Bereich sofort zeigen — IntersectionObserver feuert nicht in jeder Umgebung */
    var firstPass = function () {
      var h = window.innerHeight || 800;
      els.forEach(function (el) {
        if (el.style.opacity !== "0") return;
        var r = el.getBoundingClientRect();
        if (r.top < h) { clear(el); obs.unobserve(el); }
      });
    };
    firstPass();
    requestAnimationFrame(firstPass);
    setTimeout(function () {
      els.forEach(function (el) {
        if (el.style.opacity === "0") { clear(el); obs.unobserve(el); }
      });
    }, 1200);
  }

  /* ---------- Live-Log unter der Hero-Grafik ---------- */
  function log() {
    var box = document.getElementById("log");
    if (!box) return;
    var items = [
      ["INPUT", "Neue E-Mail mit Rechnungsanhang"],
      ["AI", "Betrag, Lieferant und Konto erkannt"],
      ["AKTION", "Buchung im ERP angelegt"],
      ["INPUT", "Bestellung im Shop eingegangen"],
      ["AI", "Verfügbarkeit geprüft, Priorität gesetzt"],
      ["AKTION", "Auftrag im CRM aktualisiert"],
      ["OUTPUT", "Bestätigung an Kundin versendet"]
    ];
    var rows = Array.prototype.slice.call(box.querySelectorAll("[data-log-row]"));
    if (rows.length < 3) return;
    var i = 1;
    setInterval(function () {
      rows.forEach(function (row, k) {
        var item = items[(i + k) % items.length];
        setTimeout(function () {
          var tag = row.querySelector("[data-log-tag]");
          var txt = row.querySelector("[data-log-text]");
          row.style.opacity = "0.15";
          setTimeout(function () {
            if (tag) {
              tag.textContent = item[0];
              tag.style.color = item[0] === "AI" ? "rgb(var(--ac))" : (item[0] === "OUTPUT" ? "rgb(var(--ac2))" : "rgba(var(--ink),calc(.5*var(--im)))");
            }
            if (txt) txt.textContent = item[1];
            row.style.opacity = "1";
          }, 180);
        }, k * 90);
      });
      i = (i + 1) % items.length;
    }, 3200);
  }

  /* ---------- Hero: Workflow-Canvas ---------- */
  function heroCanvas() {
    var cv = document.getElementById("hero-canvas");
    var wrap = document.getElementById("canvas-wrap");
    if (!cv || !wrap) return;
    var ctx = cv.getContext("2d");
    if (!ctx) return;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var C = {};
    function palette() {
      var cs = getComputedStyle(document.documentElement);
      var v = function (n, fb) { return (cs.getPropertyValue(n) || "").trim() || fb; };
      C.ac = v("--ac", "0,212,255");
      C.ac2 = v("--ac2", "79,124,255");
      C.ink = v("--ink", "231,236,244");
      C.w = v("--w", "255,255,255");
      C.bg = v("--bg", "6,8,13");
      C.light = document.documentElement.getAttribute("data-theme") === "light";
    }
    function rgba(t, a) { return "rgba(" + t + "," + a + ")"; }
    palette();
    var s = {
      w: 0, h: 0, dpr: Math.min(window.devicePixelRatio || 1, 2),
      nodes: [], edges: [], chains: [], pulses: [],
      mx: 0, my: 0, tmx: 0, tmy: 0,
      compact: false, animate: !reduced, raf: 0, t: 0, last: 0,
      bg: null, visible: true, retries: 0
    };

    function buildGraph() {
      var compact = s.w < 560;
      s.compact = compact;
      var N = function (id, label, x, y, kind, depth) {
        return { id: id, label: label, x: x, y: y, kind: kind, depth: depth, flash: 0 };
      };
      var nodes, chains;
      if (!compact) {
        nodes = [
          N("mail", "E-Mail", 0.02, 0.14, "in", 1),
          N("form", "Formular", 0.02, 0.5, "in", 1),
          N("shop", "Shop", 0.02, 0.86, "in", 1),
          N("ai", "AI", 0.36, 0.5, "hub", 0.3),
          N("dec", "Entscheidung", 0.63, 0.5, "dec", 0.6),
          N("crm", "CRM", 0.98, 0.11, "out", 1),
          N("erp", "ERP", 0.98, 0.37, "out", 1),
          N("sh2", "Shop", 0.98, 0.63, "out", 1),
          N("mkt", "Marketing", 0.98, 0.89, "out", 1)
        ];
        chains = [["mail", "ai", "dec", "crm"], ["form", "ai", "dec", "erp"], ["shop", "ai", "dec", "sh2"], ["form", "ai", "dec", "mkt"], ["mail", "ai", "dec", "erp"]];
      } else {
        nodes = [
          N("mail", "E-Mail", 0.02, 0.16, "in", 1),
          N("form", "Formular", 0.02, 0.84, "in", 1),
          N("ai", "AI", 0.5, 0.5, "hub", 0.35),
          N("crm", "CRM", 0.98, 0.14, "out", 1),
          N("erp", "ERP", 0.98, 0.5, "out", 1),
          N("sh2", "Shop", 0.98, 0.86, "out", 1)
        ];
        chains = [["mail", "ai", "crm"], ["form", "ai", "erp"], ["mail", "ai", "sh2"]];
      }
      var idx = {};
      nodes.forEach(function (n, i) { idx[n.id] = i; });
      var seen = {}, edges = [];
      chains.forEach(function (c) {
        for (var k = 0; k < c.length - 1; k++) {
          var key = c[k] + ">" + c[k + 1];
          if (!seen[key]) { seen[key] = 1; edges.push([idx[c[k]], idx[c[k + 1]]]); }
        }
      });
      s.nodes = nodes;
      s.edges = edges;
      s.chains = chains.map(function (c) { return c.map(function (id) { return idx[id]; }); });
      s.pulses = s.chains.map(function (c, i) { return { c: i, t: i / s.chains.length, sp: 0.1 + (i % 3) * 0.018, seg: -1 }; });
    }

    function layout() {
      var w = s.w, h = s.h;
      var fs = s.compact ? 10 : 11;
      ctx.font = '500 ' + fs + 'px "JetBrains Mono", ui-monospace, monospace';
      var pad = s.compact ? 8 : 10;
      s.nodes.forEach(function (n) {
        var ox = s.mx * (4 + 14 * n.depth), oy = s.my * (3 + 12 * n.depth);
        var cy = n.y * h + oy;
        if (n.kind === "hub") {
          var r = Math.max(24, Math.min(44, Math.min(w, h) * 0.1));
          n.cx = n.x * w + ox; n.cy = cy; n.r = r;
          n.outP = [n.cx + r, cy]; n.inP = [n.cx - r, cy];
        } else {
          var pw = ctx.measureText(n.label).width + pad * 2.2;
          var ph = s.compact ? 23 : 27;
          var x = n.kind === "in" ? n.x * w + ox : (n.kind === "out" ? n.x * w - pw + ox : n.x * w - pw / 2 + ox);
          n.rect = { x: x, y: cy - ph / 2, w: pw, h: ph };
          n.cx = x + pw / 2; n.cy = cy;
          n.outP = [x + pw, cy]; n.inP = [x, cy];
        }
      });
    }

    function curve(a, b) {
      var dx = Math.max(28, (b[0] - a[0]) * 0.5);
      return [a, [a[0] + dx, a[1]], [b[0] - dx, b[1]], b];
    }

    function bez(c, t) {
      var mt = 1 - t, a = mt * mt * mt, b = 3 * mt * mt * t, d = 3 * mt * t * t, e = t * t * t;
      return [a * c[0][0] + b * c[1][0] + d * c[2][0] + e * c[3][0], a * c[0][1] + b * c[1][1] + d * c[2][1] + e * c[3][1]];
    }

    function rr(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function paintBg() {
      if (!s.w) return;
      var c = document.createElement("canvas");
      c.width = Math.round(s.w * s.dpr); c.height = Math.round(s.h * s.dpr);
      var g = c.getContext("2d");
      g.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      var hx = (s.compact ? 0.5 : 0.36) * s.w, hy = 0.5 * s.h;
      var rad = g.createRadialGradient(hx, hy, 0, hx, hy, Math.max(s.w, s.h) * 0.6);
      rad.addColorStop(0, rgba(C.ac2, C.light ? 0.16 : 0.2));
      rad.addColorStop(0.45, rgba(C.ac, 0.05));
      rad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = rad;
      g.fillRect(0, 0, s.w, s.h);
      g.fillStyle = rgba(C.w, 0.06);
      for (var x = 13; x < s.w; x += 26) {
        for (var y = 13; y < s.h; y += 26) g.fillRect(x, y, 1, 1);
      }
      s.bg = c;
    }

    function paintFrame() {
      if (!s.w) return;
      ctx.clearRect(0, 0, s.w, s.h);
      if (s.bg) ctx.drawImage(s.bg, 0, 0, s.w, s.h);
      layout();

      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(C.w, 0.12);
      s.edges.forEach(function (e) {
        var c = curve(s.nodes[e[0]].outP, s.nodes[e[1]].inP);
        ctx.beginPath();
        ctx.moveTo(c[0][0], c[0][1]);
        ctx.bezierCurveTo(c[1][0], c[1][1], c[2][0], c[2][1], c[3][0], c[3][1]);
        ctx.stroke();
      });

      s.pulses.forEach(function (p, pi) {
        var chain = s.chains[p.c];
        var segs = chain.length - 1;
        var pos = p.t * segs;
        var seg = Math.min(segs - 1, Math.floor(pos));
        var f = pos - seg;
        if (p.seg !== seg) {
          p.seg = seg;
          var n0 = s.nodes[chain[seg]];
          if (n0) n0.flash = 1;
        }
        if (f > 0.965) {
          var tn = s.nodes[chain[seg + 1]];
          if (tn) tn.flash = 1;
        }
        var c = curve(s.nodes[chain[seg]].outP, s.nodes[chain[seg + 1]].inP);
        var col = pi % 2 ? C.ac : C.ac2;
        for (var k = 6; k >= 0; k--) {
          var tt = Math.max(0, f - k * 0.035);
          var pt = bez(c, tt);
          var a = (1 - k / 7) * 0.9;
          ctx.beginPath();
          ctx.fillStyle = "rgba(" + col + "," + (a * 0.55).toFixed(3) + ")";
          ctx.arc(pt[0], pt[1], 2.5 - k * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
        var head = bez(c, f);
        ctx.save();
        ctx.shadowColor = "rgba(" + col + ",0.95)";
        ctx.shadowBlur = 14;
        ctx.fillStyle = rgba(C.w, 0.98);
        ctx.beginPath();
        ctx.arc(head[0], head[1], 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      var fs = s.compact ? 10 : 11;
      s.nodes.forEach(function (n) {
        if (n.kind === "hub") {
          var g = ctx.createRadialGradient(n.cx, n.cy, 0, n.cx, n.cy, n.r * 1.6);
          g.addColorStop(0, rgba(C.ac2, 0.3));
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.cx, n.cy, n.r * 1.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rgba(C.bg, 0.9);
          ctx.beginPath();
          ctx.arc(n.cx, n.cy, n.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = rgba(C.ac2, 0.6);
          ctx.stroke();
          var a0 = s.t * 0.6;
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = rgba(C.ac, 0.75);
          [0, Math.PI].forEach(function (off) {
            ctx.beginPath();
            ctx.arc(n.cx, n.cy, n.r + 7, a0 + off, a0 + off + 0.8);
            ctx.stroke();
          });
          ctx.fillStyle = rgba(C.ink, 0.98);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = '700 ' + (s.compact ? 13 : 15) + 'px Manrope, system-ui, sans-serif';
          ctx.fillText("AI", n.cx, n.cy + 0.5);
          ctx.font = '500 ' + (s.compact ? 8.5 : 9.5) + 'px "JetBrains Mono", ui-monospace, monospace';
          ctx.fillStyle = rgba(C.ink, 0.6);
          ctx.fillText("ANALYSE", n.cx, n.cy + (s.compact ? 12 : 15));
          return;
        }
        var r = n.rect, flash = n.flash;
        rr(r.x, r.y, r.w, r.h, 8);
        ctx.fillStyle = rgba(C.w, (0.05 + flash * 0.07).toFixed(3));
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = flash > 0.02 ? rgba(C.ac, (0.2 + flash * 0.7).toFixed(3)) : rgba(C.w, 0.16);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = '500 ' + fs + 'px "JetBrains Mono", ui-monospace, monospace';
        ctx.fillStyle = rgba(C.ink, (0.75 + flash * 0.25).toFixed(3));
        ctx.fillText(n.label, r.x + r.w / 2, r.y + r.h / 2 + 0.5);
        n.flash = Math.max(0, flash - 0.022);
      });
    }

    function frame(now) {
      var dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0.016;
      s.last = now;
      s.t += dt;
      s.mx += (s.tmx - s.mx) * 0.07;
      s.my += (s.tmy - s.my) * 0.07;
      s.pulses.forEach(function (p) {
        p.t += dt * p.sp;
        if (p.t > 1) p.t -= 1;
      });
      paintFrame();
      s.raf = s.visible ? requestAnimationFrame(frame) : 0;
    }

    function kick() {
      if (!s.w) return;
      paintFrame();
      if (s.animate && s.visible && !s.raf) { s.last = 0; s.raf = requestAnimationFrame(frame); }
    }

    function resize() {
      var r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) {
        if (s.retries++ < 20) requestAnimationFrame(resize);
        return;
      }
      if (Math.abs(r.width - s.w) < 0.5 && Math.abs(r.height - s.h) < 0.5 && s.bg) return;
      s.w = r.width; s.h = r.height;
      cv.width = Math.round(r.width * s.dpr);
      cv.height = Math.round(r.height * s.dpr);
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      buildGraph();
      paintBg();
      paintFrame();
    }

    window.addEventListener("resize", function () { resize(); kick(); });
    window.addEventListener("vb:theme", function () { palette(); paintBg(); paintFrame(); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { resize(); kick(); }).observe(wrap);
    if (!reduced) {
      wrap.addEventListener("pointermove", function (e) {
        var r = wrap.getBoundingClientRect();
        s.tmx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
        s.tmy = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      }, { passive: true });
      wrap.addEventListener("pointerleave", function () { s.tmx = 0; s.tmy = 0; }, { passive: true });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { s.visible = true; kick(); }
          else if (e.boundingClientRect && e.boundingClientRect.height > 0) {
            s.visible = false;
            if (s.raf) { cancelAnimationFrame(s.raf); s.raf = 0; }
          }
        });
      }, { threshold: 0.02 }).observe(wrap);
    }
    resize();
    kick();
    requestAnimationFrame(function () { resize(); kick(); });
    setTimeout(function () { resize(); kick(); }, 260);
  }

  /* ---------- Kontaktformular (Web3Forms) ---------- */
  function contactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var wrap = document.getElementById("form-wrap");
    var success = document.getElementById("form-success");
    var errBox = document.getElementById("form-error");
    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : "";
    var showError = function (msg) {
      if (!errBox) return;
      var p = errBox.querySelector("p") || errBox;
      p.textContent = msg;
      errBox.style.display = msg ? "block" : "none";
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var val = function (k) { return (fd.get(k) || "").toString().trim(); };
      var name = val("name"), mail = val("email"), msg = val("nachricht");
      if (!name || !mail || !msg) return showError("Bitte Name, E-Mail und Nachricht ausfüllen.");
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(mail)) return showError("Bitte geben Sie eine gültige E-Mail-Adresse an.");
      showError("");
      if (btn) { btn.disabled = true; btn.style.opacity = "0.6"; btn.textContent = "Wird gesendet …"; }
      fetch(form.getAttribute("action"), { method: "POST", headers: { Accept: "application/json" }, body: fd })
        .then(function (r) { if (!r.ok) throw new Error("bad"); return r.json(); })
        .then(function () {
          if (wrap) wrap.style.display = "none";
          if (success) success.style.display = "block";
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.style.opacity = "1"; btn.textContent = label; }
          showError("Senden fehlgeschlagen. Bitte schreiben Sie uns direkt per E-Mail.");
        });
    });
  }

  /* ---------- Sprungmarken: gleiche Seite weich scrollen, Kopfzeile ausgleichen ---------- */
  function anchors() {
    var navEl = document.getElementById("nav");
    var norm = function (p) { return p.replace(/index\.html$/, "").replace(/\/+$/, ""); };
    var offset = function () { return (navEl ? navEl.offsetHeight : 64) + 18; };
    var find = function (hash) {
      if (!hash || hash === "#") return null;
      var id = hash.slice(1);
      try { id = decodeURIComponent(id); } catch (e) {}
      return document.getElementById(id);
    };
    var go = function (el, smooth) {
      var y = el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - offset();
      if (y < 0) y = 0;
      try { window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" }); }
      catch (e) { window.scrollTo(0, y); }
    };
    var closeDrawer = function () {
      var t = document.querySelector("[data-nav-toggle]");
      if (t && t.getAttribute("aria-expanded") === "true") t.click();
    };
    document.addEventListener("click", function (e) {
      var link = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!link || link.getAttribute("target") === "_blank") return;
      var href = link.getAttribute("href") || "";
      if (href.indexOf("#") === -1) return;
      var url;
      try { url = new URL(link.href, location.href); } catch (err) { return; }
      if (norm(url.pathname) !== norm(location.pathname) || url.search !== location.search) return;
      var el = find(url.hash);
      if (!el) return;
      e.preventDefault();
      closeDrawer();
      go(el, true);
      if (history.replaceState) history.replaceState(null, "", url.hash);
      var field = el.querySelector('input:not([type="hidden"]):not([type="checkbox"]),select,textarea');
      if (field) setTimeout(function () { try { field.focus({ preventScroll: true }); } catch (err) {} }, 560);
    });
    if (location.hash) {
      var start = find(location.hash);
      if (start) setTimeout(function () { go(start, false); }, 80);
    }
  }

  function init() {
    styleStates();
    mailLinks();
    theme();
    nav();
    menu();
    reveal();
    log();
    heroCanvas();
    contactForm();
    anchors();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
