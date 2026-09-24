# virtualbuddy.ai

Version: `v2026.09.24.2` (24.09.2026).

Statische Website, 252 HTML-Seiten. Keine Build-Tools, keine Abhängigkeiten, kein CDN.

## Inhalt
- `index.html` — Startseite
- `workshops/` — Workshops & Zertifizierung, einschließlich lokaler und branchenspezifischer Angebote
- `ki/`, `automatisierung/`, `it/`, `ecommerce/`, `marketing/`, `web/` — Content-Hubs mit Fach-, Orts- und Branchenseiten
- `branchen/` — Branchenübersicht und 12 Branchenseiten
- Ortsübersichten — Nordhausen, Thüringen und 11 weitere Städte/Gemeinden
- `wissen/` — Fachbeiträge (Übersicht + 6 Artikel)
- `ueber-uns/`, `referenzen/`, `nordhausen/`, `thueringen/`, `kontakt/` — Unternehmen
- `certificate/` — Zertifikatsprüfung über Certificate ID (Ziel der QR-Codes, `noindex`)
- `impressum.html`, `datenschutz.html` — Rechtsseiten
- `404.html` — Fehlerseite (absolute Pfade, funktioniert unter jeder URL)
- `app.js` — Hero-Canvas, Hover-/Focus-Styles, Navigation, Scroll-Effekte, Kontaktformular
- `assets/hub-*.js` — Eyecatcher je Hub (ereignisgesteuert, kein Autoplay)
- `fonts/` — Manrope + JetBrains Mono (lokal, kein Google-CDN)
- `sitemap.xml` — 250 URLs · `robots.txt` — Allow all + Sitemap-Verweis
- `CNAME` — Custom Domain virtualbuddy.ai
- `.nojekyll` — verhindert Jekyll-Verarbeitung auf GitHub Pages

## Hell / Dunkel
Jede Seite trägt zwei Paletten im `<style>`-Block: `:root{…}` (dunkel, Standard) und
`:root[data-theme="light"]{…}` (hell). Alle Farben im Markup verweisen auf diese Variablen,
z. B. `color:rgba(var(--k1),calc(0.72*var(--im)))`. Die Namen bedeuten:

- `--k*` Schriftfarben, `--b*` Flächen, `--c*` Akzente, `--h**` Farben der Hub-Skripte
- `--w` Weiß-Schleier (hell: dunkler Schleier), `--sh` Schattenfarbe
- `--im` Faktor für Textdeckkraft, `--at` für Akzenttext, `--am` für Akzentflächen, `--shm` für Schatten
- Aliase: `--ink`, `--ac`, `--ac2`, `--bg`, `--nav` — davon lebt `app.js` (Kopfzeile, Hero-Canvas, Live-Log)

Der Umschalter sitzt in der Kopfzeile (`[data-theme-toggle]`), die Wahl liegt in
`localStorage["vb-theme"]`. Ohne gespeicherte Wahl startet jede Seite dunkel; ein kleines
Skript im `<head>` setzt das Attribut vor dem ersten Bildaufbau, deshalb blitzt nichts auf.
Neue Farbwerte bitte immer als Variable anlegen, nicht als festen Hex-Wert — sonst bleibt die
Stelle im hellen Design dunkel. Umrechnung und Nachziehen der hellen Palette: `tools/theme.js`.

## Deployment (GitHub Pages)
1. Inhalt dieses Ordners in das Repository `Makes-it-run/VirtualBuddy-HP` legen (Branch `main`, Repo-Wurzel). Wichtig: der **Inhalt** von `site/`, nicht der Ordner selbst.
2. Settings → Pages → Source: `Deploy from a branch` → Branch `main`, Ordner `/ (root)`.
3. Settings → Pages → Custom domain: `virtualbuddy.ai` eintragen, danach `Enforce HTTPS` aktivieren (erst möglich, wenn das Zertifikat ausgestellt ist — kann einige Minuten dauern).
4. DNS beim Domain-Anbieter:
   - A-Records für `virtualbuddy.ai` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - AAAA-Records (optional, IPv6) → 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
   - CNAME für `www` → `makes-it-run.github.io`
5. Nach dem Livegang: `https://virtualbuddy.ai/sitemap.xml` in der Google Search Console einreichen.

IndexNow startet nach erfolgreichem Pages-Deployment und prüft Commit und öffentliche Schlüsseldatei vor der Übermittlung. Einrichtung, Statusmeldungen und manuelle Nachmeldungen: [IndexNow-Betrieb](.github/INDEXNOW.md). Bei einem neuen Homepage-Import die aktuelle `.github/`-Konfiguration und zugehörige Schlüsseldatei aus diesem Repository erhalten.

## Prüfliste vor dem Push
- Alle internen Links und Assets aufgelöst (0 Fehler)
- Jede Seite mit `<link rel="canonical">`, Titel und Description
- Absolute Pfade nur in `404.html` und `site.webmanifest`, sonst relativ — die Seite läuft damit auch in einem Unterordner
- Externe Requests nur für Web3Forms beim Absenden des Kontaktformulars und für den offiziellen Google-Preferred-Sources-Button

## Kontaktformular
Versand über Web3Forms (`action` im Formular). Der Access Key liegt bewusst im HTML — das ist bei Web3Forms vorgesehen. Die Empfängeradresse muss im Web3Forms-Konto bestätigt sein. Ohne JavaScript wird das Formular klassisch abgeschickt.

## Zertifikate
`certificate/` prüft IDs gegen die Liste in `assets/hub-workshops.js`. Neue Zertifikate dort ergänzen. Namen werden nur bei vorliegender Einwilligung angezeigt, sonst bestätigt die Prüfung ausschließlich Kurs, Datum und Gültigkeit.
