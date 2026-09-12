# virtualbuddy.ai

Statische One-Page-Website. Keine Build-Tools, keine Abhängigkeiten.

## Inhalt
- `index.html` — Startseite
- `impressum.html`, `datenschutz.html` — Rechtsseiten
- `app.js` — Hero-Canvas, Scroll-Effekte, Kontaktformular
- `fonts/` — Manrope + JetBrains Mono (lokal, kein Google-CDN)
- `CNAME` — Custom Domain virtualbuddy.ai
- `.nojekyll` — verhindert Jekyll-Verarbeitung auf GitHub Pages

## Deployment (GitHub Pages)
1. Inhalt dieses Ordners in das Repository `Makes-it-run/VirtualBuddy-HP` legen (Branch `main`, Repo-Wurzel).
2. Settings → Pages → Source: `Deploy from a branch` → Branch `main`, Ordner `/ (root)`.
3. Settings → Pages → Custom domain: `virtualbuddy.ai`, danach `Enforce HTTPS` aktivieren.
4. DNS beim Domain-Anbieter:
   - A-Records für `virtualbuddy.ai` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME für `www` → `makes-it-run.github.io`

## Kontaktformular
Versand über Web3Forms (`action` im Formular). Der Access Key liegt bewusst im HTML — das ist bei Web3Forms vorgesehen. Empfängeradresse muss im Web3Forms-Konto bestätigt sein. Ohne JavaScript wird das Formular klassisch abgeschickt.
