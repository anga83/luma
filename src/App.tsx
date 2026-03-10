import React, { useState, useEffect, useRef } from 'react';
import { MarkdownEditor } from './Editor';
import type { EditorRef } from './Editor';
import { 
  FileUp, FileDown, 
  Moon, Sun, Eye, Code, Layers, HelpCircle
} from 'lucide-react';

const FONT_FAMILIES = [
  { label: 'System Sans', value: 'var(--font-sans)' },
  { label: 'Serif (Baskerville)', value: 'var(--font-serif)' },
  { label: 'Elegant (Playfair)', value: 'var(--font-playfair)' },
  { label: 'Monospace', value: 'var(--font-mono)' },
];

const FONT_SIZES = ['14px', '16px', '18px', '20px', '22px'];

export default function App() {
  const [markdown, setMarkdown] = useState('# Willkommen bei Luma\n\nSchreibe deine Notizen in Markdown. Die Formatierung passiert **live**!\n\n- [x] Checkboxen werden unterstützt\n- [ ] Markiere Text für die Flyover-Leiste\n\n```javascript\nconsole.log("Syntax Highlighting inklusive!");\n```');
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState('18px');
  const [showFlyover, setShowFlyover] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  
  const editorRef = useRef<EditorRef>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleSourceMode = () => {
    setIsSourceMode(!isSourceMode);
  };

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.md';
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setMarkdown(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <div className="menu-bar">
        <div className="flex-grow flex items-center gap-4">
          <button 
            className={`menu-item mode-toggle ${isSourceMode ? 'active' : ''}`} 
            onClick={toggleSourceMode} 
            title={isSourceMode ? "WYSIWYG" : "Source Markdown"}
          >
            {isSourceMode ? <Eye size={18} /> : <Code size={18} />}
            <span>{isSourceMode ? "Source" : "Visual"}</span>
          </button>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
          
          <select 
            className="menu-select" 
            value={fontFamily} 
            onChange={(e) => setFontFamily(e.target.value)}
          >
            {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          <select 
            className="menu-select" 
            value={fontSize} 
            onChange={(e) => setFontSize(e.target.value)}
          >
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

          <button className="menu-item" onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Dark Mode">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className={`menu-item ${showFlyover ? 'active' : ''}`} onClick={() => setShowFlyover(!showFlyover)} title="Flyover Toolbar">
            <Layers size={18} />
          </button>

          <button className="menu-item" onClick={() => setShowHelp(true)} title="Markdown Help">
            <HelpCircle size={18} />
            <span>Help</span>
          </button>
        </div>

        <div className="flex gap-2">
          <label className="menu-item">
            <FileUp size={18} />
            <span>Import</span>
            <input type="file" hidden onChange={handleImport} accept=".md" />
          </label>
          <button className="menu-item" onClick={handleExport}>
            <FileDown size={18} />
            <span>Export</span>
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

      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-content" onClick={e => e.stopPropagation()}>
            <button className="help-close" onClick={() => setShowHelp(false)}>✕</button>
            <h2>Luma Syntax Hilfe</h2>
            <div className="help-grid">
              <div className="help-item">
                <h3>Text Styling</h3>
                <p><code>**Bold**</code> → <strong>Bold</strong></p>
                <p><code>*Italic*</code> → <em>Italic</em></p>
                <p><code>~~Strike~~</code> → <del>Strike</del></p>
                <p><code>`Inline Code`</code></p>
              </div>
              <div className="help-item">
                <h3>Headers</h3>
                <p><code># H1 Header</code></p>
                <p><code>## H2 Header</code></p>
                <p><code>### H3 Header</code></p>
              </div>
              <div className="help-item">
                <h3>Lists</h3>
                <p><code>- Bullet point</code></p>
                <p><code>1. Numbered item</code></p>
                <p><code>- [x] Task checkbox</code></p>
              </div>
              <div className="help-item">
                <h3>Blocks</h3>
                <p><code>&gt; Blockquote</code></p>
                <p><code>```js \n Code block \n ```</code></p>
                <p><code>---</code> (Horizontal rule)</p>
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
        
        .source-view {
          font-size: ${fontSize};
        }
      `}</style>
    </>
  );
}
