# Luma – Minimalist WYSIWYG Markdown Editor

Luma ist eine moderne, minimalistische Web-App für das Schreiben von Notizen in Markdown, stark inspiriert von Editoren wie Typora. Das Kernkonzept ist "Live Formatting": Der Nutzer schreibt reines Markdown, das sofort während des Tippens visuell formatiert wird, ohne dass ein geteilter Bildschirm nötig ist. Luma kombiniert die Einfachheit von Text-Dateien mit dem Komfort einer Textverarbeitung.

## Features

### Haupt-Features
*   **Live WYSIWYG Editing:** Markdown wird sofort beim Tippen gerendert (Überschriften, Listen, Tabellen etc.).
*   **Visual/Source Toggle:** Ein nahtloser Wechsel zwischen der formatierten Ansicht und dem Markdown-Quelltext über einen dedizierten Modus-Button.
*   **Flyover-Toolbar:** Eine kontextuelle Formatierungsleiste, die bei Textmarkierung erscheint und gängige Formatierungen (Fett, Kursiv, Link, Listen etc.) per Klick erlaubt.
*   **Erweiterte Tabellen-Unterstützung:** Ein grafischer Dialog zum Einfügen von Tabellen mit wählbaren Zeilen/Spalten und Überschrift-Option.
*   **PDF- & Markdown-Export:** Dokumente können als formatierte PDF oder als Standard-Markdown-Datei exportiert werden.
*   **Syntax Highlighting:** Automatische Hervorhebung für Code-Blöcke in zahlreichen Programmiersprachen inklusive Sprach-Label in der Visual-Ansicht.

### Quality-of-Life Features
*   **Persistence:** Alle Notizen und Einstellungen (Theme, Schriftart, Sprache) werden automatisch im Local Storage gespeichert.
*   **Internationalisierung:** Komplette Unterstützung für Deutsch und Englisch, inklusive automatischer Erkennung des Browser-Standards.
*   **Anpassbare Typografie:** Auswahl zwischen verschiedenen Schrift-Stilen (Sans, Serif, Elegant, Mono) und Größen.
*   **Dark Mode:** Ein integriertes dunkles Theme für angenehmes Schreiben bei Nacht.
*   **Hilfe-Popover:** Ein integriertes Cheat-Sheet für die Markdown-Syntax und zentrale Einstellungen.
*   **Einstellbare Tabellen-Dichte:** Die Zeilenhöhe von Tabellen lässt sich in vier Stufen (S, M, L, XL) anpassen.
*   **Interaktive Checkboxen:** Task-Listen (`[ ]` / `[x]`) werden als echte, nutzbare Checkboxen gerendert.

## Technischer Aufbau

Luma basiert auf einem modernen Web-Stack:

*   **Framework:** [React 19](https://react.dev/) mit [TypeScript](https://www.typescriptlang.org/) für eine robuste, komponentenbasierte Architektur.
*   **Build-Tool:** [Vite](https://vitejs.dev/) für extrem schnelle Entwicklungszyklen.
*   **Editor-Engine:** [Milkdown](https://milkdown.dev/) – ein erweiterbarer Markdown-Editor auf Basis von Prosemirror.
    *   Genutzte Plugins: GFM, Commonmark, Prism (Highlighting), Tooltip, Slash-Menu, History, Listener.
*   **Icons:** [Lucide React](https://lucide.dev/) für ein konsistentes und klares UI-Design.
*   **Styling:** **Vanilla CSS** mit CSS-Variablen für Themes und reaktionsschnelles Design.
*   **PDF-Generierung:** [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) zur Umwandlung des gerenderten DOMs in PDF-Dokumente.

## LLM-Handoff & Projekt-Kontext

Für zukünftige Entwicklungen oder Erweiterungen durch ein LLM sind hier wichtige interne Details und bisherige Anforderungen dokumentiert:

*   **Milkdown v7 Integration:** Die App nutzt Milkdown v7. Befehle müssen über den `commandsCtx` innerhalb einer `editor.action` aufgerufen werden (z. B. `ctx.get(commandsCtx).call(command.key)`). 
*   **Tabellen-Handling:** Das offizielle `@milkdown/plugin-table` wurde aufgrund von Kompatibilitätsproblemen in der aktuellen Umgebung entfernt. Tabellen werden stattdessen als Markdown-Strings generiert und über den `replaceAll`-Macro-Befehl in den Editor injiziert. Die `updateContent`-Methode im `EditorRef` sorgt für die Synchronisation.
*   **Checkboxen (Task Lists):** Diese werden über GFM-Presets erkannt, benötigen aber die spezifischen CSS-Overrides in `Editor.tsx` (Targeting von `li.task-list-item input`), um korrekt und anklickbar gerendert zu werden.
*   **Flyover Toolbar:** Implementiert via `TooltipProvider`. Die `shouldShow`-Logik wurde manuell verschärft, um "Geister-Tooltips" auf leeren Zeilen zu verhindern (Prüfung auf `selection.empty`, `doc.textBetween` und `view.hasFocus`).
*   **UI-Stabilität:** Der "Visual/Source"-Button hat eine fixierte Breite von `100px`, um Layout-Sprünge beim Textwechsel zu vermeiden.
*   **Zentrales State-Management:** Der Inhalt (`markdown`) wird in `App.tsx` gehalten. Da Milkdown ein unkontrollierter Editor ist, erfolgt die Synchronisation via `listenerCtx` (Markdown-Update) und das manuelle `updateContent` (für externe Änderungen wie Tabellen-Injektion).
*   **Zweisprachigkeit:** Die Lokalisierung ist über ein `translations`-Objekt in `App.tsx` gelöst. Der Standardwert `'auto'` triggert die Erkennung der Browsersprache.

## Erstellt mit
*   **Tool:** Gemini CLI
*   **Agent/Model:** Gemini 2.0 Flash
*   **Datum:** März 2026
