# IndexNow-Betrieb

Konfiguration: `indexnow.json` in diesem Ordner. Der Schlüssel ist ein öffentlicher Eigentumsnachweis; die zugehörige Datei `<key>.txt` liegt in der Website-Wurzel und enthält exakt den Schlüssel als UTF-8 ohne BOM oder Zeilenumbruch.

## Automatischer Ablauf

1. GitHub Pages veröffentlicht `main` über den Workflow **pages build and deployment**.
2. Das native `page_build`-Ereignis startet **IndexNow** nach erfolgreichem Pages-Build. Repository und Hauptbranch müssen übereinstimmen; Commit und abgeschlossene Veröffentlichung werden zusätzlich per API geprüft.
3. Das Skript prüft, dass Checkout und letzter erfolgreicher Pages-Build genau den erwarteten Commit verwenden. Weil das Build-Ereignis vor dem Ende des Deployments eintreffen kann, wartet es zusätzlich bis zu fünf Minuten auf den erfolgreichen Abschluss des zugehörigen Pages-Workflows. Es prüft außerdem den öffentlichen HTTPS-Schlüsselpfad ohne Weiterleitung auf HTTP 200 und bytegleichen Inhalt.
4. Gemeldet werden geänderte HTML-Seiten und hinzugefügte/entfernte Sitemap-URLs gegenüber dem zuletzt vollständig übermittelten Stand. Dieser wird als GitHub-Actions-Artefakt `indexnow-accepted-<commit>` mit 90 Tagen Aufbewahrung gespeichert. Fehlt ein gültiger Nachweis, werden alle aktuellen Sitemap-URLs nachgemeldet; frühere gelöschte URLs lassen sich ohne diesen Nachweis nicht rekonstruieren. Reine Konfigurationsänderungen ohne URL-Änderung erzeugen keine Meldung.

Die Übermittlung ist eine Änderungsbenachrichtigung. Auch HTTP 200 ist keine Zusage, dass eine Suchmaschine die Seiten indexiert.

## Manuelle Prüfung und Nachmeldung

In **Actions → IndexNow → Run workflow** den Branch `main` wählen:

- Für einen kontrollierten Test `url` auf eine einzelne aktuelle Sitemap-URL setzen und `submit_all` deaktivieren.
- Für eine vollständige Nachmeldung `url` leer lassen und `submit_all` aktivieren.

Nach einem fehlgeschlagenen IndexNow-Lauf kann man gezielt manuell nachmelden. Der nächste automatische Lauf berücksichtigt weiterhin die Änderungen seit dem letzten vollständig angenommenen Stand. Eine erfolgreiche Einzel-URL-Prüfung setzt diesen Stand nicht weiter. Vor einem manuellen Lauf muss der ausgewählte Commit vollständig veröffentlicht sein.

## Rückmeldungen

- **HTTP 200:** URLs vom Endpunkt angenommen.
- **HTTP 202:** angenommen, Schlüsselprüfung noch ausstehend. Das Skript wartet fünf Minuten und prüft Deployment und Schlüsseldatei vor einer Wiederholung erneut. Nach zwei weiterhin unbestätigten Wiederholungen endet es mit Exit-Code 2 und einer Warnung statt einer Erfolgsmeldung.
- **HTTP 403:** Verifikation abgelehnt. Keine automatischen Wiederholungen. Die tatsächliche externe Verifikationsursache lässt sich aus einer lokal erreichbaren Schlüsseldatei allein nicht ableiten.
- **Andere Fehler, einschließlich HTTP 429:** Lauf schlägt mit dem gemeldeten Status fehl. Ursache klären beziehungsweise die vom Dienst geforderte Wartezeit berücksichtigen und anschließend gezielt manuell nachmelden.

Ein anderer veröffentlichter Commit oder eine fehlerhafte Schlüsseldatei stoppt den Lauf vor der Übermittlung. GitHub-Zugangsdaten werden ausschließlich an die GitHub-API gesendet; der öffentliche IndexNow-Schlüssel wird ohne diese Zugangsdaten geprüft und übermittelt.

## Schlüsselwechsel

Bei anhaltendem Verifikationsfehler zuerst Pfad, Inhalt und vollständiges Deployment prüfen. Für einen kontrollierten Schlüsselwechsel in `indexnow.json` zunächst `automatic` auf `false` setzen; automatische Läufe pausieren dann vor dem Versand. Einen neuen Schlüssel in `indexnow.json` eintragen und die passende Datei mit exakt diesem Inhalt veröffentlichen. Erst nach erfolgreichem Pages-Build eine einzelne URL prüfen. HTTP 202 allein bestätigt noch keine abgeschlossene Verifikation. Nach bestätigtem HTTP 200 `automatic` wieder auf `true` setzen und veröffentlichen. Anschließend alle Sitemap-URLs einmal nachmelden, damit der neue Schlüssel und der vollständige Stand bestätigt sind. Bestehende öffentliche Schlüsseldateien müssen für den Wechsel nicht gelöscht werden.

## Lokale Prüfung

`python -m unittest discover -s .github/scripts/tests -v`

Die Tests verwenden ein echtes temporäres Git-Repository für die URL-Auswahl und simulieren externe HTTP-Antworten. Der Workflow benötigt nur Python-Standardbibliothek, `contents: read`, `pages: read` und `actions: read`; das bestätigte Commit-Artefakt wird über `actions/upload-artifact` gespeichert.

Quellen: [IndexNow-Protokoll](https://www.indexnow.org/documentation), [IndexNow-FAQ](https://www.indexnow.org/faq).
