import React, { useState, useEffect, useRef } from 'react';
import { MarkdownEditor } from './Editor';
import type { EditorRef } from './Editor';
import { 
  FileUp, FileDown, 
  Moon, Sun, Eye, Code, Layers, HelpCircle, Table as TableIcon, Globe, Settings, FileText
} from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const FONT_FAMILIES = [
  { label: 'System Sans', value: 'var(--font-sans)' },
  { label: 'Serif (Baskerville)', value: 'var(--font-serif)' },
  { label: 'Elegant (Playfair)', value: 'var(--font-playfair)' },
  { label: 'Monospace', value: 'var(--font-mono)' },
];

const FONT_SIZES = ['14px', '16px', '18px', '20px', '22px'];
const ROW_HEIGHTS = [
  { label: 'S', value: '2px' },
  { label: 'M', value: '6px' },
  { label: 'L', value: '12px' },
  { label: 'XL', value: '20px' },
];

type Language = 'de' | 'en';
type LanguageSetting = 'auto' | 'de' | 'en';

const translations = {
  de: {
    welcome: '# Willkommen bei Luma\n\nSchreibe deine Notizen in Markdown. Die Formatierung passiert **live**!\n\n- [x] Elegante Tabellen\n- [ ] Markiere diesen Text, um die Formatierungs-Leiste zu sehen\n\n| Feature | Beschreibung |\n| :--- | :--- |\n| WYSIWYG | Echte Live-Vorschau beim Tippen |\n| Export | Markdown & PDF Unterstützung |\n| Checkboxen | Aufgabenlisten einfach verwalten |\n\n```javascript\nconsole.log("Syntax Highlighting inklusive!");\n```',
    import: 'Importieren',
    export: 'Exportieren',
    help: 'Hilfe & Einstellungen',
    table: 'Tabelle',
    language: 'Sprache',
    theme: 'Theme',
    flyover: 'Formatierungs-Leiste bei Markierung',
    rows: 'Zeilen',
    cols: 'Spalten',
    headerRow: 'Überschrift-Zeile',
    insert: 'Einfügen',
    cancel: 'Abbrechen',
    syntaxHelp: 'Luma Syntax & Hilfe',
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
    checkbox: 'Checkbox',
    langAuto: 'Browser-Standard',
    langDe: 'Deutsch',
    langEn: 'English',
    rowHeight: 'Tabellen-Zeilenhöhe',
    exportMd: 'Als Markdown (.md)',
    exportPdf: 'Als PDF (.pdf)'
  },
  en: {
    welcome: '# Welcome to Luma\n\nWrite your notes in Markdown. Formatting happens **live**!\n\n- [x] Elegant tables\n- [ ] Highlight this text to see the formatting toolbar\n\n| Feature | Description |\n| :--- | :--- |\n| WYSIWYG | Real-time preview as you type |\n| Export | Markdown & PDF support |\n| Checkboxen | Easy task management |\n\n```javascript\nconsole.log("Syntax highlighting included!");\n```',
    import: 'Import',
    export: 'Export',
    help: 'Help & Settings',
    table: 'Table',
    language: 'Language',
    theme: 'Theme',
    flyover: 'Format toolbar on selection',
    rows: 'Rows',
    cols: 'Columns',
    headerRow: 'Header Row',
    insert: 'Insert',
    cancel: 'Cancel',
    syntaxHelp: 'Luma Syntax & Help',
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
    checkbox: 'Checkbox',
    langAuto: 'Browser Default',
    langDe: 'Deutsch',
    langEn: 'English',
    rowHeight: 'Table Row Height',
    exportMd: 'As Markdown (.md)',
    exportPdf: 'As PDF (.pdf)'
  }
};

export default function App() {
  const [langSetting, setLangSetting] = useState<LanguageSetting>(() => {
    return (localStorage.getItem('luma_lang_setting') as LanguageSetting) || 'auto';
  });

  const lang: Language = langSetting === 'auto' 
    ? (navigator.language.startsWith('de') ? 'de' : 'en') 
    : langSetting;

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
  const [tableRowHeight, setTableRowHeight] = useState(() => localStorage.getItem('luma_row_height') || '14px');
  
  const [showFlyover, setShowFlyover] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showExportPopover, setShowExportPopover] = useState(false);
  
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(2);
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
    localStorage.setItem('luma_row_height', tableRowHeight);
  }, [tableRowHeight]);

  useEffect(() => {
    localStorage.setItem('luma_lang_setting', langSetting);
  }, [langSetting]);

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

  const handleExportMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luma_note_${new Date().toISOString().slice(0,10)}.md`;
    a.click();
    setShowExportPopover(false);
  };

  const handleExportPdf = () => {
    const element = document.querySelector('.milkdown .editor') || document.querySelector('.source-view');
    if (!element) return;
    
    const opt = {
      margin: 1,
      filename: `luma_note_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element as HTMLElement).save();
    setShowExportPopover(false);
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
            <div className="flex items-center gap-1">
              <Settings size={18} />
              <span style={{ opacity: 0.5 }}>/</span>
              <HelpCircle size={18} />
            </div>
          </button>
        </div>

        <div className="flex gap-2">
          <label className="menu-item">
            <FileUp size={18} />
            <span>{t.import}</span>
            <input type="file" hidden onChange={handleImport} accept=".md" />
          </label>
          
          <div style={{ position: 'relative' }}>
            <button className={`menu-item ${showExportPopover ? 'active' : ''}`} onClick={() => setShowExportPopover(!showExportPopover)}>
              <FileDown size={18} />
              <span>{t.export}</span>
            </button>
            
            {showExportPopover && (
              <div className="export-popover">
                <button onClick={handleExportMd}><FileText size={16} /> {t.exportMd}</button>
                <button onClick={handleExportPdf}><FileDown size={16} /> {t.exportPdf}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main style={{ flex: 1, overflowY: 'auto' }} onClick={() => setShowExportPopover(false)}>
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
            tableRowHeight={tableRowHeight}
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
            <div className="flex items-center justify-between mb-4 border-b pb-4">
              <h2>{t.syntaxHelp}</h2>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span style={{ fontSize: '10px', opacity: 0.6, fontWeight: 'bold' }}>{t.language}</span>
                  <div className="flex items-center gap-2">
                    <Globe size={14} style={{ opacity: 0.6 }} />
                    <select className="menu-select" style={{ padding: '2px 8px' }} value={langSetting} onChange={(e) => setLangSetting(e.target.value as LanguageSetting)}>
                      <option value="auto">{t.langAuto}</option>
                      <option value="de">{t.langDe}</option>
                      <option value="en">{t.langEn}</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span style={{ fontSize: '10px', opacity: 0.6, fontWeight: 'bold' }}>{t.rowHeight}</span>
                  <div className="flex items-center gap-1">
                    {ROW_HEIGHTS.map(h => (
                      <button 
                        key={h.value} 
                        className={`menu-item ${tableRowHeight === h.value ? 'active' : ''}`}
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                        onClick={() => setTableRowHeight(h.value)}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
        .flex-col { flex-direction: column; }
        .flex-grow { flex-grow: 1; }
        .items-center { align-items: center; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .justify-between { justify-content: space-between; }
        .mb-4 { margin-bottom: 16px; }
        .pb-4 { padding-bottom: 16px; }
        .border-b { border-bottom: 1px solid var(--border); }
        .divider-v { width: 1px; height: 24px; background: var(--border); margin: 0 4px; }
        
        .source-view { 
          font-size: ${fontSize};
          width: 100%;
          max-width: var(--editor-width);
          margin: 0 auto;
          display: block;
          padding: 60px 40px;
          border: none;
          background: transparent;
          color: var(--text);
          outline: none;
          resize: none;
          font-family: var(--font-mono);
          line-height: 1.7;
        }

        .export-popover {
          position: absolute; top: calc(100% + 5px); right: 0;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex; flex-direction: column; padding: 4px; z-index: 1000;
          min-width: 180px;
        }
        .export-popover button {
          display: flex; align-items: center; gap: 8px; padding: 8px 12px;
          background: transparent; border: none; color: var(--text);
          cursor: pointer; border-radius: 4px; font-size: 13px; text-align: left;
        }
        .export-popover button:hover { background: var(--border); }

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
