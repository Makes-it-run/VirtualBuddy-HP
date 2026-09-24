# Änderungen

## v2026.09.24.2 — 24.09.2026

- IndexNow an den erfolgreichen Abschluss von „pages build and deployment“ gebunden. Vor jedem Versand werden der veröffentlichte Commit und der öffentliche Schlüsselinhalt geprüft.
- HTTP 202 als ausstehende Schlüsselverifikation behandelt, mit höchstens zwei erneuten Prüfungen im Abstand von fünf Minuten. Nur HTTP 200 bestätigt die Annahme; HTTP 403 beendet den Lauf ohne unveränderte Wiederholungen.
- Schlüsseldatei auf exakten UTF-8-Inhalt ohne Zeilenumbruch normalisiert. Schlüssel und Host werden zentral in `.github/indexnow.json` gepflegt.
- Manuelle Einzel-URL-Prüfung und Nachmeldung aller Sitemap-URLs ergänzt; automatische Meldungen berücksichtigen hinzugefügte, geänderte und entfernte Sitemap-Seiten gegenüber dem zuletzt vollständig übermittelten Stand. Ein gespeicherter Commit-Nachweis verhindert den Verlust ausstehender Meldungen nach fehlgeschlagenen Läufen.
- Regressionstests und Betriebsdokumentation ergänzt. Homepage-Inhalte und Sitemap gegenüber `v2026.09.24.1` unverändert.

## v2026.09.24.1 — 24.09.2026

- Neue Homepage-Lieferung mit dem aktuellen Stand von `main` (`6adb554d96c778536f4714a9231ffbb902aadb7f`) abgeglichen.
- 199 HTML-Seiten ergänzt: 175 Orts-/Branchenseiten in sieben Leistungsbereichen, 13 Seiten im Branchenbereich und 11 weitere Ortsübersichten.
- Nordhausen und Thüringen um Verweise auf die neuen Angebote und Orte erweitert.
- Sitemap von 51 auf 250 URLs erweitert; insgesamt 252 HTML-Seiten einschließlich Fehlerseite und Zertifikatsprüfung.
- Vorhandene Navigation, Google-Preferred-Sources-Integration, Assets und Deployment-Konfiguration unverändert übernommen.
- README-Version und Umfang aktualisiert.

Prüfung vor Veröffentlichung: alle 252 HTML-Seiten geladen, 22.138 interne Verweise und 250 Sitemap-Ziele geprüft; keine fehlenden Ziele, JavaScript-Syntax-/Laufzeitfehler oder gemessenen Layoutüberläufe. 2.268 mobile Navigationsprüfungen, 16 Touch-Menüprüfungen und Tab/Escape-Bedienung bestanden. Kontaktformular nur mit lokal simulierter Antwort geprüft; kein echter Versand. Externe Google-Ressource während der lokalen Tests blockiert. Die unveränderte Fehlerseite besitzt `noindex` und keinen Canonical-Link.

Wiederherstellungspunkt vor diesem Import: Git-Tag `before-homepage-2026-09-24` auf `6adb554d96c778536f4714a9231ffbb902aadb7f`. Release-Tag: `v2026.09.24.1`.
