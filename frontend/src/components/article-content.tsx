import type { ReactNode } from 'react';

type Block =
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'paragraph'; text: string };

function parse(markdown: string): Block[] {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block): Block => {
      const lines = block.split('\n').map((line) => line.trim());
      const first = lines[0];

      if (first.startsWith('### ')) {
        return {
          kind: 'heading',
          level: 3,
          text: lines.join(' ').replace(/^###\s*/, ''),
        };
      }
      if (first.startsWith('## ')) {
        return {
          kind: 'heading',
          level: 2,
          text: lines.join(' ').replace(/^##\s*/, ''),
        };
      }
      if (first.startsWith('# ')) {
        return {
          kind: 'heading',
          level: 2,
          text: lines.join(' ').replace(/^#\s*/, ''),
        };
      }
      if (lines.every((line) => line.startsWith('- ') || line.startsWith('* '))) {
        return { kind: 'list', items: lines.map((line) => line.slice(2)) };
      }
      if (lines.every((line) => line.startsWith('> '))) {
        return {
          kind: 'quote',
          text: lines.map((line) => line.slice(2)).join(' '),
        };
      }

      return { kind: 'paragraph', text: block };
    });
}

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-emerald-900/5 px-1.5 py-0.5 font-mono text-[0.9em] text-emerald-900"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function ArticleContent({ markdown }: { markdown: string }) {
  const blocks = parse(markdown);

  return (
    <div className="space-y-5 text-[15px] leading-relaxed text-stone-700">
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          const className =
            block.level === 2
              ? 'font-serif text-2xl font-semibold text-emerald-950'
              : 'font-serif text-xl font-semibold text-emerald-950';

          return block.level === 2 ? (
            <h2 key={index} className={className}>
              {inline(block.text)}
            </h2>
          ) : (
            <h3 key={index} className={className}>
              {inline(block.text)}
            </h3>
          );
        }

        if (block.kind === 'list') {
          return (
            <ul
              key={index}
              className="list-disc space-y-2 pl-5 marker:text-amber-500"
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{inline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.kind === 'quote') {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-amber-400 pl-4 font-serif text-lg italic text-emerald-900"
            >
              {inline(block.text)}
            </blockquote>
          );
        }

        return (
          <p key={index} className="whitespace-pre-line">
            {inline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
