/* VirtualBuddy.ai — Marketing-Hub: Nurture-Strecke und Kennzahlen-Tafel.
   Rein ereignisgesteuert, keine Timer, keine Animationsframes. */
(function () {
  "use strict";

  var INK = "rgb(var(--hm1))";
  var PAPER = "rgb(var(--hm2))";
  var CREAM = "rgb(var(--hm3))";
  var YEL = "rgb(var(--hm4))";
  var DIM = "rgba(var(--hm3),calc(0.6*var(--im)))";

  /* ---------------- Nurture-Strecke ---------------- */

  var STEPS = [
    { day: "Tag 0", kind: "Auslöser", title: "Anfrage über das Formular",
      body: "Der Kontakt landet im CRM, wird nach Thema und Region eingeordnet und einem zuständigen Menschen zugewiesen. Die Einwilligung wird mit Zeitpunkt, Quelle und Zweck festgehalten — ohne sie startet die Strecke nicht.",
      meta: "automatisch · protokolliert" },
    { day: "Tag 0", kind: "Aktion", title: "Bestätigung mit Antwort auf die Frage",
      body: "Keine Eingangsbestätigung ohne Inhalt. Die Mail beantwortet bereits, was üblicherweise als Erstes gefragt wird, und nennt einen konkreten nächsten Schritt.",
      meta: "Vorlage · vorab freigegeben" },
    { day: "Tag 2", kind: "Bedingung", title: "Hat ein Mensch schon geantwortet?",
      body: "Wenn ja, endet die Strecke hier — nichts ist schlimmer als eine Automatik, die neben einem laufenden Gespräch weiterschreibt. Wenn nein, läuft sie weiter.",
      meta: "Abbruchbedingung" },
    { day: "Tag 4", kind: "Aktion", title: "Ein passendes Beispiel",
      body: "Ein Fall aus demselben Themenfeld, ausgewählt nach der Einordnung aus Tag 0. Kein Rundschreiben, sondern der Inhalt, der zur Anfrage passt.",
      meta: "segmentiert · 1 Mail" },
    { day: "Tag 9", kind: "Aufgabe", title: "Wiedervorlage beim Zuständigen",
      body: "Kein automatischer Nachfass-Text, sondern eine Aufgabe für einen Menschen mit dem gesamten Kontext: Anfrage, Antwort, was gelesen wurde. Die Entscheidung über den nächsten Schritt trifft niemand anderes.",
      meta: "Mensch übernimmt" },
    { day: "Tag 14", kind: "Abschluss", title: "Strecke beenden und auswerten",
      body: "Kontakt aus der Strecke nehmen, Ergebnis vermerken, Kennzahl fortschreiben. Wer nicht reagiert hat, wird nicht erneut angeschrieben — Frequenz ist kein Ersatz für Relevanz.",
      meta: "Ende · keine Wiederholung" }
  ];

  function drip() {
    var root = document.getElementById("mk-drip");
    if (!root) return;
    var rail = Array.prototype.slice.call(root.querySelectorAll("[data-step]"));
    var out = root.querySelector("[data-stepout]");
    var pos = root.querySelector("[data-steppos]");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    if (!rail.length || !out) return;

    var cur = 0;

    function paint() {
      var s = STEPS[cur];
      out.innerHTML =
        '<span style="display:flex;flex-wrap:wrap;align-items:baseline;gap:10px 14px;margin-bottom:14px">'
        + '<span style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:4px 9px;background:' + INK + ';color:' + YEL + '">' + s.kind + '</span>'
        + '<span style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:11px;letter-spacing:0.1em;color:rgba(var(--hm1),0.72)">' + s.meta + '</span></span>'
        + '<h3 style="margin:0 0 12px;font-size:clamp(20px,2.4vw,27px);line-height:1.15;font-weight:800;letter-spacing:-0.03em;color:' + INK + '">' + s.title + '</h3>'
        + '<p style="margin:0;font-size:15.5px;line-height:1.7;color:rgba(var(--hm1),0.82);text-wrap:pretty">' + s.body + '</p>';
      if (pos) pos.textContent = (cur + 1) + " / " + STEPS.length;
      for (var i = 0; i < rail.length; i++) {
        var sel = i === cur;
        rail[i].style.background = sel ? YEL : "transparent";
        rail[i].style.color = sel ? INK : CREAM;
        rail[i].style.borderColor = sel ? YEL : "rgba(var(--hm3),0.22)";
        rail[i].setAttribute("aria-pressed", sel ? "true" : "false");
      }
      if (prev) prev.disabled = cur === 0;
      if (next) next.disabled = cur === STEPS.length - 1;
      if (prev) prev.style.opacity = cur === 0 ? "0.35" : "1";
      if (next) next.style.opacity = cur === STEPS.length - 1 ? "0.35" : "1";
    }

    for (var i = 0; i < rail.length; i++) {
      (function (n) {
        rail[n].addEventListener("click", function () { cur = n; paint(); });
      })(i);
    }
    if (prev) prev.addEventListener("click", function () { if (cur > 0) { cur--; paint(); } });
    if (next) next.addEventListener("click", function () { if (cur < STEPS.length - 1) { cur++; paint(); } });
    paint();
  }

  /* ---------------- Kennzahlen: gezählt oder entschieden ---------------- */

  function metrics() {
    var root = document.getElementById("mk-metrics");
    if (!root) return;
    var btns = Array.prototype.slice.call(root.querySelectorAll("[data-mset]"));
    var out = root.querySelector("[data-mout]");
    var cap = root.querySelector("[data-mcap]");
    if (!out) return;

    var SETS = {
      gezaehlt: {
        cap: "Diese Zahlen stehen in fast jedem Bericht. Sie steigen, wenn man mehr sendet und mehr postet — und sagen nichts darüber, ob daraus Geschäft wird. Wir bauen sie nicht ab, wir hängen keine Entscheidung daran.",
        rows: [
          ["Impressionen", "184.000", "Wächst mit dem Budget, nicht mit der Relevanz."],
          ["Follower", "4.120", "Sagt nichts über Kaufabsicht oder Region."],
          ["Öffnungsrate", "41 %", "Durch Bildvorschau und Schutzfilter kaum noch belastbar."],
          ["Likes je Beitrag", "38", "Korreliert mit Uhrzeit und Format, nicht mit Umsatz."],
          ["Newsletter-Abonnenten", "2.740", "Ohne Aktivitätsfenster nur eine Zahl im Werkzeug."]
        ]
      },
      entschieden: {
        cap: "Diese Zahlen verändern Entscheidungen: Welcher Kanal bekommt mehr, welcher weniger, welcher Ablauf muss repariert werden. Sie sind unbequemer zu erheben, weil sie Systeme verbinden müssen — genau das ist unsere Arbeit.",
        rows: [
          ["Anfragen mit Thema und Region", "63 im Monat", "Ordnet zu, woher qualifizierte Nachfrage kommt."],
          ["Zeit bis zur ersten Antwort", "4 Std. 10 Min.", "Der stärkste Hebel auf die Abschlussquote — und messbar."],
          ["Anfragen ohne Antwort nach 48 Std.", "7", "Zeigt kaputte Übergaben statt fehlende Reichweite."],
          ["Angebote aus Anfragen", "38 %", "Verbindet Marketing mit dem, was der Vertrieb daraus macht."],
          ["Nachweisbare Einwilligungen", "2.612 von 2.740", "Die Differenz ist ein Risiko, keine Rundungsdifferenz."]
        ]
      }
    };
    var cur = "gezaehlt";

    function paint() {
      var s = SETS[cur], good = cur === "entschieden";
      var html = "";
      for (var i = 0; i < s.rows.length; i++) {
        var r = s.rows[i];
        html += '<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 18px;align-items:baseline;padding:14px 0;border-bottom:1px solid rgba(var(--hm1),0.14)">'
          + '<span style="min-width:0"><span style="display:block;font-size:16px;font-weight:700;letter-spacing:-0.02em;color:' + INK + ';margin-bottom:5px">' + r[0] + '</span>'
          + '<span style="display:block;font-size:13.5px;line-height:1.55;color:rgba(var(--hm1),0.7);text-wrap:pretty">' + r[2] + '</span></span>'
          + '<span style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:15px;white-space:nowrap;color:' + INK
          + (good ? ';background:' + YEL + ';padding:3px 8px' : '') + '">' + r[1] + '</span></div>';
      }
      out.innerHTML = html;
      if (cap) cap.textContent = s.cap;
      for (var b = 0; b < btns.length; b++) {
        var sel = btns[b].getAttribute("data-mset") === cur;
        btns[b].style.background = sel ? YEL : "transparent";
        btns[b].style.color = sel ? INK : DIM;
        btns[b].style.borderColor = sel ? YEL : "rgba(var(--hm3),0.22)";
        btns[b].setAttribute("aria-pressed", sel ? "true" : "false");
      }
    }
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () { cur = this.getAttribute("data-mset"); paint(); });
    }
    paint();
  }

  function boot() { drip(); metrics(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
