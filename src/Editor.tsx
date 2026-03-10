import { forwardRef, useRef, useEffect } from 'react';
import { Milkdown, useEditor, MilkdownProvider } from '@milkdown/react';
import { defaultValueCtx, Editor, rootCtx, commandsCtx } from '@milkdown/core';
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
import { 
  toggleStrongCommand, 
  toggleEmphasisCommand, 
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  toggleInlineCodeCommand,
  createCodeBlockCommand,
  updateLinkCommand
} from '@milkdown/preset-commonmark';
import { toggleStrikethroughCommand } from '@milkdown/preset-gfm';

import 'prismjs/themes/prism.css';

interface EditorProps {
  initialValue: string;
  onChange: (markdown: string) => void;
  fontFamily: string;
  fontSize: string;
  showFlyover: boolean;
}

export interface EditorRef {
  getMarkdown: () => string;
}

const tooltip = tooltipFactory('EDITOR');
const slash = slashFactory('EDITOR');

const EditorComponent = forwardRef<EditorRef, EditorProps>(({ initialValue, onChange, fontFamily, fontSize, showFlyover }, _ref) => {
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

        ctx.set(tooltip.key, {
          view: (_view) => {
            const content = document.createElement('div');
            content.className = 'milkdown-tooltip';
            content.innerHTML = `
              <button class="tooltip-button" data-command="strong" title="Bold">B</button>
              <button class="tooltip-button" data-command="emphasis" title="Italic">I</button>
              <button class="tooltip-button" data-command="strike" title="Strike">S</button>
              <button class="tooltip-button" data-command="inline-code" title="Inline Code">{}</button>
              <div class="divider"></div>
              <button class="tooltip-button" data-command="bullet-list" title="Bullet List">•</button>
              <button class="tooltip-button" data-command="ordered-list" title="Ordered List">1.</button>
              <button class="tooltip-button" data-command="quote" title="Quote">"</button>
              <div class="divider"></div>
              <button class="tooltip-button" data-command="link" title="Link">Link</button>
              <button class="tooltip-button" data-command="code-block" title="Code Block">Code</button>
            `;
            
            const provider = new TooltipProvider({ 
              content,
              shouldShow: (view) => {
                const { selection, doc } = view.state;
                const { from, to, empty } = selection;
                const hasText = doc.textBetween(from, to).length > 0;
                return !empty && hasText && view.hasFocus();
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
                switch(commandType) {
                  case 'strong': commands.call(toggleStrongCommand.key); break;
                  case 'emphasis': commands.call(toggleEmphasisCommand.key); break;
                  case 'strike': commands.call(toggleStrikethroughCommand.key); break;
                  case 'inline-code': commands.call(toggleInlineCodeCommand.key); break;
                  case 'bullet-list': commands.call(wrapInBulletListCommand.key); break;
                  case 'ordered-list': commands.call(wrapInOrderedListCommand.key); break;
                  case 'quote': commands.call(wrapInBlockquoteCommand.key); break;
                  case 'code-block': commands.call(createCodeBlockCommand.key); break;
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

  return (
    <div 
      className={`milkdown-container ${showFlyover ? 'show-flyover' : 'hide-flyover'}`}
      style={{ '--font-family': fontFamily, '--font-size': fontSize } as any}
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
          border-radius: 6px;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 2px;
          gap: 2px;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s, visibility 0.2s;
          pointer-events: none;
        }

        .milkdown-tooltip[data-show="true"] {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .hide-flyover .milkdown-tooltip {
          display: none !important;
        }

        /* Checkbox styling fix - Target GFM task list items */
        .milkdown li.task-list-item {
          list-style: none !important;
          display: flex !important;
          align-items: flex-start !important;
          gap: 10px !important;
          margin-left: -20px !important;
          position: relative;
        }

        .milkdown li.task-list-item input[type="checkbox"] {
          appearance: checkbox !important;
          -webkit-appearance: checkbox !important;
          width: 16px !important;
          height: 16px !important;
          margin-top: 6px !important;
          cursor: pointer !important;
          opacity: 1 !important;
          position: relative !important;
          visibility: visible !important;
          flex-shrink: 0 !important;
        }

        /* Ensure tables look good even without the extra plugin */
        .milkdown table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5em 0;
        }
        .milkdown th, .milkdown td {
          border: 1px solid var(--border);
          padding: 10px 14px;
        }
        .milkdown th {
          background: rgba(0,0,0,0.03);
          font-weight: 600;
        }

        .milkdown pre {
          background: #f6f8fa !important;
          border: 1px solid var(--border) !important;
        }
        [data-theme='dark'] .milkdown pre {
          background: #161b22 !important;
        }
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
