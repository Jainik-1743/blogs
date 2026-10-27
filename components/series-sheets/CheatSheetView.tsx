import Link from "next/link";
import type { ReactNode } from "react";
import type { CheatBlock, CheatSection, CheatSheet } from "@/lib/series-sheets/types";

/** `code` and **bold** inside a line of text. */
export function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("`")) return <code key={i} className="ss-code">{part.slice(1, -1)}</code>;
    if (part.startsWith("**")) return <strong key={i} className="text-ink">{part.slice(2, -2)}</strong>;
    return part;
  });
}

function Block({ b }: { b: CheatBlock }) {
  switch (b.kind) {
    case "points":
      return (
        <ul className="ss-list">
          {b.items.map((t, i) => (
            <li key={i}>{inline(t)}</li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="ss-steps">
          {b.items.map((t, i) => (
            <li key={i}>{inline(t)}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <table className="ss-table">
          <thead>
            <tr>
              {b.head.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={b.mono?.includes(j) ? "font-mono" : undefined}>
                    {inline(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "code":
      return (
        <div>
          <pre className="ss-pre" data-no-tts="">
            <code>{b.code}</code>
          </pre>
          {b.note ? <p className="ss-note">{inline(b.note)}</p> : null}
        </div>
      );
    case "pairs":
      return (
        <dl className="ss-pairs">
          {b.rows.map(([k, v], i) => (
            <div key={i}>
              <dt>{k}</dt>
              <dd>{inline(v)}</dd>
            </div>
          ))}
        </dl>
      );
    case "callout":
      return (
        <p className={`ss-callout ${b.tone === "warn" ? "ss-warn" : "ss-tip"}`}>
          <strong>{b.tone === "warn" ? "Watch out: " : "Tip: "}</strong>
          {inline(b.text)}
        </p>
      );
  }
}

export default function CheatSheetView({ sheet, lessonHref }: { sheet: CheatSheet; lessonHref: (n: number) => string | undefined }) {
  return (
    <div className="ss-grid">
      {sheet.sections.map((s: CheatSection, i) => {
        const href = s.lesson !== undefined ? lessonHref(s.lesson) : undefined;
        return (
          <section key={i} className="ss-card">
            <h2 className="ss-title">
              <span>{s.title}</span>
              {href ? (
                <Link href={href} className="ss-lesson">
                  Lesson {s.lesson} →
                </Link>
              ) : null}
            </h2>
            <div className="ss-body">
              {s.blocks.map((b, j) => (
                <Block key={j} b={b} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
