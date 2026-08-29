import { Fragment, type ReactNode } from 'react';

// A small, dependency-free markdown renderer covering the subset CyberHack
// needs: headings, bold/italic, inline code, fenced code blocks, links,
// bullet lists, and paragraphs. Not a full CommonMark implementation.

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={`${keyPrefix}-t-${i++}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      nodes.push(
        <code key={`${keyPrefix}-c-${i++}`} className="rounded-sm bg-void-800 border border-line px-1.5 py-0.5 font-mono text-[0.85em] text-cyan">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[')) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        nodes.push(
          <a
            key={`${keyPrefix}-l-${i++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon underline decoration-neon/30 underline-offset-2 hover:decoration-neon"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`${keyPrefix}-t-${i++}`}>{text.slice(lastIndex)}</Fragment>);
  }
  return nodes;
}

export function renderMarkdown(content: string): ReactNode {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1 my-2 text-sm text-white/80">
          {listBuffer.map((item, idx) => (
            <li key={idx}>{renderInline(item, `li-${blocks.length}-${idx}`)}</li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      flushList();
      blocks.push(
        <div key={`code-${blocks.length}`} className="my-2 rounded-sm border border-line bg-void-900 overflow-hidden">
          {lang && (
            <div className="px-3 py-1 border-b border-line mono-label !text-white/40">{lang}</div>
          )}
          <pre className="p-3 overflow-x-auto text-[12.5px] font-mono text-white/85 leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>,
      );
      continue;
    }

    if (/^#{1,3}\s/.test(line)) {
      flushList();
      const level = line.match(/^#+/)?.[0].length ?? 1;
      const text = line.replace(/^#{1,3}\s/, '');
      const Tag = (level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5') as keyof JSX.IntrinsicElements;
      blocks.push(
        <Tag key={`h-${blocks.length}`} className="font-semibold text-white mt-3 mb-1">
          {renderInline(text, `h-${blocks.length}`)}
        </Tag>,
      );
      i++;
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      listBuffer.push(line.replace(/^[-*]\s/, ''));
      i++;
      continue;
    }

    flushList();
    if (line.trim() === '') {
      i++;
      continue;
    }

    blocks.push(
      <p key={`p-${blocks.length}`} className="text-sm text-white/85 leading-relaxed my-1.5">
        {renderInline(line, `p-${blocks.length}`)}
      </p>,
    );
    i++;
  }
  flushList();

  return <>{blocks}</>;
}