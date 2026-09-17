/* VirtualBuddy.ai — IT-Hub: Systemlandkarte "Heute" ↔ "Verbunden".
   Rein ereignisgesteuert, keine Timer, keine Animationsframes. */
(function () {
  "use strict";

  var MINT = "#5EE7C4";
  var CORAL = "#FF8B73";
  var INK = "#E8F1F2";
  var DIM = "rgba(232,241,242,0.58)";

  function map() {
    var root = document.getElementById("it-map");
    if (!root) return;
    var btns = Array.prototype.slice.call(root.querySelectorAll("[data-view]"));
    var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-sysnode]"));
    var manual = Array.prototype.slice.call(root.querySelectorAll("[data-manual]"));
    var linked = Array.prototype.slice.call(root.querySelectorAll("[data-linked]"));
    var hub = root.querySelector("[data-hub]");
    var cap = root.querySelector("[data-syscap]");
    var stat = root.querySelector("[data-sysstat]");
    if (!nodes.length) return;

    var VIEWS = {
      heute: {
        cap: "Jedes System für sich ordentlich — die Übergänge dazwischen laufen über Dateien, E-Mails und Zwischenablage. Jede Handübergabe ist eine Stelle, an der Daten veralten oder auseinanderlaufen.",
        stat: "3 Handübergaben · 0 Schnittstellen"
      },
      verbunden: {
        cap: "Eine Integrationsschicht in der Mitte: jedes System spricht nur mit ihr, nicht mit allen anderen. Für jedes Datenfeld ist festgelegt, welches System die Wahrheit hält.",
        stat: "6 Schnittstellen · 1 führende Quelle je Feld"
      }
    };
    var view = "heute";

    function paint() {
      var on = view === "verbunden";
      var v = VIEWS[view];

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.borderColor = on ? "rgba(94,231,196,0.45)" : "rgba(255,139,115,0.4)";
        var led = nodes[i].querySelector("[data-sysled]");
        if (led) {
          led.style.background = on ? MINT : CORAL;
          led.style.boxShadow = "0 0 9px " + (on ? MINT : CORAL);
        }
        var tag = nodes[i].querySelector("[data-systag]");
        if (tag) {
          tag.textContent = on ? "verbunden" : "Insel";
          tag.style.color = on ? MINT : CORAL;
        }
      }
      for (var m = 0; m < manual.length; m++) {
        manual[m].style.opacity = on ? "0" : "1";
      }
      for (var l = 0; l < linked.length; l++) {
        linked[l].style.opacity = on ? "1" : "0";
      }
      if (hub) {
        hub.style.borderStyle = on ? "solid" : "dashed";
        hub.style.borderColor = on ? "rgba(94,231,196,0.65)" : "rgba(232,241,242,0.3)";
        hub.style.background = on
          ? "linear-gradient(180deg,rgba(94,231,196,0.14),rgba(9,15,17,0.97))"
          : "linear-gradient(180deg,rgba(232,241,242,0.04),rgba(9,15,17,0.97))";
        var htag = hub.querySelector("[data-hubtag]");
        if (htag) {
          htag.textContent = on ? "aktiv" : "fehlt";
          htag.style.color = on ? MINT : CORAL;
        }
      }
      if (cap) cap.textContent = v.cap;
      if (stat) {
        stat.textContent = v.stat;
        stat.style.color = on ? MINT : CORAL;
      }
      for (var b = 0; b < btns.length; b++) {
        var sel = btns[b].getAttribute("data-view") === view;
        btns[b].style.background = sel ? "rgba(94,231,196,0.18)" : "transparent";
        btns[b].style.color = sel ? INK : DIM;
        btns[b].style.borderColor = sel ? "rgba(94,231,196,0.55)" : "rgba(94,231,196,0.18)";
        btns[b].setAttribute("aria-pressed", sel ? "true" : "false");
      }
    }

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        view = this.getAttribute("data-view");
        paint();
      });
    }
    paint();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", map);
  else map();
})();
