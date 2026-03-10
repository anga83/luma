import { useImperativeHandle, forwardRef, useRef } from 'react';
import { Milkdown, useEditor, MilkdownProvider } from '@milkdown/react';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
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

import 'prismjs/themes/prism.css';

interface EditorProps {
  initialValue: string;
  onChange: (markdown: string) => void;
  fontFamily: string;
  fontSize: string;
  showFlyover: boolean;
}

export interface EditorRef {
  update: (markdown: string) => void;
}

const tooltip = tooltipFactory('EDITOR');
const slash = slashFactory('EDITOR');

const EditorComponent = forwardRef<EditorRef, EditorProps>(({ initialValue, onChange, fontFamily, fontSize, showFlyover }, _ref) => {
  const lock = useRef(false);
  const tooltipProvider = useRef<TooltipProvider>();
  const slashProvider = useRef<SlashProvider>();

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

        // Setup tooltip provider
        ctx.set(tooltip.key, {
          view: (view) => {
            const content = document.createElement('div');
            content.className = 'milkdown-tooltip';
            content.innerHTML = `
              <button class="tooltip-button" data-command="toggleStrong">B</button>
              <button class="tooltip-button" data-command="toggleEmphasis">I</button>
              <button class="tooltip-button" data-command="wrapInBlockquote">"</button>
            `;
            
            tooltipProvider.current = new TooltipProvider({ content });

            content.addEventListener('mousedown', (e) => {
              e.preventDefault();
              const target = e.target as HTMLElement;
              const command = target.getAttribute('data-command');
              if (command) {
                // Command logic here
              }
            });

            return tooltipProvider.current;
          }
        });

        // Setup slash provider
        ctx.set(slash.key, {
          view: (view) => {
            const content = document.createElement('div');
            content.className = 'milkdown-slash';
            slashProvider.current = new SlashProvider({ content });
            return slashProvider.current;
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
        }
        
        .hide-flyover .milkdown-tooltip {
          display: none !important;
        }

        /* Syntax Highlighting Fixes */
        .milkdown .token { background: transparent !important; }
        .milkdown .token.keyword { color: #0033b3; }
        .milkdown .token.string { color: #067d17; }
        
        [data-theme='dark'] .milkdown .token.keyword { color: #cc7832; }
        [data-theme='dark'] .milkdown .token.string { color: #6a8759; }

        .milkdown-tooltip {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          display: flex;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 2px;
        }

        .tooltip-button {
          background: transparent;
          border: none;
          color: var(--text);
          padding: 4px 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .tooltip-button:hover {
          background: var(--border);
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
