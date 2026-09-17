/* VirtualBuddy.ai — Automatisierungs-Hub: Schieber "Handbetrieb → Automatik".
   Rein ereignisgesteuert, keine Timer, keine Animationsframes. */
(function () {
  "use strict";

  var INK = "#F5F0E4";
  var AMBER = "#FFB238";
  var LIME = "#C8FF5E";

  /* Modellrechnung Eingangsrechnung, Minuten je Vorgang und Liegezeit in Stunden */
  var PHASES = [
    { name: "Posteingang sichten und ablegen", man: 2.0, aut: 0.1, waitMan: 6, waitAut: 0.1, touchAut: 0 },
    { name: "Felder erfassen",                 man: 4.0, aut: 0.2, waitMan: 2, waitAut: 0.1, touchAut: 0 },
    { name: "Gegen Bestellung prüfen",         man: 3.0, aut: 0.3, waitMan: 4, waitAut: 0.1, touchAut: 0 },
    { name: "Freigabe einholen",               man: 2.5, aut: 0.5, waitMan: 16, waitAut: 3, touchAut: 1 },
    { name: "Buchen und archivieren",          man: 2.0, aut: 0.1, waitMan: 2, waitAut: 0.1, touchAut: 0 }
  ];
  var PER_WEEK = 40;

  function de(n, d) {
    return n.toFixed(d === undefined ? 1 : d).replace(".", ",");
  }

  function slider() {
    var root = document.getElementById("aut-slider");
    if (!root) return;
    var input = root.querySelector("[data-level]");
    var rows = Array.prototype.slice.call(root.querySelectorAll("[data-phase]"));
    var outLevel = root.querySelector("[data-out-level]");
    var outHours = root.querySelector("[data-out-hours]");
    var outTouch = root.querySelector("[data-out-touch]");
    var outLead = root.querySelector("[data-out-lead]");
    var outSaved = root.querySelector("[data-out-saved]");
    var bar = root.querySelector("[data-bar]");
    if (!input || rows.length !== PHASES.length) return;

    var baseMin = 0, baseWait = 0;
    for (var i = 0; i < PHASES.length; i++) { baseMin += PHASES[i].man; baseWait += PHASES[i].waitMan; }

    function paint() {
      var lvl = parseInt(input.value, 10) || 0;
      var min = 0, wait = 0, touch = 0;

      for (var i = 0; i < PHASES.length; i++) {
        var p = PHASES[i], on = i < lvl;
        min += on ? p.aut : p.man;
        wait += on ? p.waitAut : p.waitMan;
        touch += on ? p.touchAut : 1;

        var row = rows[i];
        var badge = row.querySelector("[data-badge]");
        var time = row.querySelector("[data-time]");
        row.style.borderColor = on ? "rgba(200,255,94,0.28)" : "rgba(255,178,56,0.16)";
        row.style.background = on ? "rgba(200,255,94,0.055)" : "rgba(255,178,56,0.03)";
        if (badge) {
          badge.textContent = on ? "automatisch" : "Handarbeit";
          badge.style.color = on ? LIME : AMBER;
          badge.style.borderColor = on ? "rgba(200,255,94,0.4)" : "rgba(255,178,56,0.4)";
        }
        if (time) {
          time.textContent = de(on ? p.aut : p.man) + " min";
          time.style.color = on ? LIME : INK;
        }
      }

      var hours = min * PER_WEEK / 60;
      var baseHours = baseMin * PER_WEEK / 60;
      if (outLevel) outLevel.textContent = lvl + " von " + PHASES.length;
      if (outHours) outHours.textContent = de(hours) + " h";
      if (outTouch) outTouch.textContent = String(touch);
      if (outLead) outLead.textContent = wait < 10 ? de(wait) + " h" : de(wait / 24) + " Tage";
      if (outSaved) outSaved.textContent = de(baseHours - hours) + " h";
      if (bar) bar.style.width = (100 - (hours / baseHours) * 100).toFixed(1) + "%";
    }

    input.addEventListener("input", paint);
    input.addEventListener("change", paint);
    paint();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", slider);
  else slider();
})();
