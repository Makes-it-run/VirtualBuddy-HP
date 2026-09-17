/* VirtualBuddy.ai — Workshop-Hub: Art.-4-Check, Abschlussquiz, Prompt-Werkbank,
   Workflow/Agent-Vergleich, Opportunity Map, Zertifikatsprüfung.
   Läuft nur, wenn der jeweilige Container auf der Seite vorhanden ist. */
(function () {
  "use strict";

  var MONO = "'JetBrains Mono',ui-monospace,monospace";
  var INK = "#F4F0E6";
  var MUTED = "rgba(244,240,230,0.66)";
  var DIM = "rgba(244,240,230,0.48)";
  var AMBER = "#E3A33B";
  var STEEL = "#8FA3B8";
  var GREEN = "#67C98B";
  var HAIR = "rgba(227,163,59,0.22)";

  function el(tag, style, text) {
    var n = document.createElement(tag);
    if (style) n.setAttribute("style", style);
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function label(text, color) {
    return el("span", "font-family:" + MONO + ";font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:" + (color || DIM), text);
  }
  function perf(margin) {
    return el("div", "height:1px;margin:" + (margin || "0") + ";background-image:linear-gradient(90deg," + HAIR + " 0 4px,transparent 4px 9px);background-size:9px 1px");
  }
  function btn(text, on) {
    var b = el("button", "font-family:" + MONO + ";font-size:11.5px;letter-spacing:0.06em;text-transform:uppercase;padding:9px 15px;border:1px solid " + (on ? AMBER : HAIR) + ";border-radius:2px;background:" + (on ? "rgba(227,163,59,0.14)" : "transparent") + ";color:" + (on ? AMBER : MUTED) + ";cursor:pointer;transition:border-color .2s ease,color .2s ease,background .2s ease", text);
    b.type = "button";
    return b;
  }

  /* ================= A · Art.-4-Betroffenheit ================= */
  function pflicht() {
    var box = document.querySelector("[data-pflicht]");
    if (!box) return;
    var Q = [
      { q: "Nutzen Mitarbeitende KI-Werkzeuge im Arbeitsalltag?", h: "ChatGPT, Copilot, Gemini, Übersetzung, Bild- oder Textgeneratoren — auch gelegentlich." },
      { q: "Läuft KI in Software, die Sie einsetzen?", h: "Funktionen in CRM, ERP, Shop, Ticketsystem, Buchhaltung oder Telefonanlage." },
      { q: "Entscheidet oder empfiehlt ein System Dinge, die Menschen betreffen?", h: "Vorauswahl von Bewerbungen, Bonitäts- oder Risikoeinschätzungen, Priorisierung von Anfragen." }
    ];
    var state = [null, null, null];

    var head = el("div", "display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px 16px;margin-bottom:18px");
    head.appendChild(label("Selbstprüfung · Art. 4", AMBER));
    head.appendChild(label("3 Fragen · keine Datenübertragung"));
    box.appendChild(head);

    var list = el("div", "display:grid;gap:0");
    Q.forEach(function (item, i) {
      var row = el("div", "display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px 18px;align-items:start;padding:16px 0;border-top:1px solid " + HAIR);
      var txt = el("div", "min-width:0");
      txt.appendChild(el("p", "margin:0 0 5px;font-size:15.5px;line-height:1.45;font-weight:600;color:" + INK, item.q));
      txt.appendChild(el("p", "margin:0;font-size:13.5px;line-height:1.55;color:" + DIM + ";text-wrap:pretty", item.h));
      row.appendChild(txt);
      var group = el("div", "display:flex;gap:7px;flex:0 0 auto");
      var bj = btn("Ja", false), bn = btn("Nein", false);
      var paint = function () {
        [[bj, true], [bn, false]].forEach(function (p) {
          var on = state[i] === p[1];
          p[0].style.borderColor = on ? AMBER : HAIR;
          p[0].style.color = on ? AMBER : MUTED;
          p[0].style.background = on ? "rgba(227,163,59,0.14)" : "transparent";
        });
      };
      bj.addEventListener("click", function () { state[i] = true; paint(); verdict(); });
      bn.addEventListener("click", function () { state[i] = false; paint(); verdict(); });
      group.appendChild(bj); group.appendChild(bn);
      row.appendChild(group);
      list.appendChild(row);
    });
    box.appendChild(list);

    var out = el("div", "margin-top:20px;padding:18px;border:1px solid " + HAIR + ";border-left:2px solid " + AMBER + ";border-radius:2px;background:rgba(227,163,59,0.05)");
    var outHead = el("p", "margin:0 0 7px;font-size:15px;font-weight:700;letter-spacing:-0.01em;color:" + INK, "Beantworten Sie die drei Fragen.");
    var outBody = el("p", "margin:0;font-size:14px;line-height:1.6;color:" + MUTED + ";text-wrap:pretty", "Die Einschätzung entsteht direkt im Browser — wir sehen Ihre Antworten nicht.");
    out.appendChild(outHead); out.appendChild(outBody);
    box.appendChild(out);

    function verdict() {
      var answered = state.filter(function (s) { return s !== null; }).length;
      if (answered < 3) {
        outHead.textContent = "Noch " + (3 - answered) + " " + (answered === 2 ? "Frage" : "Fragen") + " offen.";
        outBody.textContent = "Die Einschätzung entsteht direkt im Browser — wir sehen Ihre Antworten nicht.";
        out.style.borderLeftColor = AMBER;
        return;
      }
      if (state[2] === true) {
        out.style.borderLeftColor = AMBER;
        outHead.textContent = "KI-Kompetenz plus Blick auf die Risikoklasse.";
        outBody.textContent = "Systeme, die über Menschen mitentscheiden, können in die Hochrisiko-Kategorie fallen — dort gelten nach der Änderung durch den Digital Omnibus Fristen ab Dezember 2027. Die Kompetenzpflicht gilt davon unabhängig schon heute. Beides gehört in eine gemeinsame Bestandsaufnahme.";
      } else if (state[0] === true || state[1] === true) {
        out.style.borderLeftColor = AMBER;
        outHead.textContent = "Ihr Haus ist Betreiber im Sinne der Verordnung.";
        outBody.textContent = "Damit greift Art. 4: Das mit KI befasste Personal braucht ein Kompetenzniveau, das zum Einsatz passt — und Sie brauchen etwas in der Hand, das zeigt, dass Sie dafür etwas getan haben. Genau dafür ist das Programm auf dieser Seite gemacht.";
      } else {
        out.style.borderLeftColor = STEEL;
        outHead.textContent = "Heute wahrscheinlich nicht betroffen — morgen sehr wahrscheinlich doch.";
        outBody.textContent = "KI-Funktionen wandern gerade ohne Zutun in Standardsoftware. Sinnvoll ist eine kurze Bestandsaufnahme, welche Werkzeuge im Haus tatsächlich genutzt werden, bevor die Frage jemand anders stellt.";
      }
    }
  }

  /* ================= B · Abschlussquiz ================= */
  function quiz() {
    var box = document.querySelector("[data-quiz]");
    if (!box) return;
    var Q = [
      {
        q: "Ein Sprachmodell nennt ein Gerichtsurteil samt Aktenzeichen. Was tun Sie?",
        a: ["Übernehmen — Aktenzeichen sind eindeutig.", "In einer Primärquelle prüfen, bevor es weitergeht.", "Das Modell fragen, ob es sich sicher ist.", "Kollegen fragen, ob sie das Urteil kennen."],
        ok: 1,
        why: "Aktenzeichen sind für ein Sprachmodell Text wie jeder andere — sie können plausibel erfunden sein. Die Rückfrage nach Sicherheit hilft nicht: das Modell schätzt seine eigene Verlässlichkeit nicht zuverlässig ein."
      },
      {
        q: "Welche Eingabe ist in einem öffentlichen KI-Dienst ohne Vertrag am heikelsten?",
        a: ["Ein anonymisierter Textentwurf", "Eine öffentliche Produktbeschreibung", "Eine vollständige Bewerbungsunterlage", "Eine Liste allgemeiner Fachbegriffe"],
        ok: 2,
        why: "Bewerbungsunterlagen enthalten personenbezogene Daten Dritter. Ohne Auftragsverarbeitungsvertrag und geklärten Verarbeitungsort ist das der Fall, der im Zweifel teuer wird — unabhängig davon, wie gut das Ergebnis ist."
      },
      {
        q: "Was verlangt Art. 4 der KI-Verordnung von Ihrem Unternehmen?",
        a: ["Eine zertifizierte KI-Beauftragte", "Ein zum Einsatz passendes Maß an KI-Kompetenz beim Personal", "Eine Meldung aller genutzten Systeme an die EU", "Eine technische Prüfung jedes Modells"],
        ok: 1,
        why: "Die Vorschrift richtet sich auf Kompetenz, nicht auf eine Rolle oder eine Registrierung: Maßnahmen, die zum tatsächlichen Einsatz, zur Vorbildung der Beteiligten und zum Kontext passen. Wie das erreicht wird, bleibt Ihnen überlassen — belegen sollten Sie es können."
      }
    ];
    var idx = 0, score = 0, locked = false;

    var head = el("div", "display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px 16px;margin-bottom:16px");
    var kick = label("Abschlussquiz · Auszug", AMBER);
    var count = label("Frage 1 von " + Q.length);
    head.appendChild(kick); head.appendChild(count);
    box.appendChild(head);

    var qEl = el("p", "margin:0 0 16px;font-size:clamp(17px,2vw,20px);line-height:1.35;font-weight:700;letter-spacing:-0.02em;color:" + INK + ";text-wrap:pretty");
    box.appendChild(qEl);
    var opts = el("div", "display:grid;gap:8px");
    box.appendChild(opts);
    var fb = el("div", "display:none;margin-top:16px;padding:15px 16px;border:1px solid " + HAIR + ";border-radius:2px;background:rgba(244,240,230,0.03)");
    var fbHead = el("p", "margin:0 0 6px;font-family:" + MONO + ";font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:" + GREEN);
    var fbBody = el("p", "margin:0;font-size:14px;line-height:1.6;color:" + MUTED + ";text-wrap:pretty");
    var next = el("button", "margin-top:14px;font-family:" + MONO + ";font-size:11.5px;letter-spacing:0.08em;text-transform:uppercase;padding:10px 16px;border:1px solid " + AMBER + ";border-radius:2px;background:rgba(227,163,59,0.12);color:" + AMBER + ";cursor:pointer");
    next.type = "button";
    fb.appendChild(fbHead); fb.appendChild(fbBody); fb.appendChild(next);
    box.appendChild(fb);

    function paint() {
      locked = false;
      var item = Q[idx];
      count.textContent = "Frage " + (idx + 1) + " von " + Q.length;
      qEl.textContent = item.q;
      opts.textContent = "";
      fb.style.display = "none";
      item.a.forEach(function (text, i) {
        var b = el("button", "display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:baseline;text-align:left;padding:13px 15px;border:1px solid " + HAIR + ";border-radius:2px;background:transparent;color:" + INK + ";font-size:14.5px;line-height:1.45;cursor:pointer;transition:border-color .2s ease,background .2s ease");
        b.type = "button";
        b.appendChild(el("span", "font-family:" + MONO + ";font-size:11px;color:" + DIM, String.fromCharCode(65 + i)));
        b.appendChild(el("span", "min-width:0", text));
        b.addEventListener("mouseenter", function () { if (!locked) b.style.borderColor = "rgba(227,163,59,0.5)"; });
        b.addEventListener("mouseleave", function () { if (!locked) b.style.borderColor = HAIR; });
        b.addEventListener("click", function () {
          if (locked) return;
          locked = true;
          var right = i === item.ok;
          if (right) score++;
          Array.prototype.forEach.call(opts.children, function (c, ci) {
            c.style.cursor = "default";
            if (ci === item.ok) { c.style.borderColor = GREEN; c.style.background = "rgba(103,201,139,0.08)"; }
            else if (ci === i) { c.style.borderColor = "rgba(226,122,90,0.7)"; c.style.background = "rgba(226,122,90,0.07)"; }
            else { c.style.opacity = "0.5"; }
          });
          fbHead.style.color = right ? GREEN : "#E27A5A";
          fbHead.textContent = right ? "Richtig" : "Nicht ganz";
          fbBody.textContent = item.why;
          next.textContent = idx + 1 < Q.length ? "Nächste Frage →" : "Ergebnis ansehen →";
          fb.style.display = "block";
        });
        opts.appendChild(b);
      });
    }
    next.addEventListener("click", function () {
      if (idx + 1 < Q.length) { idx++; paint(); return; }
      qEl.textContent = score === Q.length ? "Alle drei richtig." : score + " von " + Q.length + " richtig.";
      count.textContent = "Auszug beendet";
      opts.textContent = "";
      fb.style.display = "none";
      var done = el("div", "padding:16px;border:1px solid " + HAIR + ";border-left:2px solid " + AMBER + ";border-radius:2px;background:rgba(227,163,59,0.05)");
      done.appendChild(el("p", "margin:0 0 6px;font-size:14.5px;font-weight:700;color:" + INK, "Im Workshop sind es zwölf Fragen."));
      done.appendChild(el("p", "margin:0;font-size:14px;line-height:1.6;color:" + MUTED + ";text-wrap:pretty", "Bestanden ab neun richtigen Antworten. Das Ergebnis steht auf dem persönlichen Zertifikat als bestandene Lernkontrolle — und im Unternehmensnachweis als dokumentierte Maßnahme."));
      opts.appendChild(done);
    });
    paint();
  }

  /* ================= C · Prompt-Werkbank ================= */
  function prompt() {
    var box = document.querySelector("[data-prompt]");
    if (!box) return;
    var CASES = [
      {
        key: "E-Mail",
        weak: "Schreib eine Antwort auf diese Reklamation.",
        weakNote: "Freundlich, allgemein, ohne Haltung — und jedes Mal anders.",
        parts: [
          ["Rolle", "Du antwortest als Serviceleitung eines Metallbaubetriebs mit 40 Mitarbeitenden."],
          ["Kontext", "Kunde seit 2019. Reklamation betrifft eine Lieferung mit 3 Tagen Verzug. Kulanzrahmen bis 5 % des Auftragswerts."],
          ["Aufgabe", "Antwortentwurf: Sachverhalt bestätigen, Ursache benennen, eine konkrete Lösung anbieten."],
          ["Format", "Maximal 150 Wörter, Sie-Form, kein Konjunktivnebel, Betreffzeile separat."],
          ["Grenzen", "Keine Schuldzuweisung an Lieferanten, keine Zusage über den Kulanzrahmen hinaus."]
        ],
        gain: "Aus einem beliebigen Text wird ein Entwurf, der zur Freigabe taugt."
      },
      {
        key: "Dokumentenanalyse",
        weak: "Fass diesen Vertrag zusammen.",
        weakNote: "Ergibt eine Nacherzählung — genau das, was niemand braucht.",
        parts: [
          ["Rolle", "Du prüfst als kaufmännische Assistenz einen Rahmenvertrag vor der Unterschrift."],
          ["Kontext", "Wir sind Auftragnehmer. Laufzeit und Haftung sind die kritischen Punkte."],
          ["Aufgabe", "Extrahiere Laufzeit, Kündigungsfristen, Haftungsgrenzen, Zahlungsziele, Vertragsstrafen. Markiere, was fehlt."],
          ["Format", "Tabelle: Punkt / Wortlaut / Fundstelle / Bewertung in einem Satz."],
          ["Grenzen", "Nichts ergänzen, was nicht im Dokument steht. Unklares als „unklar“ kennzeichnen, nicht raten."]
        ],
        gain: "Das Modell liest, statt zu erzählen — mit Fundstelle zum Nachprüfen."
      },
      {
        key: "Präsentation",
        weak: "Mach eine Präsentation über unser neues Produkt.",
        weakNote: "Zwölf Folien Allgemeinplätze, die man komplett neu schreiben muss.",
        parts: [
          ["Rolle", "Du strukturierst für eine Vertriebsleitung, die vor Einkäufern spricht."],
          ["Kontext", "Publikum: technischer Einkauf, 20 Minuten, skeptisch gegenüber Umstellungskosten."],
          ["Aufgabe", "Gliederung mit 7 Folien. Pro Folie: Kernaussage, Beleg, zu erwartender Einwand."],
          ["Format", "Nur Stichpunkte, keine Fließtexte. Titel maximal 6 Wörter."],
          ["Grenzen", "Keine erfundenen Zahlen. Wo ein Beleg fehlt, „Beleg offen“ schreiben."]
        ],
        gain: "Eine Gliederung, die dem ersten Einwand standhält."
      }
    ];
    var active = 0;

    var tabs = el("div", "display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px");
    var body = el("div", "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:clamp(14px,2vw,22px);align-items:start");
    box.appendChild(tabs); box.appendChild(body);

    function paint() {
      var c = CASES[active];
      Array.prototype.forEach.call(tabs.children, function (b, i) {
        var on = i === active;
        b.style.borderColor = on ? AMBER : HAIR;
        b.style.color = on ? AMBER : MUTED;
        b.style.background = on ? "rgba(227,163,59,0.14)" : "transparent";
      });
      body.textContent = "";

      var left = el("div", "min-width:0;padding:clamp(16px,2vw,20px);border:1px solid rgba(244,240,230,0.1);border-radius:2px;background:rgba(244,240,230,0.02)");
      left.appendChild(label("Vorher · ein Satz"));
      left.appendChild(perf("12px 0 14px"));
      left.appendChild(el("p", "margin:0 0 12px;font-family:" + MONO + ";font-size:13.5px;line-height:1.6;color:rgba(244,240,230,0.55)", c.weak));
      left.appendChild(el("p", "margin:0;font-size:13.5px;line-height:1.55;color:" + DIM + ";text-wrap:pretty", c.weakNote));
      body.appendChild(left);

      var right = el("div", "min-width:0;padding:clamp(16px,2vw,20px);border:1px solid " + HAIR + ";border-top:2px solid " + AMBER + ";border-radius:2px;background:rgba(227,163,59,0.04)");
      right.appendChild(label("Nachher · fünf Bausteine", AMBER));
      right.appendChild(perf("12px 0 4px"));
      var grid = el("div", "display:grid;gap:0");
      c.parts.forEach(function (p) {
        var row = el("div", "display:grid;grid-template-columns:clamp(68px,9vw,88px) minmax(0,1fr);gap:12px;align-items:baseline;padding:11px 0;border-bottom:1px solid rgba(227,163,59,0.12)");
        row.appendChild(el("span", "font-family:" + MONO + ";font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:" + AMBER, p[0]));
        row.appendChild(el("span", "min-width:0;font-size:14px;line-height:1.55;color:" + INK, p[1]));
        grid.appendChild(row);
      });
      right.appendChild(grid);
      right.appendChild(el("p", "margin:14px 0 0;font-size:13.5px;line-height:1.55;color:" + MUTED + ";text-wrap:pretty", c.gain));
      body.appendChild(right);
    }
    CASES.forEach(function (c, i) {
      var b = btn(c.key, i === 0);
      b.addEventListener("click", function () { active = i; paint(); });
      tabs.appendChild(b);
    });
    paint();
  }

  /* ================= D · Workflow vs. Agent ================= */
  function flow() {
    var box = document.querySelector("[data-flow]");
    if (!box) return;
    var MODES = {
      workflow: {
        head: "Workflow · feste Kette",
        sub: "Jeder Schritt steht vorher fest. Gleiche Eingabe, gleicher Weg — nachvollziehbar bis zur Zeile.",
        nodes: [
          ["Trigger", "Webhook: neue Anfrage im Formular"],
          ["Schritt 1", "Felder prüfen, Format normalisieren"],
          ["Schritt 2", "LLM: Thema und Dringlichkeit einordnen"],
          ["Schritt 3", "Struktur erzwingen: JSON mit 4 Feldern"],
          ["Schritt 4", "CRM: Datensatz anlegen, Ticket verknüpfen"],
          ["Ende", "Bestätigung an Absender"]
        ],
        note: "Stärke: vorhersagbar, günstig, leicht zu prüfen. Grenze: jeder neue Sonderfall braucht einen neuen Zweig.",
        good: "Richtig für hohe Fallzahlen mit klaren Regeln."
      },
      agent: {
        head: "Agent · Entscheidung im Lauf",
        sub: "Das Modell wählt selbst, welches Werkzeug als Nächstes hilft — und wann es fertig ist.",
        nodes: [
          ["Auftrag", "„Kläre diese Anfrage und leg alles Nötige an.“"],
          ["Überlegen", "Welche Information fehlt noch?"],
          ["Werkzeug", "crm.suchen(absender) → Bestandskunde seit 2021"],
          ["Überlegen", "Vertrag prüfen, Reaktionszeit relevant"],
          ["Werkzeug", "wissen.suchen(\"SLA Wartung\") → 2 Treffer"],
          ["Grenze", "Nachlass über 5 % → an einen Menschen"]
        ],
        note: "Stärke: kommt mit Abweichung klar. Grenze: braucht harte Werkzeuggrenzen, Protokoll und eine Abbruchbedingung.",
        good: "Richtig für offene Fälle mit vielen Quellen."
      }
    };
    var mode = "workflow";

    var tabs = el("div", "display:flex;gap:7px;margin-bottom:18px");
    var body = el("div", "");
    box.appendChild(tabs); box.appendChild(body);

    function paint() {
      var m = MODES[mode];
      Array.prototype.forEach.call(tabs.children, function (b, i) {
        var on = (i === 0) === (mode === "workflow");
        b.style.borderColor = on ? AMBER : HAIR;
        b.style.color = on ? AMBER : MUTED;
        b.style.background = on ? "rgba(227,163,59,0.14)" : "transparent";
      });
      body.textContent = "";
      body.appendChild(el("p", "margin:0 0 4px;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:" + INK, m.head));
      body.appendChild(el("p", "margin:0 0 18px;font-size:14px;line-height:1.6;color:" + MUTED + ";max-width:64ch;text-wrap:pretty", m.sub));
      var chain = el("div", "display:grid;gap:0");
      m.nodes.forEach(function (n, i) {
        var wrap = el("div", "display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px;align-items:stretch");
        var rail = el("div", "position:relative;width:20px;display:flex;flex-direction:column;align-items:center");
        var dotColor = mode === "agent" && n[0] === "Werkzeug" ? STEEL : (n[0] === "Grenze" ? "#E27A5A" : AMBER);
        rail.appendChild(el("span", "width:7px;height:7px;margin-top:15px;background:" + dotColor + ";display:block;flex:0 0 auto"));
        if (i < m.nodes.length - 1) rail.appendChild(el("span", "flex:1 1 auto;width:1px;background:" + (mode === "agent" ? "rgba(143,163,168,0.4)" : HAIR) + ";display:block"));
        wrap.appendChild(rail);
        var card = el("div", "min-width:0;padding:12px 0 16px");
        card.appendChild(el("span", "display:block;font-family:" + MONO + ";font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:" + (n[0] === "Grenze" ? "#E27A5A" : DIM) + ";margin-bottom:4px", n[0]));
        card.appendChild(el("span", "display:block;font-size:14.5px;line-height:1.5;color:" + INK + ";overflow-wrap:anywhere", n[1]));
        wrap.appendChild(card);
        chain.appendChild(wrap);
      });
      body.appendChild(chain);
      if (mode === "agent") {
        var loop = el("div", "margin:2px 0 0 0;padding:10px 14px;border:1px dashed rgba(143,163,168,0.45);border-radius:2px;display:inline-block");
        loop.appendChild(el("span", "font-family:" + MONO + ";font-size:11px;letter-spacing:0.08em;color:" + STEEL, "↻ Schleife: überlegen → Werkzeug → prüfen, bis Ziel oder Grenze erreicht"));
        body.appendChild(loop);
      }
      var foot = el("div", "margin-top:20px;padding-top:16px;border-top:1px solid " + HAIR + ";display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:14px 24px");
      var f1 = el("div", "min-width:0"); f1.appendChild(label("Einordnung")); f1.appendChild(el("p", "margin:8px 0 0;font-size:13.5px;line-height:1.55;color:" + MUTED + ";text-wrap:pretty", m.note));
      var f2 = el("div", "min-width:0"); f2.appendChild(label("Wann", AMBER)); f2.appendChild(el("p", "margin:8px 0 0;font-size:13.5px;line-height:1.55;color:" + INK + ";text-wrap:pretty", m.good));
      foot.appendChild(f1); foot.appendChild(f2);
      body.appendChild(foot);
    }
    ["Workflow", "Agent"].forEach(function (t, i) {
      var b = btn(t, i === 0);
      b.addEventListener("click", function () { mode = i === 0 ? "workflow" : "agent"; paint(); });
      tabs.appendChild(b);
    });
    paint();
  }

  /* ================= E · Opportunity Map ================= */
  function oppmap() {
    var box = document.querySelector("[data-oppmap]");
    if (!box) return;
    var ROWS = [
      { c: "E-Mail-Sortierung", n: "hoch", a: "niedrig", s: "hoch", r: "Quick Win", x: 0.16, y: 0.62 },
      { c: "Angebotsprozess", n: "hoch", a: "mittel", s: "hoch", r: "Phase 1", x: 0.54, y: 0.72 },
      { c: "Dokumentenanalyse", n: "hoch", a: "niedrig", s: "mittel", r: "Quick Win", x: 0.22, y: 0.42 },
      { c: "AI Support Agent", n: "sehr hoch", a: "mittel", s: "hoch", r: "Phase 2", x: 0.62, y: 0.9 }
    ];
    var TONE = { "Quick Win": GREEN, "Phase 1": AMBER, "Phase 2": STEEL };
    var sel = -1;

    var head = el("div", "display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px 16px;margin-bottom:16px");
    head.appendChild(label("VirtualBuddy AI Opportunity Map · Beispiel", AMBER));
    head.appendChild(label("Ergebnis eines Workshoptages"));
    box.appendChild(head);

    var split = el("div", "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:clamp(18px,2.4vw,30px);align-items:start");
    box.appendChild(split);

    /* Tabelle */
    var tWrap = el("div", "min-width:0;overflow-x:auto");
    var table = el("table", "width:100%;border-collapse:collapse;font-size:13.5px");
    var thead = el("thead");
    var hr = el("tr");
    ["Use Case", "Nutzen", "Aufwand", "Einsparung", "Empfehlung"].forEach(function (h, i) {
      var th = el("th", "text-align:" + (i === 0 ? "left" : "right") + ";padding:0 10px 10px 0;font-family:" + MONO + ";font-size:10px;letter-spacing:0.12em;text-transform:uppercase;font-weight:400;color:" + DIM + ";border-bottom:1px solid " + HAIR + ";white-space:nowrap", h);
      hr.appendChild(th);
    });
    thead.appendChild(hr); table.appendChild(thead);
    var tbody = el("tbody");
    ROWS.forEach(function (r, i) {
      var tr = el("tr", "cursor:pointer;transition:background .2s ease");
      var cells = [r.c, r.n, r.a, r.s, r.r];
      cells.forEach(function (v, ci) {
        var td = el("td", "text-align:" + (ci === 0 ? "left" : "right") + ";padding:12px 10px 12px 0;border-bottom:1px solid rgba(244,240,230,0.07);color:" + (ci === 0 ? INK : MUTED) + ";white-space:nowrap" + (ci === 0 ? ";font-weight:600" : ""));
        if (ci === 4) {
          td.textContent = "";
          td.appendChild(el("span", "font-family:" + MONO + ";font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;padding:4px 8px;border:1px solid " + TONE[v] + ";color:" + TONE[v] + ";border-radius:2px;white-space:nowrap", v));
        } else td.textContent = v;
        tr.appendChild(td);
      });
      tr.addEventListener("click", function () { sel = sel === i ? -1 : i; paint(); });
      tr.addEventListener("mouseenter", function () { if (sel !== i) tr.style.background = "rgba(227,163,59,0.05)"; });
      tr.addEventListener("mouseleave", function () { if (sel !== i) tr.style.background = "transparent"; });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); tWrap.appendChild(table); split.appendChild(tWrap);

    /* Matrix */
    var mWrap = el("div", "min-width:0;max-width:580px");
    var plot = el("div", "position:relative;aspect-ratio:5/4;border-left:1px solid " + HAIR + ";border-bottom:1px solid " + HAIR + ";background-image:linear-gradient(rgba(244,240,230,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(244,240,230,0.05) 1px,transparent 1px);background-size:25% 25%");
    ROWS.forEach(function (r, i) {
      var flip = r.x > 0.5;
      var dot = el("div", "position:absolute;left:" + (r.x * 100) + "%;bottom:" + (r.y * 100) + "%;transform:translate(" + (flip ? "-100%" : "0") + ",50%);display:flex;align-items:center;gap:7px;cursor:pointer;margin-left:" + (flip ? "6px" : "-5px"));
      var mark = el("span", "width:11px;height:11px;border-radius:50%;background:" + TONE[r.r] + ";box-shadow:0 0 0 4px rgba(227,163,59,0.08);display:block;flex:0 0 auto;transition:box-shadow .2s ease,transform .2s ease");
      var cap = el("span", "font-family:" + MONO + ";font-size:10.5px;letter-spacing:0.02em;color:" + MUTED + ";white-space:nowrap;transition:color .2s ease", r.c);
      if (flip) { dot.appendChild(cap); dot.appendChild(mark); } else { dot.appendChild(mark); dot.appendChild(cap); }
      dot.addEventListener("click", function () { sel = sel === i ? -1 : i; paint(); });
      dot.setAttribute("data-dot", String(i));
      plot.appendChild(dot);
    });
    mWrap.appendChild(label("Nutzen ↑ / Aufwand →"));
    mWrap.appendChild(el("div", "height:10px"));
    mWrap.appendChild(plot);
    var axis = el("div", "display:flex;justify-content:space-between;margin-top:8px");
    axis.appendChild(label("niedriger Aufwand"));
    axis.appendChild(label("hoher Aufwand"));
    mWrap.appendChild(axis);
    split.appendChild(mWrap);

    /* Roadmap */
    var road = el("div", "margin-top:clamp(20px,2.6vw,28px);padding-top:18px;border-top:1px solid " + HAIR);
    road.appendChild(label("Daraus abgeleitet · kleine Roadmap", AMBER));
    var bands = el("div", "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:10px;margin-top:14px");
    [["Quick Win", "sofort", "E-Mail-Sortierung, Dokumentenanalyse"], ["Phase 1", "nächstes Quartal", "Angebotsprozess"], ["Phase 2", "danach", "AI Support Agent"]].forEach(function (b) {
      var c = el("div", "padding:14px 15px;border:1px solid " + HAIR + ";border-top:2px solid " + TONE[b[0]] + ";border-radius:2px;background:rgba(244,240,230,0.02)");
      c.appendChild(el("span", "display:block;font-family:" + MONO + ";font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;color:" + TONE[b[0]] + ";margin-bottom:6px", b[0] + " · " + b[1]));
      c.appendChild(el("span", "display:block;font-size:14px;line-height:1.5;color:" + INK, b[2]));
      bands.appendChild(c);
    });
    road.appendChild(bands);
    box.appendChild(road);

    function paint() {
      Array.prototype.forEach.call(tbody.children, function (tr, i) {
        tr.style.background = i === sel ? "rgba(227,163,59,0.09)" : "transparent";
      });
      Array.prototype.forEach.call(plot.querySelectorAll("[data-dot]"), function (d) {
        var i = parseInt(d.getAttribute("data-dot"), 10);
        var on = i === sel;
        var m = d.querySelector("span[style*='border-radius:50%']") || d.children[0];
        var c = d.querySelector("span[style*='white-space:nowrap']") || d.children[1];
        m.style.transform = on ? "scale(1.45)" : "scale(1)";
        m.style.boxShadow = on ? "0 0 0 7px rgba(227,163,59,0.16)" : "0 0 0 4px rgba(227,163,59,0.08)";
        c.style.color = on ? INK : MUTED;
      });
    }
    paint();
  }

  /* ================= F · Zertifikatsprüfung ================= */
  function verify() {
    var box = document.querySelector("[data-verify]");
    if (!box) return;
    var DB = {
      "VB-AIL-2026-000127": { course: "AI Literacy & Responsible AI", de: "KI-Kompetenz für Unternehmen", date: "17.09.2026", ue: "8 UE", holder: "M. Schneider", org: "auf Wunsch der Teilnehmerin angezeigt", instr: "Benjamin Koch", assess: "Passed" },
      "VB-GAP-2026-000214": { course: "Generative AI & Prompting", de: "Generative AI & Prompting", date: "02.09.2026", ue: "9 UE", holder: "nicht öffentlich", org: "Anzeige ohne Einwilligung unterbleibt", instr: "Benjamin Koch", assess: "Passed" }
    };
    var input = box.querySelector("input");
    var form = box.querySelector("form");
    var out = box.querySelector("[data-verify-out]");
    if (!input || !out) return;

    function row(k, v, color) {
      var r = el("div", "display:grid;grid-template-columns:clamp(96px,16vw,150px) minmax(0,1fr);gap:10px 16px;align-items:baseline;padding:11px 0;border-bottom:1px solid rgba(244,240,230,0.08)");
      r.appendChild(el("span", "font-family:" + MONO + ";font-size:10px;letter-spacing:0.13em;text-transform:uppercase;color:" + DIM, k));
      r.appendChild(el("span", "min-width:0;font-size:14.5px;line-height:1.5;color:" + (color || INK) + ";overflow-wrap:anywhere", v));
      return r;
    }
    function show(id) {
      var rec = DB[id.toUpperCase().trim()];
      out.textContent = "";
      out.style.display = "block";
      if (!rec) {
        out.style.borderTopColor = "#E27A5A";
        var h = el("div", "display:flex;align-items:center;gap:10px;margin-bottom:10px");
        h.appendChild(el("span", "font-size:19px;font-weight:700;letter-spacing:-0.02em;color:#E27A5A", "Kein Eintrag gefunden"));
        out.appendChild(h);
        out.appendChild(el("p", "margin:0;font-size:14px;line-height:1.6;color:" + MUTED + ";text-wrap:pretty", "Zu der Kennung „" + id.trim() + "“ liegt kein Nachweis vor. Prüfen Sie die Schreibweise — die Kennung steht unten links auf dem Zertifikat und im QR-Code."));
        return;
      }
      out.style.borderTopColor = GREEN;
      var head = el("div", "display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 12px;margin-bottom:16px");
      head.appendChild(el("span", "font-size:clamp(20px,2.6vw,26px);font-weight:700;letter-spacing:-0.025em;color:" + GREEN, "Certificate valid ✓"));
      head.appendChild(el("span", "font-family:" + MONO + ";font-size:11px;letter-spacing:0.08em;color:" + DIM, "geprüft " + new Date().toLocaleDateString("de-DE")));
      out.appendChild(head);
      out.appendChild(row("Certificate ID", id.toUpperCase().trim()));
      out.appendChild(row("Course", rec.de && rec.de !== rec.course ? rec.course + " · " + rec.de : rec.course));
      out.appendChild(row("Date", rec.date));
      out.appendChild(row("Duration", rec.ue + " (Unterrichtseinheiten à 45 Minuten)"));
      out.appendChild(row("Assessment", rec.assess, GREEN));
      out.appendChild(row("Holder", rec.holder, rec.holder === "nicht öffentlich" ? STEEL : INK));
      out.appendChild(row("Instructor", rec.instr));
      out.appendChild(row("Issued by", "VirtualBuddy — Markenauftritt der Großhandelsgesellschaft Nordhausen GbR"));
      out.appendChild(el("p", "margin:14px 0 0;font-size:13px;line-height:1.6;color:" + DIM + ";text-wrap:pretty", "Namensanzeige: " + rec.org + ". Ohne Einwilligung bestätigt die Prüfung nur Kurs, Datum, Umfang und Bestehen — nicht, wer teilgenommen hat."));
    }
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); show(input.value || ""); });
    Array.prototype.forEach.call(box.querySelectorAll("[data-verify-demo]"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        input.value = a.getAttribute("data-verify-demo");
        show(input.value);
      });
    });
    var q = (location.search.match(/[?&]id=([^&]+)/) || [])[1];
    var seg = (location.pathname.match(/certificate\/(VB-[A-Z]{3}-\d{4}-\d{6})/i) || [])[1];
    if (q || seg) { input.value = decodeURIComponent(q || seg); show(input.value); }
  }

  function boot() { pflicht(); quiz(); prompt(); flow(); oppmap(); verify(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
