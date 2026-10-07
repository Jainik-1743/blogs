import type { ReactNode } from "react";
import { Lexer, type Token, type Tokens } from "marked";
import Callout from "@/components/Callout";
import InterviewQA from "@/components/InterviewQA";
import CodeBlock from "@/components/sd/CodeBlock";

/**
 * Renders a lesson written in Markdown with the site's own components:
 *   - fenced code           → <CodeBlock> (copy button, light colouring)
 *   - > blockquote          → <Callout>; start it with [!warn], [!ok] or [!bad] to change the colour
 *   - tables                → scrollable tables styled by .lesson
 *   - "## Interview questions" with "### Q…" sub-headings → click-to-reveal <InterviewQA>
 * Plain Markdown therefore works everywhere else, so a lesson file can be pasted into any blog.
 */

type Kind = "note" | "warn" | "ok" | "bad";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** The h2 headings of a lesson, for the "On this page" list. */
export function outlineOf(src: string): { id: string; label: string }[] {
  return Lexer.lex(src)
    .filter((t): t is Tokens.Heading => t.type === "heading" && t.depth === 2)
    .map((t) => ({ id: slugify(t.text), label: t.text.replace(/[`*_]/g, "") }));
}

function inline(tokens: Token[] | undefined, key = "i"): ReactNode[] {
  if (!tokens) return [];
  return tokens.map((t, i) => {
    const k = `${key}-${i}`;
    switch (t.type) {
      case "strong":
        return <strong key={k}>{inline((t as Tokens.Strong).tokens, k)}</strong>;
      case "em":
        return <em key={k}>{inline((t as Tokens.Em).tokens, k)}</em>;
      case "del":
        return <del key={k}>{inline((t as Tokens.Del).tokens, k)}</del>;
      case "codespan":
        return <code key={k}>{(t as Tokens.Codespan).text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")}</code>;
      case "br":
        return <br key={k} />;
      case "link": {
        const l = t as Tokens.Link;
        const external = /^https?:/.test(l.href);
        return (
          <a key={k} href={l.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {inline(l.tokens, k)}
          </a>
        );
      }
      case "escape":
        return (t as Tokens.Escape).text;
      case "text": {
        const tx = t as Tokens.Text;
        return tx.tokens && tx.tokens.length ? <span key={k}>{inline(tx.tokens, k)}</span> : decode(tx.text);
      }
      default:
        return (t as { raw?: string }).raw ?? "";
    }
  });
}

/** marked escapes HTML in plain text tokens; React escapes again, so undo it once. */
function decode(s: string) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function blocks(tokens: Token[], key = "b", used: Map<string, number> = new Map()): ReactNode[] {
  const out: ReactNode[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const k = `${key}-${i}`;
    switch (t.type) {
      case "space":
        break;
      case "heading": {
        const h = t as Tokens.Heading;
        const base = slugify(h.text);
        const n = (used.get(base) ?? 0) + 1;
        used.set(base, n);
        const id = n === 1 ? base : `${base}-${n}`;

        // "## Interview questions": each "### …" becomes a click-to-reveal question.
        if (h.depth === 2 && /interview questions/i.test(h.text)) {
          let j = i + 1;
          const section: Token[] = [];
          while (j < tokens.length && !(tokens[j].type === "heading" && (tokens[j] as Tokens.Heading).depth <= 2)) section.push(tokens[j++]);
          out.push(<h2 key={k} id={id}>{inline(h.tokens, k)}</h2>);
          const intro: Token[] = [];
          const qa: { q: string; a: Token[] }[] = [];
          for (const s of section) {
            if (s.type === "heading" && (s as Tokens.Heading).depth === 3) qa.push({ q: (s as Tokens.Heading).text.replace(/[`*_]/g, "").replace(/^Q\d+[.:]\s*/, ""), a: [] });
            else if (qa.length) qa[qa.length - 1].a.push(s);
            else intro.push(s);
          }
          out.push(...blocks(intro, `${k}-intro`, used));
          if (qa.length) out.push(<InterviewQA key={`${k}-qa`} items={qa.map((x, n) => ({ q: x.q, a: <>{blocks(x.a, `${k}-a${n}`, used)}</> }))} />);
          i = j - 1;
          break;
        }
        const Tag = (`h${Math.min(h.depth, 4)}`) as "h2" | "h3" | "h4";
        out.push(<Tag key={k} id={id}>{inline(h.tokens, k)}</Tag>);
        break;
      }
      case "paragraph":
        out.push(<p key={k}>{inline((t as Tokens.Paragraph).tokens, k)}</p>);
        break;
      case "text":
        out.push(<p key={k}>{inline((t as Tokens.Text).tokens ?? [], k)}</p>);
        break;
      case "code": {
        const c = t as Tokens.Code;
        out.push(<CodeBlock key={k} lang={c.lang || undefined} code={c.text} />);
        break;
      }
      case "blockquote": {
        const q = t as Tokens.Blockquote;
        const m = q.text.match(/^\s*\[!(note|warn|ok|bad)\]\s*/i);
        const kind = (m ? m[1].toLowerCase() : "note") as Kind;
        let inner = q.tokens;
        if (m) {
          // drop the marker from the first paragraph
          const first = inner[0] as Tokens.Paragraph | undefined;
          if (first?.type === "paragraph" && first.tokens[0]?.type === "text") {
            const ft = first.tokens[0] as Tokens.Text;
            const cleaned = { ...ft, text: ft.text.replace(/^\s*\[!(note|warn|ok|bad)\]\s*/i, "") };
            inner = [{ ...first, tokens: [cleaned, ...first.tokens.slice(1)] } as Token, ...inner.slice(1)];
          }
        }
        out.push(<Callout key={k} kind={kind}>{blocks(inner, k, used)}</Callout>);
        break;
      }
      case "list": {
        const l = t as Tokens.List;
        const items = l.items.map((it, n) => (
          <li key={`${k}-${n}`}>{blocks(it.tokens.map((x) => (x.type === "text" ? ({ ...x, type: "tight" } as unknown as Token) : x)), `${k}-${n}`, used)}</li>
        ));
        out.push(l.ordered ? <ol key={k} start={l.start === "" ? undefined : l.start}>{items}</ol> : <ul key={k}>{items}</ul>);
        break;
      }
      case "tight":
        out.push(<span key={k} className="block">{inline((t as Tokens.Text).tokens ?? [], k)}</span>);
        break;
      case "table": {
        const tb = t as Tokens.Table;
        out.push(
          <div key={k} className="table-wrap">
            <table>
              <thead>
                <tr>{tb.header.map((c, n) => <th key={n}>{inline(c.tokens, `${k}h${n}`)}</th>)}</tr>
              </thead>
              <tbody>
                {tb.rows.map((r, ri) => (
                  <tr key={ri}>{r.map((c, n) => <td key={n}>{inline(c.tokens, `${k}r${ri}c${n}`)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        break;
      }
      case "hr":
        out.push(<hr key={k} />);
        break;
      case "html":
        break;
      default:
        break;
    }
  }
  return out;
}

export default function Markdown({ source }: { source: string }) {
  return <>{blocks(Lexer.lex(source))}</>;
}
