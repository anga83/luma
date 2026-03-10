import { forwardRef, useRef } from 'react';
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

  const { get } = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, initialValue);
        
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
          if (markdown !== prevMarkdown && !lock.current) {
            onChange(markdown);
          }
        });

        // Setup tooltip provider with corrected command execution
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
            
            const provider = new TooltipProvider({ content });

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
        
        .hide-flyover .milkdown-tooltip {
          display: none !important;
        }

        .milkdown .token { background: transparent !important; }
        
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
          pointer-events: auto;
        }

        .tooltip-button {
          background: transparent;
          border: none;
          color: var(--text);
          padding: 6px 10px;
          cursor: pointer;
          font-weight: 600;
          border-radius: 4px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
        }

        .tooltip-button:hover {
          background: var(--border);
          color: var(--accent);
        }

        .divider {
          width: 1px;
          height: 18px;
          background: var(--border);
          margin: 0 4px;
        }

        /* Checkbox styling fix */
        .milkdown .task-list-item {
          list-style: none !important;
          padding-left: 0 !important;
          display: flex !important;
          align-items: flex-start !important;
          gap: 8px !important;
          margin-bottom: 4px !important;
        }

        .milkdown .task-list-item input[type="checkbox"] {
          margin-top: 6px !important;
          width: 16px !important;
          height: 16px !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
        }

        .milkdown .task-list-item p {
          margin: 0 !important;
          line-height: 1.8 !important;
        }

        .milkdown pre {
          background: #f6f8fa !important;
          border: 1px solid var(--border) !important;
          position: relative;
        }
        [data-theme='dark'] .milkdown pre {
          background: #161b22 !important;
        }
        .milkdown pre code {
          background: transparent !important;
          padding: 0 !important;
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
