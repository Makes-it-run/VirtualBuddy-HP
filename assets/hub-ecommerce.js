/* VirtualBuddy.ai — E-Commerce-Hub: Vorher/Nachher-Wischer.
   Ein Range-Regler steuert die clip-path-Kante der oberen Ebene.
   Rein ereignisgesteuert: Tastatur, Maus und Touch funktionieren gleich. */
(function () {
  "use strict";

  function wipe() {
    var root = document.getElementById("ec-wipe");
    if (!root) return;
    var input = root.querySelector("[data-wipe]");
    var over = root.querySelector("[data-after]");
    var handle = root.querySelector("[data-handle]");
    if (!input || !over || !handle) return;

    /* Der Griff ist die Trennkante: links davon der Handbetrieb,
       rechts davon der automatisierte Ablauf. */
    function paint() {
      var v = parseFloat(input.value);
      if (isNaN(v)) v = 57;
      over.style.clipPath = "inset(0 0 0 " + v + "%)";
      over.style.webkitClipPath = "inset(0 0 0 " + v + "%)";
      handle.style.left = v + "%";
      input.setAttribute("aria-valuetext", "Trennkante bei " + Math.round(v) + " Prozent — links Handarbeit, rechts automatisiert");
    }

    input.addEventListener("input", paint);
    input.addEventListener("change", paint);
    paint();
  }


  /* ---------------- Bestandsabgleich über Kanäle ---------------- */

  function stock() {
    var root = document.getElementById("ec-stock");
    if (!root) return;
    var btns = Array.prototype.slice.call(root.querySelectorAll("[data-stock]"));
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-chan]"));
    var rails = Array.prototype.slice.call(root.querySelectorAll("[data-rail]"));
    var lead = root.querySelector("[data-lead]");
    var cap = root.querySelector("[data-stockcap]");
    var stat = root.querySelector("[data-stockstat]");

    var DATA = {
      eigen: {
        qty: { shop: "15", marktA: "9", marktB: "14" },
        warn: {
          shop: ["3 zu viel", "rgb(var(--he1))"],
          marktA: ["3 zu wenig", "rgb(var(--he2))"],
          marktB: ["2 zu viel", "rgb(var(--he1))"]
        },
        note: {
          shop: "Bestand wird im Shop gepflegt",
          marktA: "Bestand aus Tabelle importiert",
          marktB: "Bestand manuell nachgezogen"
        },
        stat: ["3 Kanäle weichen ab", "rgb(var(--he1))"],
        cap: "Jeder Kanal wird von Hand gepflegt. Nach wenigen Tagen stimmt keine Zahl mehr: Wo zu viel steht, entstehen Überverkäufe und Stornos; wo zu wenig steht, verkauft man Ware nicht, die im Regal liegt."
      },
      quelle: {
        qty: { shop: "12", marktA: "12", marktB: "12" },
        warn: {
          shop: ["synchron", "rgb(var(--he3))"],
          marktA: ["synchron", "rgb(var(--he3))"],
          marktB: ["synchron", "rgb(var(--he3))"]
        },
        note: {
          shop: "aus der Warenwirtschaft versorgt",
          marktA: "über Schnittstelle versorgt",
          marktB: "Abgleich alle 5 Minuten"
        },
        stat: ["alle Kanäle synchron", "rgb(var(--he3))"],
        cap: "Die Warenwirtschaft ist die führende Quelle. Sie gibt den Bestand in eine Richtung an alle Kanäle weiter — Änderungen im Shop oder am Marktplatz können die Zahl nicht mehr überschreiben."
      }
    };
    var mode = "eigen";

    function paint() {
      var d = DATA[mode], on = mode === "quelle";
      for (var i = 0; i < cards.length; i++) {
        var key = cards[i].getAttribute("data-chan");
        var q = cards[i].querySelector("[data-qty]");
        var w = cards[i].querySelector("[data-warn]");
        if (q && d.qty[key]) q.textContent = d.qty[key];
        if (w && d.warn[key]) {
          w.textContent = d.warn[key][0];
          w.style.color = d.warn[key][1];
          w.style.borderColor = d.warn[key][1];
        }
        var n = cards[i].querySelector("[data-note]");
        if (n && d.note[key]) n.textContent = d.note[key];
        cards[i].style.borderColor = on ? "rgba(var(--he3),calc(0.38*var(--am)))" : "rgba(var(--he1),calc(0.35*var(--am)))";
      }
      for (var r = 0; r < rails.length; r++) {
        rails[r].style.opacity = on ? "1" : "0.2";
        rails[r].style.background = on
          ? "linear-gradient(90deg,rgb(var(--he4)),rgb(var(--he5)))"
          : "repeating-linear-gradient(90deg,rgba(var(--he6),calc(0.5*var(--im))) 0 4px,transparent 4px 9px)";
      }
      if (lead) {
        lead.textContent = on ? "führende Quelle" : "nur eine Quelle von vier";
        lead.style.color = on ? "rgb(var(--he7))" : "rgba(var(--he6),calc(0.6*var(--im)))";
        lead.style.borderColor = on ? "rgba(var(--he7),calc(0.5*var(--am)))" : "rgba(var(--he6),0.25)";
      }
      if (stat) { stat.textContent = d.stat[0]; stat.style.color = d.stat[1]; }
      if (cap) cap.textContent = d.cap;
      for (var b = 0; b < btns.length; b++) {
        var sel = btns[b].getAttribute("data-stock") === mode;
        btns[b].style.background = sel ? "rgba(var(--he4),calc(0.2*var(--am)))" : "transparent";
        btns[b].style.color = sel ? "rgb(var(--he6))" : "rgba(var(--he6),calc(0.62*var(--im)))";
        btns[b].style.borderColor = sel ? "rgba(var(--he4),0.55)" : "rgba(var(--he4),calc(0.2*var(--am)))";
        btns[b].setAttribute("aria-pressed", sel ? "true" : "false");
      }
    }
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () { mode = this.getAttribute("data-stock"); paint(); });
    }
    paint();
  }

  /* ---------------- Produkttext aus technischen Daten ---------------- */

  function texts() {
    var root = document.getElementById("ec-text");
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-out]"));
    var body = root.querySelector("[data-textout]");
    var meta = root.querySelector("[data-textmeta]");
    if (!body) return;

    var OUT = {
      shop: {
        meta: "Fließtext · 49 Wörter · für die Produktseite",
        html: '<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:rgb(var(--he6))">Arbeitsplatte aus Edelstahl 1.4301 mit gebürsteter Oberfläche, Korn 240. Das Format 1200 × 600 × 40 mm passt auf gängige Unterbauten; mit 18,4 kg lässt sich die Platte von zwei Personen setzen.</p><p style="margin:0;font-size:15px;line-height:1.7;color:rgba(var(--he6),calc(0.78*var(--im)))">Werkstoff und Verarbeitung entsprechen DIN EN 10088-2 — säurebeständig, lebensmittelecht und für den Dauereinsatz in gewerblichen Küchen zugelassen.</p>'
      },
      markt: {
        meta: "5 Stichpunkte · längster 70 Zeichen",
        html: '<ul style="margin:0;padding-left:0;list-style:none;display:grid;gap:9px">'
          + ['Werkstoff Edelstahl 1.4301 (V2A) — säurebeständig und lebensmittelecht',
             'Maße 1200 × 600 × 40 mm — passend für gängige Unterbauten',
             'Oberfläche gebürstet, Korn 240 — unempfindlich gegen Kratzspuren',
             'Gewicht 18,4 kg — von zwei Personen zu setzen',
             'Gefertigt nach DIN EN 10088-2 — für den gewerblichen Dauereinsatz'
            ].map(function (t) {
              return '<li style="position:relative;padding-left:20px;font-size:14.5px;line-height:1.6;color:rgb(var(--he6))"><span aria-hidden="true" style="position:absolute;left:0;top:8px;width:7px;height:7px;border-radius:50%;background:rgb(var(--he4));display:block"></span>' + t + '</li>';
            }).join('') + '</ul>'
      },
      meta: {
        meta: "Meta-Beschreibung · 133 von 160 Zeichen",
        html: '<p style="margin:0;font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:13.5px;line-height:1.7;color:rgb(var(--he6))">Edelstahl-Arbeitsplatte 1.4301, 1200 × 600 × 40 mm, gebürstet Korn 240. Lebensmittelecht nach DIN EN 10088-2, für gewerbliche Küchen.</p>'
      }
    };
    var cur = "shop";

    function paint() {
      var o = OUT[cur];
      body.innerHTML = o.html;
      if (meta) meta.textContent = o.meta;
      for (var i = 0; i < tabs.length; i++) {
        var sel = tabs[i].getAttribute("data-out") === cur;
        tabs[i].style.background = sel ? "rgba(var(--he4),calc(0.2*var(--am)))" : "transparent";
        tabs[i].style.color = sel ? "rgb(var(--he6))" : "rgba(var(--he6),calc(0.62*var(--im)))";
        tabs[i].style.borderColor = sel ? "rgba(var(--he4),0.55)" : "rgba(var(--he4),calc(0.2*var(--am)))";
        tabs[i].setAttribute("aria-pressed", sel ? "true" : "false");
      }
    }
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener("click", function () { cur = this.getAttribute("data-out"); paint(); });
    }
    paint();
  }

  function boot() { wipe(); stock(); texts(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
