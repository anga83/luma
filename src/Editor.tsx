import { useImperativeHandle, forwardRef } from 'react';
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
import { tooltipFactory } from '@milkdown/plugin-tooltip';
import { slashFactory } from '@milkdown/plugin-slash';
import { listener, listenerCtx } from '@milkdown/plugin-listener';

// Import highlight.js styles for general theme support
import 'highlight.js/styles/github.css'; 

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
  useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, initialValue);
        
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
          if (markdown !== prevMarkdown) {
            onChange(markdown);
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
  }, [initialValue]);

  useImperativeHandle(_ref, () => ({
    getMarkdown: () => ""
  }));

  return (
    <div 
      className={`milkdown-container ${showFlyover ? '' : 'hide-tooltip'}`}
      style={{ '--font-family': fontFamily, '--font-size': fontSize } as any}
    >
      <Milkdown />
      <style>{`
        .milkdown-container .editor {
          font-family: var(--font-family) !important;
          font-size: var(--font-size) !important;
        }
        .hide-tooltip [data-plugin-key="EDITOR_TOOLTIP"] {
          display: none !important;
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
