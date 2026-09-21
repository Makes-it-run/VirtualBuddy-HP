/* VirtualBuddy.ai — KI-Hub: Agent-Lauf, Dokumenten-Auslese, Cloud/Lokal-Route.
   Laeuft nur, wenn die jeweiligen Container auf der Seite vorhanden sind. */
(function () {
  "use strict";

  var RM = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var MONO = "'JetBrains Mono',ui-monospace,monospace";
  var INK = "rgb(var(--hk1))";

  /* Sichtbarkeit: eigene, gedrosselte Pruefung. IntersectionObserver und
     Scroll-Events feuern nicht in jeder Umgebung, ein Timer immer. */
  function inView(node, cb) {
    var last = null;
    function check() {
      var r = node.getBoundingClientRect();
      var h = window.innerHeight || 800;
      var v = r.bottom > -100 && r.top < h + 100;
      if (v !== last) { last = v; cb(v); }
    }
    check();
    setInterval(check, 250);
  }

  /* ---------------- A · Agent-Lauf ---------------- */

  var TONE = {
    "in":    { c: "rgba(var(--hk1),calc(0.62*var(--im)))", l: "Eingang" },
    think:   { c: "rgb(var(--hk2))", l: "Überlegt" },
    tool:    { c: "rgb(var(--hk3))", l: "Werkzeug" },
    act:     { c: "rgb(var(--hk4))", l: "Aktion" },
    esc:     { c: "rgb(var(--hk5))", l: "Eskalation" }
  };

  var SCENES = [
    {
      key: "rechnung",
      steps: [
        { k: "in",    t: "E-Mail mit Anhang",        d: "rechnung_4711.pdf · 1 Seite" },
        { k: "tool",  t: "dokument.lesen()",         d: "14 Felder erkannt, 1 unsicher" },
        { k: "think", t: "Positionen abgleichen",    d: "Bezug auf Bestellung 2291 gefunden" },
        { k: "tool",  t: "erp.bestellung(2291)",     d: "3 Positionen · 4.812,00 €" },
        { k: "think", t: "Differenz prüfen",         d: "Abweichung 0,00 € · innerhalb Freigabegrenze" },
        { k: "act",   t: "erp.buchen(4711)",         d: "gebucht · Zahllauf 22.09. mit 2 % Skonto" }
      ],
      result: { tone: "ok", head: "Ohne Rückfrage erledigt", sub: "Durchlaufzeit 40 Sekunden statt 9 Minuten Handarbeit" }
    },
    {
      key: "anfrage",
      steps: [
        { k: "in",    t: "Kontaktformular",          d: "eingegangen 18:42, ausserhalb der Geschäftszeit" },
        { k: "tool",  t: "crm.suchen(absender)",     d: "Bestandskunde · Anlage seit 2021" },
        { k: "think", t: "Einordnen",                d: "Thema Störung · Dringlichkeit hoch" },
        { k: "tool",  t: "wissen.suchen(\"E-14\")",  d: "2 Treffer · Handbuch S. 63" },
        { k: "act",   t: "ticket.anlegen()",         d: "#8431 · Prio 1 · Gruppe Technik" }
      ],
      result: { tone: "ok", head: "Antwortentwurf liegt bereit", sub: "Freigabe durch einen Menschen, kein Versand ohne Klick" }
    },
    {
      key: "grenzfall",
      steps: [
        { k: "in",    t: "Gutschrift per Post",      d: "gutschrift_882.pdf · eingescannt" },
        { k: "tool",  t: "dokument.lesen()",         d: "Betrag 11.400,00 €" },
        { k: "think", t: "Regel anwenden",           d: "ab 10.000 € kein Selbstentscheid" },
        { k: "esc",   t: "mensch.fragen()",          d: "Buchhaltung · mit Kontext und Quelle" }
      ],
      result: { tone: "warn", head: "Bewusst nicht entschieden", sub: "Die Schwelle ist eine Geschäftsentscheidung, keine technische" }
    }
  ];

  function agent() {
    var root = document.getElementById("ki-agent");
    if (!root) return;
    var trace = root.querySelector("[data-trace]");
    var result = root.querySelector("[data-result]");
    var status = root.querySelector("[data-status]");
    var dot = root.querySelector("[data-status-dot]");
    var chips = Array.prototype.slice.call(root.querySelectorAll("[data-task]"));
    if (!trace || !result) return;

    var idx = 0, step = 0, timer = null, auto = true, started = false;

    function paintChips() {
      for (var i = 0; i < chips.length; i++) {
        var on = i === idx;
        chips[i].style.background = on ? "rgba(var(--hk3),calc(0.22*var(--am)))" : "rgba(var(--hk6),calc(0.05*var(--am)))";
        chips[i].style.borderColor = on ? "rgba(var(--hk3),0.6)" : "rgba(var(--hk6),calc(0.16*var(--am)))";
        chips[i].style.color = on ? INK : "rgba(var(--hk1),calc(0.64*var(--im)))";
        chips[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
    }

    function addRow(s, animate) {
      var tone = TONE[s.k] || TONE["in"];
      var row = document.createElement("div");
      row.setAttribute("style",
        "display:grid;grid-template-columns:76px 1fr;gap:10px;padding:9px 0;border-top:1px solid rgba(var(--hk6),calc(0.09*var(--am)))" +
        (animate ? ";animation:kiRow .36s ease both" : ""));
      var lab = document.createElement("span");
      lab.setAttribute("style", "font-family:" + MONO + ";font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:" + tone.c + ";padding-top:4px");
      lab.textContent = tone.l;
      var body = document.createElement("div");
      body.setAttribute("style", "min-width:0");
      var t = document.createElement("div");
      t.setAttribute("style", "font-family:" + MONO + ";font-size:12.5px;line-height:1.4;color:" + INK + ";overflow-wrap:anywhere");
      t.textContent = s.t;
      var d = document.createElement("div");
      d.setAttribute("style", "margin-top:3px;font-size:12.5px;line-height:1.45;color:rgba(var(--hk1),calc(0.62*var(--im)));overflow-wrap:anywhere");
      d.textContent = "→ " + s.d;
      body.appendChild(t); body.appendChild(d);
      row.appendChild(lab); row.appendChild(body);
      trace.appendChild(row);
    }

    function setStatus(txt, col, blink) {
      if (status) { status.textContent = txt; status.style.color = col; }
      if (dot) {
        dot.style.background = col;
        dot.style.boxShadow = "0 0 10px " + col;
        dot.style.animation = blink ? "vbBlink 1.1s ease-in-out infinite" : "none";
        dot.style.opacity = blink ? "" : "1";
      }
    }

    function finish() {
      var r = SCENES[idx].result;
      var warn = r.tone === "warn";
      var col = warn ? "rgb(var(--hk5))" : "rgb(var(--hk4))";
      setStatus(warn ? "eskaliert" : "fertig", col, false);
      result.innerHTML = "";
      result.style.display = "block";
      var box = document.createElement("div");
      box.setAttribute("style",
        "display:flex;align-items:flex-start;gap:11px;padding:13px 15px;border-radius:12px;animation:kiPop .4s ease both;" +
        "background:" + (warn ? "rgba(var(--hk5),calc(0.10*var(--am)))" : "rgba(var(--hk4),calc(0.09*var(--am)))") + ";" +
        "border:1px solid " + (warn ? "rgba(var(--hk5),calc(0.34*var(--am)))" : "rgba(var(--hk4),calc(0.3*var(--am)))"));
      var mark = document.createElement("span");
      mark.setAttribute("style", "flex:0 0 auto;font-family:" + MONO + ";font-size:13px;line-height:1.3;color:" + col);
      mark.textContent = warn ? "!" : "✓";
      var txt = document.createElement("div");
      var h = document.createElement("div");
      h.setAttribute("style", "font-size:13.8px;font-weight:700;letter-spacing:-0.01em;color:" + INK);
      h.textContent = r.head;
      var s = document.createElement("div");
      s.setAttribute("style", "margin-top:3px;font-size:12.8px;line-height:1.5;color:rgba(var(--hk1),calc(0.68*var(--im)))");
      s.textContent = r.sub;
      txt.appendChild(h); txt.appendChild(s);
      box.appendChild(mark); box.appendChild(txt);
      result.appendChild(box);
      if (auto && !RM) timer = setTimeout(function () { idx = (idx + 1) % SCENES.length; run(); }, 3600);
    }

    function tick() {
      var sc = SCENES[idx];
      if (step >= sc.steps.length) { finish(); return; }
      var s = sc.steps[step];
      addRow(s, true);
      step++;
      timer = setTimeout(tick, s.k === "think" ? 1150 : 880);
    }

    function stop() { if (timer) { clearTimeout(timer); timer = null; } }

    function run() {
      stop();
      trace.innerHTML = "";
      result.innerHTML = "";
      result.style.display = "none";
      step = 0;
      paintChips();
      if (RM) {
        for (var i = 0; i < SCENES[idx].steps.length; i++) addRow(SCENES[idx].steps[i], false);
        finish();
        return;
      }
      setStatus("arbeitet", "rgb(var(--hk2))", true);
      timer = setTimeout(tick, 260);
    }

    for (var i = 0; i < chips.length; i++) {
      (function (n) {
        chips[n].addEventListener("click", function () {
          auto = false;
          idx = n;
          started = true;
          run();
        });
      })(i);
    }
    paintChips();

    inView(root, function (v) {
      if (v) { if (!started) { started = true; run(); } else if (!timer) run(); }
      else stop();
    });
  }

  /* ---------------- B · Cloud oder lokal ----------------
     Die Dauerbewegung steckt in CSS-Keyframes; hier nur der Moduswechsel. */

  function route() {
    var root = document.getElementById("ki-route");
    if (!root) return;
    var house = root.querySelector("[data-house]");
    var packet = root.querySelector("[data-packet]");
    var caption = root.querySelector("[data-caption]");
    var note = root.querySelector("[data-model-note]");
    var btns = Array.prototype.slice.call(root.querySelectorAll("[data-mode]"));
    if (!house || !packet) return;

    var MODES = {
      cloud: {
        right: "50%",
        note: "EU-Rechenzentrum · AVV",
        anim: "kiPkt 4.5s linear infinite,kiPktC 4.5s linear infinite",
        cap: "Nur die Felder, die der Vorgang wirklich braucht, verlassen das Haus — vertraglich abgesichert, EU-Hosting, keine Freigabe zum Training. Beste Qualität pro Euro."
      },
      lokal: {
        right: "0%",
        note: "Eigener Server · GPU",
        anim: "kiPkt 4.5s linear infinite",
        cap: "Kein Datensatz verlässt Ihr Netz. Das Modell läuft auf Ihrer Hardware — dafür tragen Sie Anschaffung, Strom und Betrieb selbst."
      }
    };
    var mode = "cloud";

    function paint() {
      var m = MODES[mode];
      house.style.right = m.right;
      packet.style.animation = m.anim;
      packet.style.background = "rgb(var(--hk2))";
      packet.style.boxShadow = "0 0 14px rgb(var(--hk2))";
      if (note) note.textContent = m.note;
      if (caption) caption.textContent = m.cap;
      for (var i = 0; i < btns.length; i++) {
        var on = btns[i].getAttribute("data-mode") === mode;
        btns[i].style.background = on ? "rgba(var(--hk3),calc(0.22*var(--am)))" : "transparent";
        btns[i].style.color = on ? INK : "rgba(var(--hk1),calc(0.62*var(--im)))";
        btns[i].style.borderColor = on ? "rgba(var(--hk3),0.6)" : "rgba(var(--hk6),calc(0.16*var(--am)))";
        btns[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
    }

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        mode = this.getAttribute("data-mode");
        paint();
      });
    }
    paint();
  }

  function init() { agent(); route(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
