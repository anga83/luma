import React, { useState, useEffect, useRef } from 'react';
import { MarkdownEditor } from './Editor';
import type { EditorRef } from './Editor';
import { 
  FileUp, FileDown, 
  Moon, Sun, Eye, Code, Layers, HelpCircle, Table as TableIcon, Globe
} from 'lucide-react';

const FONT_FAMILIES = [
  { label: 'System Sans', value: 'var(--font-sans)' },
  { label: 'Serif (Baskerville)', value: 'var(--font-serif)' },
  { label: 'Elegant (Playfair)', value: 'var(--font-playfair)' },
  { label: 'Monospace', value: 'var(--font-mono)' },
];

const FONT_SIZES = ['14px', '16px', '18px', '20px', '22px'];

type Language = 'de' | 'en';

const translations = {
  de: {
    welcome: '# Willkommen bei Luma\n\nSchreibe deine Notizen in Markdown. Die Formatierung passiert **live**!\n\n- [x] Moderne Tabellen-Unterstützung\n- [ ] Markiere Text für die Flyover-Leiste\n\n| Feature | Status | Beschreibung |\n| :--- | :--- | :--- |\n| WYSIWYG | ✅ | Live-Vorschau |\n| Dark Mode | ✅ | Augenschonend |\n| Export | ✅ | Markdown Datei |\n\n```javascript\nconsole.log("Syntax Highlighting inklusive!");\n```',
    import: 'Importieren',
    export: 'Exportieren',
    help: 'Hilfe',
    table: 'Tabelle',
    language: 'Sprache',
    theme: 'Theme',
    flyover: 'Flyover-Leiste',
    rows: 'Zeilen',
    cols: 'Spalten',
    headerRow: 'Erste Zeile als Überschrift',
    insert: 'Einfügen',
    cancel: 'Abbrechen',
    syntaxHelp: 'Luma Syntax Hilfe',
    textStyling: 'Text-Formatierung',
    headers: 'Überschriften',
    lists: 'Listen',
    blocks: 'Blöcke',
    bold: 'Fett',
    italic: 'Kursiv',
    strike: 'Durchgestrichen',
    code: 'Code',
    quote: 'Zitat',
    hr: 'Trennlinie',
    checkbox: 'Checkbox'
  },
  en: {
    welcome: '# Welcome to Luma\n\nWrite your notes in Markdown. Formatting happens **live**!\n\n- [x] Modern table support\n- [ ] Highlight text for the flyover toolbar\n\n| Feature | Status | Description |\n| :--- | :--- | :--- |\n| WYSIWYG | ✅ | Live preview |\n| Dark Mode | ✅ | Easy on the eyes |\n| Export | ✅ | Markdown file |\n\n```javascript\nconsole.log("Syntax highlighting included!");\n```',
    import: 'Import',
    export: 'Export',
    help: 'Help',
    table: 'Table',
    language: 'Language',
    theme: 'Theme',
    flyover: 'Flyover Toolbar',
    rows: 'Rows',
    cols: 'Columns',
    headerRow: 'First row as header',
    insert: 'Insert',
    cancel: 'Cancel',
    syntaxHelp: 'Luma Syntax Help',
    textStyling: 'Text Styling',
    headers: 'Headers',
    lists: 'Lists',
    blocks: 'Blocks',
    bold: 'Bold',
    italic: 'Italic',
    strike: 'Strike',
    code: 'Code',
    quote: 'Quote',
    hr: 'Divider',
    checkbox: 'Checkbox'
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('luma_lang') as Language;
    if (saved) return saved;
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'de' ? 'de' : 'en';
  });

  const t = translations[lang];

  const [markdown, setMarkdown] = useState(() => {
    const saved = localStorage.getItem('luma_note');
    return saved || t.welcome;
  });
  
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('luma_dark_mode');
    return saved === 'true';
  });
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('luma_font_family') || FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('luma_font_size') || '18px');
  const [showFlyover, setShowFlyover] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHeader, setTableHeader] = useState(true);

  const editorRef = useRef<EditorRef>(null);

  useEffect(() => {
    localStorage.setItem('luma_note', markdown);
  }, [markdown]);

  useEffect(() => {
    localStorage.setItem('luma_dark_mode', isDarkMode.toString());
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('luma_font_family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('luma_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('luma_lang', lang);
  }, [lang]);

  const toggleSourceMode = () => {
    setIsSourceMode(!isSourceMode);
  };

  const handleInsertTable = () => {
    if (tableRows > 0 && tableCols > 0) {
      let tableMd = '\n| ' + Array(tableCols).fill('Header').join(' | ') + ' |\n';
      tableMd += '| ' + Array(tableCols).fill('---').join(' | ') + ' |\n';
      for (let i = 0; i < tableRows; i++) {
        tableMd += '| ' + Array(tableCols).fill('Cell').join(' | ') + ' |\n';
      }
      
      const newMarkdown = markdown + '\n' + tableMd;
      setMarkdown(newMarkdown);
      if (!isSourceMode && editorRef.current) {
        editorRef.current.updateContent(newMarkdown);
      }
      setShowTableDialog(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luma_note_${lang}.md`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setMarkdown(text);
        if (!isSourceMode && editorRef.current) {
          editorRef.current.updateContent(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <div className="menu-bar">
        <div className="flex-grow flex items-center gap-2">
          <button 
            className={`menu-item mode-toggle ${isSourceMode ? 'active' : ''}`} 
            onClick={toggleSourceMode} 
            title={isSourceMode ? "Visual" : "Source"}
          >
            {isSourceMode ? <Eye size={18} /> : <Code size={18} />}
            <span>{isSourceMode ? "Source" : "Visual"}</span>
          </button>
          
          <div className="divider-v" />
          
          <select className="menu-select" value={lang} onChange={(e) => setLang(e.target.value as Language)}>
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>

          <select className="menu-select" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
            {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          <select className="menu-select" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="divider-v" />

          <button className="menu-item" onClick={() => setIsDarkMode(!isDarkMode)} title={t.theme}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className={`menu-item ${showFlyover ? 'active' : ''}`} onClick={() => setShowFlyover(!showFlyover)} title={t.flyover}>
            <Layers size={18} />
          </button>

          <button className="menu-item" onClick={() => setShowTableDialog(true)} title={t.table}>
            <TableIcon size={18} />
            <span>{t.table}</span>
          </button>

          <button className="menu-item" onClick={() => setShowHelp(true)} title={t.help}>
            <HelpCircle size={18} />
            <span>{t.help}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <label className="menu-item">
            <FileUp size={18} />
            <span>{t.import}</span>
            <input type="file" hidden onChange={handleImport} accept=".md" />
          </label>
          <button className="menu-item" onClick={handleExport}>
            <FileDown size={18} />
            <span>{t.export}</span>
          </button>
        </div>
      </div>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        {isSourceMode ? (
          <textarea 
            className="source-view"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
          />
        ) : (
          <MarkdownEditor 
            ref={editorRef}
            initialValue={markdown}
            onChange={setMarkdown}
            fontFamily={fontFamily}
            fontSize={fontSize}
            showFlyover={showFlyover}
          />
        )}
      </main>

      {showTableDialog && (
        <div className="dialog-overlay" onClick={() => setShowTableDialog(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <h3>{t.table} {t.insert}</h3>
            <div className="dialog-grid">
              <label>{t.rows}:</label>
              <input type="number" value={tableRows} onChange={e => setTableRows(parseInt(e.target.value))} min="1" max="20" />
              <label>{t.cols}:</label>
              <input type="number" value={tableCols} onChange={e => setTableCols(parseInt(e.target.value))} min="1" max="10" />
            </div>
            <div className="dialog-checkbox">
              <input type="checkbox" checked={tableHeader} onChange={e => setTableHeader(e.target.checked)} id="header-check" />
              <label htmlFor="header-check">{t.headerRow}</label>
            </div>
            <div className="dialog-actions">
              <button className="menu-item" onClick={() => setShowTableDialog(false)}>{t.cancel}</button>
              <button className="menu-item active" onClick={handleInsertTable}>{t.insert}</button>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-content" onClick={e => e.stopPropagation()}>
            <button className="help-close" onClick={() => setShowHelp(false)}>✕</button>
            <h2>{t.syntaxHelp}</h2>
            <div className="help-grid">
              <div className="help-item">
                <h3>{t.textStyling}</h3>
                <p><code>**{t.bold}**</code> → <strong>{t.bold}</strong></p>
                <p><code>*{t.italic}*</code> → <em>{t.italic}</em></p>
                <p><code>~~{t.strike}~~</code> → <del>{t.strike}</del></p>
                <p><code>`{t.code}`</code></p>
              </div>
              <div className="help-item">
                <h3>{t.headers}</h3>
                <p><code># H1 Header</code></p>
                <p><code>## H2 Header</code></p>
                <p><code>### H3 Header</code></p>
              </div>
              <div className="help-item">
                <h3>{t.lists}</h3>
                <p><code>- {t.bold}</code></p>
                <p><code>1. {t.bold}</code></p>
                <p><code>- [x] {t.checkbox}</code></p>
              </div>
              <div className="help-item">
                <h3>{t.blocks}</h3>
                <p><code>&gt; {t.quote}</code></p>
                <p><code>\`\`\`js \n {t.code} \n \`\`\`</code></p>
                <p><code>---</code> ({t.hr})</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .flex { display: flex; }
        .flex-grow { flex-grow: 1; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .divider-v { width: 1px; height: 24px; background: var(--border); margin: 0 4px; }
        
        .source-view { font-size: ${fontSize}; }

        /* Dialog Styles */
        .dialog-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
          z-index: 1000; backdrop-filter: blur(2px);
        }
        .dialog-content {
          background: var(--bg); padding: 25px; border-radius: 12px;
          width: 300px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .dialog-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; align-items: center; }
        .dialog-grid input { padding: 6px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg); color: var(--text); }
        .dialog-checkbox { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 14px; }
        .dialog-actions { display: flex; justify-content: flex-end; gap: 10px; }
      `}</style>
    </>
  );
}
