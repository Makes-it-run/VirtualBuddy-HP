/* VirtualBuddy.ai — Web-Hub: Eyecatcher der Papier-Welt.
   Alles ereignisgesteuert (Klick, Tastatur, Regler) — kein Autoplay,
   keine Animationsschleifen in JS. */
(function () {
  "use strict";

  var INK = "#E8F5EC", FILL = "#24DB6A", ON = "#04140A", SURF2 = "#13211A",
      ULT = "#24DB6A", DEEP = "#5BFF9B", VERM = "rgba(232,245,236,0.45)",
      SOFT = "rgba(232,245,236,0.68)", RULE = "rgba(232,245,236,0.16)";
  var PAPER = ON, SHEET = "#0F1A14";
  var MONO = "font-family:'JetBrains Mono',ui-monospace,monospace";

  function all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  /* Reiter/Schalter einfärben: gewählter Zustand ist Tinte auf Papier-Umkehr */
  function tabs(btns, attr, cur) {
    btns.forEach(function (b) {
      var sel = b.getAttribute(attr) === cur;
      b.style.background = sel ? FILL : "transparent";
      b.style.color = sel ? ON : SOFT;
      b.style.borderColor = sel ? FILL : RULE;
      b.setAttribute("aria-pressed", sel ? "true" : "false");
    });
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* ================= 1 · Antwortmaschine ================= */

  function answer() {
    var root = document.getElementById("web-answer");
    if (!root) return;
    var qs = all(root, "[data-q]"), ms = all(root, "[data-mode]");
    var out = root.querySelector("[data-answerout]"), cap = root.querySelector("[data-answercap]");
    if (!out) return;

    var D = {
      a: {
        query: "metallbau nordhausen",
        serp: [
          { u: "handwerk-branchenbuch.de › nordhausen › metallbau", t: "Metallbau Nordhausen — 14 Betriebe im Verzeichnis", s: "Liste mit Adresse und Telefonnummer, keine Leistungen, letzte Pflege 2023." },
          { u: "ihre-firma.de", t: "Startseite — Ihre Firma GmbH", s: "Willkommen auf unserer Internetseite. Wir freuen uns über Ihr Interesse.", mine: true },
          { u: "wettbewerber.de › leistungen › schweissarbeiten", t: "Schweißarbeiten & Stahlbau in Nordhausen — Leistungen, Maße, Ablauf", s: "Welche Werkstoffe, welche Toleranzen, welche Losgrößen — mit Preisrahmen und Ansprechpartner." }
        ],
        ai: {
          text: "In Nordhausen gibt es mehrere Metallbaubetriebe. Für Stahlbau und Schweißarbeiten mit dokumentierten Toleranzen wird häufig Wettbewerber GmbH genannt; ein Branchenverzeichnis listet 14 weitere Betriebe.",
          cites: ["wettbewerber.de", "handwerk-branchenbuch.de"],
          mine: false
        },
        cap: "Ihre Startseite steht auf Platz 2 — beantwortet die Frage aber nicht. Die KI-Antwort zitiert deshalb den Wettbewerber, nicht Sie."
      },
      b: {
        query: "wer kann werkzeugbau in thüringen",
        serp: [
          { u: "wettbewerber.de › werkzeugbau", t: "Werkzeugbau Thüringen — Vorrichtungen, Lehren, Umbauten", s: "Leistungsumfang, Maschinenpark, Durchlaufzeiten und Anfahrt." },
          { u: "ihre-firma.de › leistungen › werkzeugbau", t: "Werkzeugbau — Vorrichtungen und Lehren für Serien ab 5 Stück", s: "Was wir fertigen, in welchen Toleranzen, mit welchen Maschinen und in welcher Zeit. Mit Ansprechpartner.", mine: true },
          { u: "forum-fertigung.de › thread › 81244", t: "Empfehlung Werkzeugbau Region Nordthüringen?", s: "Forenbeitrag von 2021 mit drei Nennungen und einer Absage." }
        ],
        ai: {
          text: "Für Werkzeugbau in Thüringen kommen unter anderem Ihre Firma GmbH (Vorrichtungen und Lehren ab Losgröße 5, Toleranzen bis ±0,02 mm) und Wettbewerber GmbH in Frage. Ihre Firma nennt Durchlaufzeiten und einen Ansprechpartner direkt auf der Leistungsseite.",
          cites: ["ihre-firma.de/leistungen/werkzeugbau", "wettbewerber.de"],
          mine: true
        },
        cap: "Eine Seite je Leistung, die die Frage vollständig beantwortet — mit Zahlen, Einheiten und Ansprechpartner. Genau daraus wird zitiert."
      },
      c: {
        query: "kosten cnc-fräsen aluminium kleinserie",
        serp: [
          { u: "ihre-firma.de › leistungen › cnc-fraesen › preise", t: "CNC-Fräsen Aluminium: was den Preis bestimmt (mit Rechenbeispiel)", s: "Rüstzeit, Losgröße, Toleranz, Nachbearbeitung — vier Treiber, ein Beispiel mit 25 Teilen.", mine: true },
          { u: "portal-zerspanung.de › preise", t: "Preisvergleich Zerspanung — Richtwerte je Stunde", s: "Allgemeine Stundensätze ohne Bezug auf Losgröße oder Werkstoff." },
          { u: "wettbewerber.de › kontakt", t: "Kontakt — Wettbewerber GmbH", s: "Anfrageformular. Preise auf Anfrage." }
        ],
        ai: {
          text: "Der Preis für gefräste Aluminiumteile in Kleinserie hängt vor allem von Rüstzeit, Losgröße, geforderter Toleranz und Nachbearbeitung ab. Ihre Firma GmbH rechnet das an einem Beispiel mit 25 Teilen vor und nennt die vier Treiber einzeln.",
          cites: ["ihre-firma.de/leistungen/cnc-fraesen/preise"],
          mine: true
        },
        cap: "Die unbequeme Frage nach dem Preis ehrlich beantwortet — das ist die Seite, die in Antworten landet und qualifizierte Anfragen bringt."
      }
    };
    var q = "a", mode = "serp";

    function serpHtml(d) {
      return '<div style="display:grid;gap:18px">' + d.serp.map(function (r, i) {
        return '<div style="position:relative;padding:' + (r.mine ? "13px 15px" : "0") + ';'
          + (r.mine ? "background:rgba(36,219,106,0.09);border-left:2px solid " + ULT + ";" : "")
          + '">'
          + '<span style="display:block;' + MONO + ';font-size:11.5px;color:' + SOFT + ';margin-bottom:4px">' + esc(r.u) + '</span>'
          + '<span style="display:block;font-size:17px;line-height:1.3;font-weight:600;color:' + DEEP + ';margin-bottom:5px">' + esc(r.t) + '</span>'
          + '<span style="display:block;font-size:13.5px;line-height:1.55;color:' + SOFT + '">' + esc(r.s) + '</span>'
          + (r.mine ? '<span style="display:inline-block;margin-top:9px;' + MONO + ';font-size:10px;letter-spacing:0.12em;text-transform:uppercase;background:' + ULT + ';color:' + ON + ';padding:3px 8px">Ihre Seite · Position ' + (i + 1) + '</span>' : '')
          + '</div>';
      }).join('') + '</div>';
    }

    function aiHtml(d) {
      return '<div style="display:grid;gap:14px">'
        + '<p style="margin:0;font-size:15.5px;line-height:1.72;color:' + INK + '">' + esc(d.ai.text) + '</p>'
        + '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">'
        + '<span style="' + MONO + ';font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:' + SOFT + '">Quellen</span>'
        + d.ai.cites.map(function (c, i) {
          var mine = c.indexOf("ihre-firma") === 0;
          return '<span style="' + MONO + ';font-size:11.5px;padding:5px 9px;border:1px solid ' + (mine ? ULT : RULE) + ';background:' + (mine ? "rgba(36,219,106,0.12)" : "transparent") + ';color:' + (mine ? DEEP : SOFT) + '">' + (i + 1) + ' · ' + esc(c) + '</span>';
        }).join('')
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:9px;padding:11px 13px;background:' + (d.ai.mine ? "rgba(36,219,106,0.12)" : "rgba(232,245,236,0.05)") + ';border-left:2px solid ' + (d.ai.mine ? ULT : VERM) + '">'
        + '<span style="' + MONO + ';font-size:12.5px;font-weight:500;color:' + (d.ai.mine ? DEEP : VERM) + '">' + (d.ai.mine ? "Sie werden zitiert" : "Sie werden nicht zitiert") + '</span></div>'
        + '</div>';
    }

    function paint() {
      var d = D[q];
      out.innerHTML = mode === "serp" ? serpHtml(d) : aiHtml(d);
      if (cap) cap.textContent = d.cap;
      qs.forEach(function (b) {
        var sel = b.getAttribute("data-q") === q;
        b.style.background = sel ? FILL : SHEET;
        b.style.color = sel ? ON : SOFT;
        b.setAttribute("aria-pressed", sel ? "true" : "false");
      });
      tabs(ms, "data-mode", mode);
    }
    qs.forEach(function (b) { b.addEventListener("click", function () { q = this.getAttribute("data-q"); paint(); }); });
    ms.forEach(function (b) { b.addEventListener("click", function () { mode = this.getAttribute("data-mode"); paint(); }); });
    paint();
  }

  /* ================= 2 · Ladezeit ================= */

  function speed() {
    var root = document.getElementById("web-speed");
    if (!root) return;
    var rng = root.querySelector("[data-speedrng]");
    if (!rng) return;
    var kbOut = root.querySelector("[data-kb]"), lcp = root.querySelector("[data-lcp]"),
        bar = root.querySelector("[data-bar]"), frames = all(root, "[data-frame]"),
        bounce = root.querySelector("[data-bounce]"), verdict = root.querySelector("[data-verdict]"),
        cap = root.querySelector("[data-speedcap]");

    function paint() {
      var kb = parseInt(rng.value, 10) || 400;
      var t = 0.32 + (kb / 1000) * 0.55;                 /* Modellrechnung, mobiles Netz */
      var pct = Math.max(0, Math.min(100, (t / 6) * 100));
      var bo = Math.round(Math.max(6, Math.min(58, 7 + (t - 0.8) * 10)));
      if (kbOut) kbOut.textContent = kb >= 1000 ? (kb / 1000).toFixed(1).replace(".", ",") + " MB" : kb + " KB";
      if (lcp) lcp.textContent = t.toFixed(1).replace(".", ",") + " s";
      if (bar) {
        bar.style.width = pct + "%";
        bar.style.background = t <= 1.6 ? FILL : t <= 3 ? "rgba(232,245,236,0.52)" : "rgba(232,245,236,0.26)";
      }
      if (bounce) bounce.textContent = bo + " %";
      if (verdict) {
        var ok = t <= 1.6, mid = t <= 3;
        verdict.textContent = ok ? "gut" : mid ? "grenzwertig" : "zu langsam";
        verdict.style.background = ok ? FILL : "transparent";
        verdict.style.color = ok ? ON : INK;
        verdict.style.border = ok ? "1px solid " + FILL : "1px solid rgba(232,245,236,0.3)";
      }
      /* Vier Momentaufnahmen: was ist zum Zeitpunkt X gezeichnet? */
      [0.5, 1, 2, 4].forEach(function (at, i) {
        var f = frames[i];
        if (!f) return;
        var share = Math.max(0, Math.min(1, at / t));
        var blocks = all(f, "[data-fb]");
        blocks.forEach(function (b, j) {
          var need = (j + 1) / blocks.length;
          var on = share >= need;
          b.style.background = on ? (j === 0 ? INK : j === 1 ? FILL : "rgba(232,245,236,0.34)") : "rgba(232,245,236,0.07)";
          b.style.opacity = on ? "1" : "1";
        });
        var lab = f.querySelector("[data-flab]");
        if (lab) {
          lab.textContent = share >= 1 ? "vollständig" : Math.round(share * 100) + " %";
          lab.style.color = share >= 1 ? DEEP : SOFT;
        }
      });
      rng.setAttribute("aria-valuetext", (kb >= 1000 ? (kb / 1000).toFixed(1) + " Megabyte" : kb + " Kilobyte") + ", größtes Element nach " + t.toFixed(1) + " Sekunden");
      if (cap) {
        cap.textContent = t <= 1.6
          ? "Unter 1,6 Sekunden bleibt der Eindruck sofort: Text steht, bevor jemand zu scrollen anfängt. Erreicht wird das fast immer über Bildgrößen und -formate, nicht über den Serverpreis."
          : t <= 3
            ? "Zwischen 1,6 und 3 Sekunden verliert man vor allem mobile Besucher am Anfang des Besuchs. Meist stecken drei bis vier unkomprimierte Bilder im sichtbaren Bereich."
            : "Über 3 Sekunden ist die Seite auf dem Handy praktisch unbenutzbar. In dieser Größenordnung liegen fast immer Videos im Hintergrund, Bilder in Originalauflösung oder ein Baukasten, der alle Skripte auf jeder Seite lädt.";
      }
    }
    rng.addEventListener("input", paint);
    rng.addEventListener("change", paint);
    paint();
  }

  /* ================= 3 · Ansichtsbreite ================= */

  function viewport() {
    var root = document.getElementById("web-view");
    if (!root) return;
    var btns = all(root, "[data-vw]"), sheet = root.querySelector("[data-vwsheet]");
    if (!sheet) return;
    var note = root.querySelector("[data-vwnote]"), meas = root.querySelector("[data-vwmeas]");
    var nav = sheet.querySelector("[data-vwnav]"), burger = sheet.querySelector("[data-vwburger]"),
        grid = sheet.querySelector("[data-vwgrid]"), hero = sheet.querySelector("[data-vwhero]");
    var cur = "390";
    var D = {
      "390": { cols: 1, note: "390 px — Telefon. Hier entscheidet sich, ob die Seite funktioniert: ein Strang, Navigation zusammengefaltet, ein Aufruf zur Handlung sichtbar ohne Scrollen. Zwei Drittel der Besuche sehen genau das.", meas: "Zeilenlänge ca. 42 Zeichen" },
      "768": { cols: 2, note: "768 px — Tablet und schmales Fenster. Zwei Spalten, Navigation noch zusammengefaltet. Die häufigste Stelle, an der Baukasten-Seiten kaputte Abstände zeigen, weil nur für zwei Größen entworfen wurde.", meas: "Zeilenlänge ca. 64 Zeichen" },
      "1280": { cols: 3, note: "1280 px — Schreibtisch. Drei Spalten, Navigation ausgeklappt. Wichtig ist hier nur, dass Textspalten nicht mitwachsen: über 75 Zeichen je Zeile sinkt die Lesegeschwindigkeit messbar.", meas: "Zeilenlänge begrenzt auf 68 Zeichen" }
    };
    function paint() {
      var d = D[cur];
      sheet.style.maxWidth = cur + "px";
      if (nav) nav.style.display = cur === "1280" ? "flex" : "none";
      if (burger) burger.style.display = cur === "1280" ? "none" : "flex";
      if (grid) grid.style.gridTemplateColumns = "repeat(" + d.cols + ",minmax(0,1fr))";
      if (hero) hero.style.fontSize = cur === "390" ? "19px" : cur === "768" ? "24px" : "30px";
      if (note) note.textContent = d.note;
      if (meas) meas.textContent = d.meas;
      btns.forEach(function (b) {
        var sel = b.getAttribute("data-vw") === cur;
        b.style.background = sel ? FILL : "transparent";
        b.style.color = sel ? ON : SOFT;
        b.setAttribute("aria-pressed", sel ? "true" : "false");
      });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { cur = this.getAttribute("data-vw"); paint(); }); });
    paint();
  }

  /* ================= 4 · Seitenplan ================= */

  function plan() {
    var root = document.getElementById("web-plan");
    if (!root) return;
    var chips = all(root, "[data-page]"), out = root.querySelector("[data-planout]");
    if (!out) return;
    var count = root.querySelector("[data-plancount]"), cap = root.querySelector("[data-plancap]");
    var META = {
      start: { t: "Start", kids: [], note: "Was Sie machen, für wen, und der nächste Schritt — in dieser Reihenfolge." },
      leistungen: { t: "Leistungen", kids: ["je Leistung eine Seite"], note: "Eine Seite je Leistung. Sammelseiten werden nicht gefunden und beantworten keine Frage." },
      referenzen: { t: "Referenzen", kids: ["Projekt mit Zahlen"], note: "Ausgangslage, Aufgabe, Ergebnis mit einer nachprüfbaren Zahl." },
      ueber: { t: "Über uns", kids: ["Team", "Standort"], note: "Gesichter und Ort. Die zweithäufigste besuchte Seite im Mittelstand." },
      kontakt: { t: "Kontakt", kids: ["Anfahrt"], note: "Telefon, Formular, Anfahrt — ohne Pflichtfelder, die niemand beantworten kann." },
      blog: { t: "Wissen", kids: ["Beitrag"], note: "Nur sinnvoll, wenn jemand im Haus wirklich schreibt. Sonst veraltet der Bereich sichtbar." },
      stellen: { t: "Stellen", kids: ["Stellenanzeige"], note: "Eigene Seite je Stelle, mit Gehaltsrahmen — sonst bleibt sie ohne Wirkung." }
    };
    var on = { start: true, leistungen: true, kontakt: true };
    function paint() {
      var keys = Object.keys(META).filter(function (k) { return on[k]; });
      out.innerHTML = keys.map(function (k) {
        var m = META[k];
        return '<div style="border-left:2px solid ' + RULE + ';padding:0 0 0 14px;margin:0 0 14px">'
          + '<span style="display:block;' + MONO + ';font-size:13px;color:' + INK + ';margin-bottom:4px">/' + k.replace("ueber", "ueber-uns") + '/</span>'
          + '<span style="display:block;font-size:15px;font-weight:700;color:' + INK + ';margin-bottom:4px">' + m.t + '</span>'
          + '<span style="display:block;font-size:13.5px;line-height:1.55;color:' + SOFT + '">' + m.note + '</span>'
          + (m.kids.length ? '<span style="display:inline-block;margin-top:7px;' + MONO + ';font-size:11px;color:' + DEEP + '">+ ' + m.kids.join(", ") + '</span>' : '')
          + '</div>';
      }).join('') || '<p style="margin:0;font-size:14.5px;color:' + SOFT + '">Keine Seite gewählt. Ohne Startseite und Kontakt geht es nicht.</p>';
      if (count) count.textContent = keys.length + (keys.length === 1 ? " Seite" : " Seiten");
      if (cap) {
        cap.textContent = keys.length <= 3
          ? "Drei bis fünf Seiten reichen für den Anfang völlig aus — und sind nach zwei Jahren noch aktuell."
          : keys.length <= 5
            ? "Fünf Seiten sind der übliche Umfang für einen Betrieb. Jede zusätzliche Seite braucht jemanden, der sie pflegt."
            : "Ab sieben Seiten wird Pflege zur Aufgabe, nicht zum Nebenbei. Wissen und Stellen veralten am schnellsten und fallen Besuchern zuerst auf.";
      }
      chips.forEach(function (c) {
        var k = c.getAttribute("data-page"), sel = !!on[k];
        c.style.background = sel ? FILL : "transparent";
        c.style.color = sel ? ON : SOFT;
        c.setAttribute("aria-pressed", sel ? "true" : "false");
      });
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var k = this.getAttribute("data-page");
        on[k] = !on[k];
        paint();
      });
    });
    paint();
  }

  /* ================= 5 · Lesbarkeit ================= */

  function type() {
    var root = document.getElementById("web-type");
    if (!root) return;
    var btns = all(root, "[data-ty]"), sample = root.querySelector("[data-tysample]");
    if (!sample) return;
    var ratio = root.querySelector("[data-tyratio]"), verd = root.querySelector("[data-tyverdict]"),
        meta = root.querySelector("[data-tymeta]"), cap = root.querySelector("[data-tycap]");
    var D = {
      grau: { size: 13, color: "#5E6B63", width: "100%", lh: 1.45, ratio: "3,2:1", ok: false,
        meta: "13 px · gedämpftes Grau · ca. 118 Zeichen je Zeile",
        cap: "Der häufigste Fehler in gestalteten Themes: graue Schrift, weil es ruhiger aussieht. 3,2:1 ist für Fließtext unzulässig und für Menschen über 50 schlicht nicht lesbar." },
      mittel: { size: 15, color: "#7A8A80", width: "84%", lh: 1.6, ratio: "4,9:1", ok: true,
        meta: "15 px · Mittelgrau · ca. 92 Zeichen je Zeile",
        cap: "Knapp über der Grenze von 4,5:1 — zulässig, aber ohne Reserve. Bei Sonnenlicht auf dem Handy ist das die Stelle, an der Besucher aufgeben." },
      tinte: { size: 17, color: "#E8F5EC", width: "62%", lh: 1.7, ratio: "15,6:1", ok: true,
        meta: "17 px · volle Deckung · ca. 68 Zeichen je Zeile",
        cap: "17 px, 15,6:1 Kontrast und begrenzte Zeilenlänge. Das ist keine Geschmacksfrage, sondern der Zustand, in dem Text tatsächlich gelesen wird." }
    };
    var cur = "grau";
    function paint() {
      var d = D[cur];
      sample.style.fontSize = d.size + "px";
      sample.style.color = d.color;
      sample.style.lineHeight = String(d.lh);
      sample.style.maxWidth = d.width;
      if (ratio) { ratio.textContent = d.ratio; ratio.style.color = d.ok ? DEEP : VERM; }
      if (verd) {
        verd.textContent = d.ok ? "bestanden" : "durchgefallen";
        verd.style.background = d.ok ? FILL : "transparent";
        verd.style.color = d.ok ? ON : INK;
        verd.style.border = d.ok ? "1px solid " + FILL : "1px solid rgba(232,245,236,0.3)";
      }
      if (meta) meta.textContent = d.meta;
      if (cap) cap.textContent = d.cap;
      tabs(btns, "data-ty", cur);
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { cur = this.getAttribute("data-ty"); paint(); }); });
    paint();
  }

  /* ================= 6 · Weg einer Anfrage ================= */

  function dns() {
    var root = document.getElementById("web-dns");
    if (!root) return;
    var hops = all(root, "[data-hop]"), detail = root.querySelector("[data-hopdetail]");
    if (!detail) return;
    var D = {
      domain: { t: "Domain", ms: "0 ms", h: "Der Name, den Sie besitzen",
        d: "Die Domain ist das einzige Stück Ihres Auftritts, das nicht ersetzbar ist. Sie gehört in Ihren eigenen Vertrag, nicht in den einer Agentur — sonst ist ein Wechsel später eine Verhandlung statt eines Umzugs.",
        risk: "Häufigster Fehler: Domain läuft auf die Agentur." },
      dnsz: { t: "DNS", ms: "24 ms", h: "Das Adressbuch",
        d: "Der DNS-Eintrag sagt, welcher Server die Seite ausliefert — und getrennt davon, welcher Server die E-Mail annimmt. Web und Mail sind zwei Einträge, die man unabhängig umziehen kann.",
        risk: "Beim Umzug zuerst die Gültigkeitsdauer senken, sonst zeigen Besucher tagelang auf den alten Server." },
      tls: { t: "TLS", ms: "52 ms", h: "Das Schloss",
        d: "Das Zertifikat beweist, dass die Verbindung zu Ihnen gehört. Es wird automatisch erneuert — wenn die Erneuerung scheitert, ist die Seite nicht langsam, sondern für alle Browser gesperrt.",
        risk: "Abgelaufene Zertifikate sind der häufigste Totalausfall." },
      server: { t: "Server", ms: "90 ms", h: "Wer antwortet",
        d: "Hier wird die Seite erzeugt oder eine fertige Datei herausgegeben. Für einen Betrieb mit einigen tausend Besuchen im Monat ist der Serverpreis fast nie der Grund für langsame Seiten.",
        risk: "Standort in der EU wählen — wegen Laufzeit und wegen Auftragsverarbeitung." },
      antwort: { t: "Antwort", ms: "0,4 s", h: "Was ankommt",
        d: "Erst jetzt beginnt das, was der Besucher sieht: HTML, dann Schrift, dann Bilder. Alles davor sind Millisekunden — die Sekunden entstehen danach, im Gewicht der Seite.",
        risk: "Sicherung und Rückspielprobe gehören zum Betrieb, nicht zum Notfall." }
    };
    var cur = "domain";
    function paint() {
      var d = D[cur];
      detail.innerHTML = '<span style="display:block;' + MONO + ';font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;color:' + VERM + ';margin-bottom:8px">' + d.t + ' · ' + d.ms + '</span>'
        + '<span style="display:block;font-size:19px;font-weight:700;letter-spacing:-0.02em;color:' + INK + ';margin-bottom:9px">' + d.h + '</span>'
        + '<p style="margin:0 0 12px;font-size:14.8px;line-height:1.68;color:' + SOFT + '">' + d.d + '</p>'
        + '<span style="display:block;padding:10px 12px;background:rgba(232,245,236,0.05);border-left:2px solid ' + VERM + ';font-size:13.5px;line-height:1.55;color:' + INK + '">' + d.risk + '</span>';
      hops.forEach(function (h) {
        var sel = h.getAttribute("data-hop") === cur;
        h.style.background = sel ? FILL : SHEET;
        h.style.borderColor = sel ? FILL : RULE;
        h.setAttribute("aria-pressed", sel ? "true" : "false");
        all(h, "[data-hoptxt]").forEach(function (t) { t.style.color = sel ? ON : INK; });
        all(h, "[data-hopms]").forEach(function (t) { t.style.color = sel ? "rgba(4,20,10,0.72)" : SOFT; });
      });
    }
    hops.forEach(function (h) { h.addEventListener("click", function () { cur = this.getAttribute("data-hop"); paint(); }); });
    paint();
  }

  /* ================= 7 · Trefferanzeige ================= */

  function serp() {
    var root = document.getElementById("web-serp");
    if (!root) return;
    var btns = all(root, "[data-var]"), out = root.querySelector("[data-serpout]");
    if (!out) return;
    var cap = root.querySelector("[data-serpcap]");
    var D = {
      alt: {
        url: "ihre-firma.de › produkte › p-1042",
        title: "Startseite | Ihre Firma GmbH | Metallbau, Stahlbau, Schlosserei, Nordhausen, Thüringen",
        desc: "Herzlich willkommen auf unserer Webseite. Wir sind Ihr kompetenter Partner in allen Fragen rund um…",
        cap: "Titel zu lang und mit Schlagworten gefüllt, Beschreibung ohne Inhalt, Adresse nicht sprechend. Der Titel wird abgeschnitten — abgeschnitten wird immer der hintere Teil, also genau die Leistung."
      },
      kurz: {
        url: "ihre-firma.de › leistungen › stahlbau",
        title: "Stahlbau Nordhausen — Ihre Firma GmbH",
        desc: "Tragwerke, Treppen und Geländer aus eigener Fertigung. Aufmaß vor Ort, Montage im Umkreis von 80 km.",
        cap: "Kurz, eindeutig, ohne Füllwörter. Beides passt vollständig in die Anzeige. Das ist die Fassung, die geklickt wird — und die einer KI zeigt, worum es auf der Seite geht."
      },
      frage: {
        url: "ihre-firma.de › leistungen › stahlbau › kosten",
        title: "Was kostet ein Stahltreppenlauf? Vier Preistreiber",
        desc: "Material, Geländer, Feuerverzinkung, Montagehöhe — mit Rechenbeispiel für einen geraden Lauf über 3,2 m.",
        cap: "Eine Seite, die eine echte Frage im Titel trägt und im Text beantwortet. Diese Art Seite wird in KI-Antworten zitiert, weil sie die Frage vollständig enthält — nicht, weil sie oft das Schlagwort nennt."
      }
    };
    var cur = "alt";
    /* Näherung: Pixelbreite des Titels bei 20px Systemschrift */
    function px(s) { return Math.round(s.length * 9.1); }
    function paint() {
      var d = D[cur], w = px(d.title), over = w > 580;
      var shown = over ? d.title.slice(0, 63).replace(/\s+\S*$/, "") + " …" : d.title;
      out.innerHTML = '<div style="padding:16px 18px;background:' + SURF2 + ';border:1px solid ' + RULE + '">'
        + '<span style="display:block;' + MONO + ';font-size:12px;color:' + SOFT + ';margin-bottom:5px">' + esc(d.url) + '</span>'
        + '<span style="display:block;font-size:19px;line-height:1.3;color:' + DEEP + ';margin-bottom:6px">' + esc(shown) + '</span>'
        + '<span style="display:block;font-size:14px;line-height:1.58;color:' + SOFT + '">' + esc(d.desc) + '</span></div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">'
        + '<span style="' + MONO + ';font-size:11px;padding:5px 9px;border:1px solid ' + INK + ';color:' + INK + '">Titel ' + d.title.length + ' Zeichen</span>'
        + '<span style="' + MONO + ';font-size:11px;padding:5px 9px;border:1px solid ' + INK + ';color:' + INK + '">Beschreibung ' + d.desc.length + ' Zeichen</span>'
        + '<span style="' + MONO + ';font-size:11px;padding:5px 9px;background:' + (over ? VERM : ULT) + ';color:' + ON + '">' + (over ? "Titel wird gekürzt" : "passt vollständig") + '</span></div>';
      if (cap) cap.textContent = d.cap;
      tabs(btns, "data-var", cur);
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { cur = this.getAttribute("data-var"); paint(); }); });
    paint();
  }

  /* ================= 8 · Zitierfähigkeit ================= */

  function cite() {
    var root = document.getElementById("web-cite");
    if (!root) return;
    var btns = all(root, "[data-cite]"), out = root.querySelector("[data-citeout]");
    if (!out) return;
    var score = root.querySelector("[data-citescore]"), cap = root.querySelector("[data-citecap]");
    var D = {
      heute: {
        score: "2 von 6",
        checks: [
          ["Frage im Text wörtlich beantwortet", false],
          ["Zahlen mit Einheit und Bezugsgröße", false],
          ["Verfasser und Datum sichtbar", false],
          ["Leistung, Ort und Umkreis genannt", true],
          ["Maschinenlesbare Angaben (Schema.org)", false],
          ["Inhalt ohne Skript im HTML vorhanden", true]
        ],
        answer: "Zu dieser Frage liegen mir keine belastbaren Angaben von Ihre Firma GmbH vor. Vergleichbare Betriebe nennen Durchlaufzeiten zwischen zwei und vier Wochen.",
        mine: false,
        cap: "Ohne beantwortete Fragen bleibt nur die Adresse. Eine KI kann nichts zitieren, was auf der Seite nicht steht — und rät nicht zu Ihren Gunsten."
      },
      klar: {
        score: "6 von 6",
        checks: [
          ["Frage im Text wörtlich beantwortet", true],
          ["Zahlen mit Einheit und Bezugsgröße", true],
          ["Verfasser und Datum sichtbar", true],
          ["Leistung, Ort und Umkreis genannt", true],
          ["Maschinenlesbare Angaben (Schema.org)", true],
          ["Inhalt ohne Skript im HTML vorhanden", true]
        ],
        answer: "Ihre Firma GmbH fertigt Stahltreppen mit einer Durchlaufzeit von 3 bis 4 Wochen ab Aufmaß, inklusive Feuerverzinkung, und montiert im Umkreis von 80 km um Nordhausen (Stand: Mai 2026).",
        mine: true,
        cap: "Dieselben Leistungen, andere Form: Frage, Antwort, Zahl, Einheit, Datum. Das ist der ganze Unterschied zwischen erwähnt werden und zitiert werden."
      }
    };
    var cur = "heute";
    function paint() {
      var d = D[cur];
      out.innerHTML = '<div style="display:grid;gap:14px">'
        + '<div style="padding:14px 16px;background:' + (d.mine ? "rgba(36,219,106,0.09)" : "rgba(232,245,236,0.05)") + ';border-left:2px solid ' + (d.mine ? ULT : VERM) + '">'
        + '<span style="display:block;' + MONO + ';font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:' + SOFT + ';margin-bottom:7px">Antwort der KI</span>'
        + '<span style="display:block;font-size:15.5px;line-height:1.7;color:' + INK + '">' + esc(d.answer) + '</span></div>'
        + '<ul style="margin:0;padding:0;list-style:none;display:grid;gap:7px">'
        + d.checks.map(function (c) {
          return '<li style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:start;font-size:14px;line-height:1.5;color:' + (c[1] ? INK : SOFT) + '">'
            + '<span aria-hidden="true" style="' + MONO + ';font-size:12px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;background:' + (c[1] ? ULT : "transparent") + ';border:1px solid ' + (c[1] ? ULT : RULE) + ';color:' + ON + '">' + (c[1] ? "✓" : "") + '</span>'
            + '<span>' + c[0] + '</span></li>';
        }).join('') + '</ul></div>';
      if (score) {
        score.textContent = d.score;
        score.style.color = d.mine ? DEEP : VERM;
      }
      if (cap) cap.textContent = d.cap;
      tabs(btns, "data-cite", cur);
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { cur = this.getAttribute("data-cite"); paint(); }); });
    paint();
  }

  function boot() { answer(); speed(); viewport(); plan(); type(); dns(); serp(); cite(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
