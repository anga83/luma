import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { Milkdown, useEditor, MilkdownProvider } from '@milkdown/react';
import { defaultValueCtx, Editor, rootCtx, commandsCtx, remarkPluginsCtx, editorViewCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { history } from '@milkdown/plugin-history';
import { prism } from '@milkdown/plugin-prism';
import { cursor } from '@milkdown/plugin-cursor';
import { indent } from '@milkdown/plugin-indent';
import { clipboard } from '@milkdown/plugin-clipboard';
import { trailing } from '@milkdown/plugin-trailing';
import { tooltipFactory, TooltipProvider } from '@milkdown/plugin-tooltip';
import { slashFactory, SlashProvider } from '@milkdown/plugin-slash';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { replaceAll, insert } from '@milkdown/utils';
import { 
  toggleStrongCommand, 
  toggleEmphasisCommand, 
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  toggleInlineCodeCommand,
  updateLinkCommand
} from '@milkdown/preset-commonmark';
import { toggleStrikethroughCommand } from '@milkdown/preset-gfm';
import remarkGfm from 'remark-gfm';

import 'prismjs/themes/prism.css';

interface EditorProps {
  initialValue: string;
  onChange: (markdown: string) => void;
  fontFamily: string;
  fontSize: string;
  showFlyover: boolean;
  tableRowHeight: string;
}

export interface EditorRef {
  updateContent: (markdown: string) => void;
  getMarkdown: () => string;
}

const tooltip = tooltipFactory('EDITOR');
const slash = slashFactory('EDITOR');

const ICONS = {
  bold: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
  italic: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
  strike: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
  code: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  quote: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3c0 4-4 6-4 6zm14 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3c0 4-4 6-4 6z"/></svg>',
  bullet: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  number: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><polyline points="9 11 12 14 22 4"/></svg>'
};

const EditorComponent = forwardRef<EditorRef, EditorProps>(({ initialValue, onChange, fontFamily, fontSize, showFlyover, tableRowHeight }, ref) => {
  const lock = useRef(false);
  const editorRef = useRef<Editor | undefined>(undefined);

  const { get, loading } = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, initialValue);
        
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
          if (markdown !== prevMarkdown && !lock.current) {
            onChange(markdown);
          }
        });

        // Ensure GFM remark plugin is loaded with autolink enabled
        ctx.update(remarkPluginsCtx, (prev) => [...prev, [remarkGfm, { autolink: true }] as any]);

        ctx.get(listenerCtx).mounted((ctx) => {
          const view = ctx.get(editorViewCtx);
          view.dom.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            if (anchor) {
              const href = anchor.getAttribute('href');
              if (href) {
                window.open(href, '_blank');
                e.preventDefault();
              }
            }
          });
        });

        ctx.set(tooltip.key, {
          view: (_view) => {
            const content = document.createElement('div');
            content.className = 'milkdown-tooltip';
            content.innerHTML = `
              <button class="tooltip-button" data-command="strong" title="Bold">${ICONS.bold}</button>
              <button class="tooltip-button" data-command="emphasis" title="Italic">${ICONS.italic}</button>
              <button class="tooltip-button" data-command="strike" title="Strike">${ICONS.strike}</button>
              <button class="tooltip-button" data-command="inline-code" title="Inline Code">${ICONS.code}</button>
              <div class="divider"></div>
              <button class="tooltip-button" data-command="bullet-list" title="Bullet List">${ICONS.bullet}</button>
              <button class="tooltip-button" data-command="ordered-list" title="Ordered List">${ICONS.number}</button>
              <button class="tooltip-button" data-command="task-list" title="Task List">${ICONS.check}</button>
              <button class="tooltip-button" data-command="quote" title="Quote">${ICONS.quote}</button>
              <div class="divider"></div>
              <button class="tooltip-button" data-command="link" title="Link">${ICONS.link}</button>
            `;
            
            const provider = new TooltipProvider({ 
              content,
              shouldShow: (v) => {
                const { selection, doc } = v.state;
                const { from, to, empty } = selection;
                const hasText = doc.textBetween(from, to).length > 0;
                return !empty && hasText && v.hasFocus();
              }
            });

            content.addEventListener('mousedown', (e) => {
              e.preventDefault();
              const target = (e.target as HTMLElement).closest('button');
              if (!target) return;
              
              const commandType = target.getAttribute('data-command');
              const editor = get();
              if (!editor || !commandType) return;

              editor.action((ctx) => {
                const commands = ctx.get(commandsCtx);
                const currentView = ctx.get(editorViewCtx);
                
                switch(commandType) {
                  case 'strong': commands.call(toggleStrongCommand.key); break;
                  case 'emphasis': commands.call(toggleEmphasisCommand.key); break;
                  case 'strike': commands.call(toggleStrikethroughCommand.key); break;
                  case 'inline-code': commands.call(toggleInlineCodeCommand.key); break;
                  case 'bullet-list': commands.call(wrapInBulletListCommand.key); break;
                  case 'ordered-list': commands.call(wrapInOrderedListCommand.key); break;
                  case 'task-list': {
                    const { state } = currentView;
                    const { selection } = state;
                    const text = state.doc.textBetween(selection.from, selection.to, '\n');
                    const taskListText = text.split('\n').map(line => {
                      if (/^[-*]\s\[[ x-]\]/.test(line)) return line;
                      return `- [ ] ${line}`;
                    }).join('\n');
                    
                    commands.call(insert as any, taskListText);
                    break;
                  }
                  case 'quote': commands.call(wrapInBlockquoteCommand.key); break;
                  case 'link': {
                    const url = window.prompt('Enter Link URL', 'https://');
                    if (url) commands.call(updateLinkCommand.key, { href: url });
                    break;
                  }
                }
              });
            });

            return provider;
          }
        });

        ctx.set(slash.key, {
          view: (_view) => {
            const content = document.createElement('div');
            content.className = 'milkdown-slash';
            return new SlashProvider({ content });
          }
        });
      })
      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(prism)
      .use(cursor)
      .use(indent)
      .use(clipboard)
      .use(trailing)
      .use(tooltip)
      .use(slash)
      .use(listener);
  }, []);

  useEffect(() => {
    if (!loading && get()) {
      editorRef.current = get();
    }
  }, [loading, get]);

  useImperativeHandle(ref, () => ({
    updateContent: (markdown: string) => {
      const editor = editorRef.current;
      if (editor) {
        lock.current = true;
        editor.action((ctx) => {
          ctx.get(commandsCtx).call(replaceAll as any, markdown);
        });
        lock.current = false;
      }
    },
    getMarkdown: () => ""
  }));

  return (
    <div 
      className={`milkdown-container ${showFlyover ? 'show-flyover' : 'hide-flyover'}`}
      style={{ 
        '--font-family': fontFamily, 
        '--font-size': fontSize,
        '--table-padding': tableRowHeight 
      } as any}
    >
      <Milkdown />
      <style>{`
        .milkdown-container .editor {
          font-family: var(--font-family) !important;
          font-size: var(--font-size) !important;
          max-width: 100%;
          outline: none;
        }
        
        .milkdown-tooltip {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          padding: 4px;
          gap: 2px;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s, transform 0.2s;
          transform: translateY(5px);
          pointer-events: none;
        }

        .milkdown-tooltip[data-show="true"] {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }

        .hide-flyover .milkdown-tooltip {
          display: none !important;
        }

        .tooltip-button {
          background: transparent;
          border: none;
          color: var(--text);
          padding: 6px;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .tooltip-button:hover {
          background: var(--border);
          color: var(--accent);
        }

        .divider {
          width: 1px; height: 18px; background: var(--border); margin: 0 4px;
        }

        /* Standard list styling */
        .milkdown ul, .milkdown ol {
          padding-left: 2rem !important;
          margin: 1em 0 !important;
        }
        
        .milkdown li {
          margin-bottom: 0.5em !important;
        }

        /* Task List Styling */
        .milkdown .task-list-item {
          list-style-type: none !important;
          position: relative;
          padding-left: 30px !important;
        }

        .milkdown .task-list-item > input {
          position: absolute;
          left: 0;
          top: 6px;
          width: 18px;
          height: 18px;
          cursor: pointer;
          margin: 0;
          z-index: 10;
        }

        /* Fallback if it's just plain text inside the LI */
        .milkdown .task-list-item p:first-child {
           display: flex;
           align-items: center;
        }

        .milkdown a {
          color: var(--accent) !important;
          text-decoration: underline !important;
          cursor: pointer !important;
        }

        /* Table styling */
        .milkdown td, .milkdown th {
          padding: var(--table-padding) 14px !important;
          vertical-align: middle;
        }
        .milkdown td > p, .milkdown th > p { margin: 0 !important; }
        .milkdown table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
        .milkdown th { background: rgba(0,0,0,0.03); font-weight: 600; }
        [data-theme='dark'] .milkdown th { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
});

export const MarkdownEditor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  return (
    <MilkdownProvider>
      <EditorComponent {...props} ref={ref} />
    </MilkdownProvider>
  );
});
