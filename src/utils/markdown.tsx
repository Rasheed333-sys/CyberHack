import { Fragment, type ReactNode } from 'react';

// CyberHack lightweight Markdown renderer.
// Supports:
// - Headings
// - Bold
// - Inline code
// - Markdown links
// - Bullet lists
// - Tables
// - Fenced code blocks
// - HTML <br> line breaks commonly returned by web/AI content

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];

  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`${keyPrefix}-t-${i++}`}>
          {text.slice(lastIndex, match.index)}
        </Fragment>,
      );
    }

    const token = match[0];

    if (token.startsWith('**')) {
      nodes.push(
        <strong
          key={`${keyPrefix}-b-${i++}`}
          className="font-semibold text-white"
        >
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${i++}`}
          className="rounded-sm bg-void-800 border border-line px-1.5 py-0.5 font-mono text-[0.85em] text-cyan"
        >
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
    nodes.push(
      <Fragment key={`${keyPrefix}-t-${i++}`}>
        {text.slice(lastIndex)}
      </Fragment>,
    );
  }

  return nodes;
}

function isTableSeparator(line: string): boolean {
  const cells = line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

  return (
    cells.length >= 2 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function renderTable(
  headers: string[],
  rows: string[][],
  key: string,
): ReactNode {
  return (
    <div
      key={key}
      className="my-3 overflow-x-auto rounded-sm border border-line"
    >
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-void-800/80">
            {headers.map((header, index) => (
              <th
                key={`${key}-h-${index}`}
                className="border-b border-line px-3 py-2 text-left font-semibold text-white/90"
              >
                {renderInline(header, `${key}-h-${index}`)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={`${key}-r-${rowIndex}`}
              className="border-b border-line/60 last:border-b-0 hover:bg-void-800/40 transition-colors"
            >
              {headers.map((_, columnIndex) => (
                <td
                  key={`${key}-r-${rowIndex}-c-${columnIndex}`}
                  className="px-3 py-2 align-top text-white/75 leading-relaxed"
                >
                  {renderInline(
                    row[columnIndex] ?? '',
                    `${key}-r-${rowIndex}-c-${columnIndex}`,
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function renderMarkdown(content: string): ReactNode {
  // Convert HTML-style line breaks returned by some AI/web content
  // into real Markdown/newline breaks before parsing.
  const normalizedContent = content.replace(/<br\s*\/?>/gi, '\n');

  const lines = normalizedContent.split('\n');

  const blocks: ReactNode[] = [];

  let i = 0;
  let listBuffer: string[] = [];

  const flushList = () => {
    if (!listBuffer.length) return;

    blocks.push(
      <ul
        key={`ul-${blocks.length}`}
        className="list-disc pl-5 space-y-1 my-2 text-sm text-white/80"
      >
        {listBuffer.map((item, index) => (
          <li key={index}>
            {renderInline(item, `li-${blocks.length}-${index}`)}
          </li>
        ))}
      </ul>,
    );

    listBuffer = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    // ─────────────────────────────────────────────
    // Fenced code blocks
    // ─────────────────────────────────────────────
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];

      i++;

      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }

      if (i < lines.length) {
        i++;
      }

      flushList();

      blocks.push(
        <div
          key={`code-${blocks.length}`}
          className="my-2 rounded-sm border border-line bg-void-900 overflow-hidden"
        >
          {lang && (
            <div className="px-3 py-1 border-b border-line mono-label !text-white/40">
              {lang}
            </div>
          )}

          <pre className="p-3 overflow-x-auto text-[12.5px] font-mono text-white/85 leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>,
      );

      continue;
    }

    // ─────────────────────────────────────────────
    // Markdown tables
    // ─────────────────────────────────────────────
    if (
      i + 1 < lines.length &&
      line.includes('|') &&
      isTableSeparator(lines[i + 1])
    ) {
      flushList();

      const headers = parseTableRow(line);
      const rows: string[][] = [];

      i += 2;

      while (i < lines.length && lines[i].includes('|')) {
        if (lines[i].trim() === '') break;

        rows.push(parseTableRow(lines[i]));
        i++;
      }

      blocks.push(
        renderTable(
          headers,
          rows,
          `table-${blocks.length}`,
        ),
      );

      continue;
    }

    // ─────────────────────────────────────────────
    // Headings
    // ─────────────────────────────────────────────
    if (/^#{1,3}\s/.test(line)) {
      flushList();

      const level = line.match(/^#+/)?.[0].length ?? 1;
      const text = line.replace(/^#{1,3}\s/, '');

      const Tag = (
        level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5'
      ) as keyof JSX.IntrinsicElements;

      blocks.push(
        <Tag
          key={`h-${blocks.length}`}
          className="font-semibold text-white mt-3 mb-1"
        >
          {renderInline(text, `h-${blocks.length}`)}
        </Tag>,
      );

      i++;
      continue;
    }

    // ─────────────────────────────────────────────
    // Bullet lists
    // ─────────────────────────────────────────────
    if (/^[-*]\s/.test(line)) {
      listBuffer.push(line.replace(/^[-*]\s/, ''));
      i++;
      continue;
    }

    flushList();

    // ─────────────────────────────────────────────
    // Empty lines
    // ─────────────────────────────────────────────
    if (line.trim() === '') {
      i++;
      continue;
    }

    // ─────────────────────────────────────────────
    // Normal paragraph
    // ─────────────────────────────────────────────
    blocks.push(
      <p
        key={`p-${blocks.length}`}
        className="text-sm text-white/85 leading-relaxed my-1.5"
      >
        {renderInline(line, `p-${blocks.length}`)}
      </p>,
    );

    i++;
  }

  flushList();

  return <>{blocks}</>;
}