import type { ReactNode } from "react";
import CodeFrame from "./CodeFrame";

/**
 * A code sample with a language tab, a copy button and light syntax colouring.
 * The colouring is deliberately small — comments, strings, numbers and keywords — so it
 * works for SQL, JS, shell, YAML, HTTP and protobuf alike without a highlighter library.
 */

const KEYWORDS: Record<string, string[]> = {
  sql: [
    "SELECT",
    "FROM",
    "WHERE",
    "JOIN",
    "LEFT",
    "RIGHT",
    "INNER",
    "OUTER",
    "ON",
    "GROUP",
    "BY",
    "ORDER",
    "LIMIT",
    "OFFSET",
    "INSERT",
    "INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE",
    "CREATE",
    "TABLE",
    "INDEX",
    "PRIMARY",
    "KEY",
    "REFERENCES",
    "NOT",
    "NULL",
    "UNIQUE",
    "DEFAULT",
    "BEGIN",
    "COMMIT",
    "ROLLBACK",
    "AND",
    "OR",
    "AS",
    "HAVING",
    "COUNT",
    "EXPLAIN",
    "ANALYZE",
    "DESC",
    "ASC",
    "IN",
    "IS",
    "LIKE",
    "FOR",
    "RETURNING",
    "TRANSACTION",
    "ISOLATION",
    "LEVEL",
    "WITH",
    "DISTINCT",
    "UNION",
    "ALTER",
    "ADD",
    "COLUMN",
    "CASCADE",
    "IF",
    "EXISTS",
    "BIGSERIAL",
    "BIGINT",
    "TEXT",
    "INT",
    "TIMESTAMPTZ",
    "BOOLEAN",
    "VARCHAR",
    "SERIAL",
    "USING",
    "CONFLICT",
    "DO",
    "NOTHING",
  ],
  js: [
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "await",
    "async",
    "new",
    "try",
    "catch",
    "finally",
    "throw",
    "import",
    "export",
    "from",
    "class",
    "extends",
    "true",
    "false",
    "null",
    "undefined",
    "of",
    "in",
    "typeof",
    "break",
    "continue",
    "default",
    "switch",
    "case",
  ],
  proto: [
    "syntax",
    "package",
    "service",
    "rpc",
    "returns",
    "message",
    "repeated",
    "string",
    "int32",
    "int64",
    "bool",
    "stream",
    "enum",
    "option",
    "import",
    "double",
    "float",
    "bytes",
  ],
  graphql: [
    "query",
    "mutation",
    "subscription",
    "type",
    "schema",
    "input",
    "fragment",
    "on",
    "enum",
    "interface",
    "implements",
  ],
  yaml: [],
  sh: [
    "sudo",
    "curl",
    "docker",
    "kubectl",
    "git",
    "npm",
    "pnpm",
    "echo",
    "export",
    "cd",
    "ls",
    "cat",
    "grep",
    "redis-cli",
    "psql",
    "openssl",
    "dig",
    "nslookup",
    "traceroute",
    "ping",
  ],
  http: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "HTTP/1.1", "HTTP/2"],
  python: [
    "def",
    "return",
    "if",
    "else",
    "elif",
    "for",
    "while",
    "import",
    "from",
    "class",
    "with",
    "as",
    "try",
    "except",
    "None",
    "True",
    "False",
    "and",
    "or",
    "not",
    "in",
    "lambda",
    "yield",
    "async",
    "await",
  ],
  go: [
    "func",
    "return",
    "if",
    "else",
    "for",
    "range",
    "package",
    "import",
    "type",
    "struct",
    "interface",
    "go",
    "chan",
    "select",
    "defer",
    "var",
    "const",
    "nil",
    "err",
  ],
};

const ALIAS: Record<string, string> = {
  javascript: "js",
  ts: "js",
  typescript: "js",
  jsx: "js",
  tsx: "js",
  json: "js",
  node: "js",
  bash: "sh",
  shell: "sh",
  zsh: "sh",
  console: "sh",
  terminal: "sh",
  dockerfile: "sh",
  docker: "sh",
  yml: "yaml",
  protobuf: "proto",
  py: "python",
  golang: "go",
  nginx: "yaml",
  ini: "yaml",
  toml: "yaml",
};

const LABEL: Record<string, string> = {
  js: "JavaScript",
  sh: "Shell",
  sql: "SQL",
  yaml: "YAML",
  http: "HTTP",
  proto: "Protobuf",
  graphql: "GraphQL",
  python: "Python",
  go: "Go",
};

function lineComment(lang: string) {
  if (lang === "sql") return /--.*$/;
  if (lang === "sh" || lang === "yaml" || lang === "python") return /(^|\s)#.*$/;
  return /\/\/.*$/;
}

function highlight(line: string, lang: string): ReactNode[] {
  const words = KEYWORDS[lang] ?? [];
  const kw = words.length ? `\\b(?:${words.map((w) => w.replace(/[/.]/g, "\\$&")).join("|")})\\b` : "(?!)";
  const comment = lineComment(lang).source.replace(/\$$/, "");
  const re = new RegExp(
    `(${comment}.*$)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`[^\`]*\`)|(\\b\\d[\\d_.,]*\\b)|(${kw})`,
    lang === "sql" ? "gi" : "g",
  );
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of line.matchAll(re)) {
    if (m.index! > last) out.push(line.slice(last, m.index));
    const cls = m[1]
      ? "italic text-ink-dim"
      : m[2]
        ? "text-emerald-300"
        : m[3]
          ? "text-amber-200"
          : "text-sky-strong font-semibold";
    out.push(
      <span key={k++} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index! + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** "js {2,4-6}" -> the language ("js") and the lines to highlight (2, 4, 5, 6). */
function parseInfo(info?: string): { lang?: string; marked: Set<number> } {
  const marked = new Set<number>();
  if (!info) return { marked };
  const m = info.match(/\{([\d,\s-]+)\}/);
  if (m) {
    for (const part of m[1].split(",")) {
      const [a, b] = part.trim().split("-").map((n) => parseInt(n, 10));
      if (Number.isNaN(a)) continue;
      for (let n = a; n <= (Number.isNaN(b) ? a : b); n++) marked.add(n);
    }
  }
  const lang = info.replace(/\{[^}]*\}/, "").trim().split(/\s+/)[0] || undefined;
  return { lang, marked };
}

/**
 * Add a line list after the language to highlight the lines being explained, for example
 * ```js {2,4-6}. Long listings start collapsed, and every block has a wrap-lines switch.
 */
export default function CodeBlock({ lang: info, code }: { lang?: string; code: string }) {
  const { lang, marked } = parseInfo(info);
  const key = lang ? (ALIAS[lang.toLowerCase()] ?? lang.toLowerCase()) : "text";
  const label = LABEL[key] ?? (lang ? lang.toUpperCase() : "Text");
  const lines = code.split("\n");

  return (
    <CodeFrame label={label} code={code} lineCount={lines.length}>
      {lines.map((l, i) => (
        <span
          key={i}
          className={`block min-h-[1.2em] ${marked.has(i + 1) ? "-mx-4 border-l-[3px] border-sky bg-sky-soft px-[calc(1rem-3px)]" : ""}`}
          {...(marked.has(i + 1) ? { "data-hl": "" } : {})}
        >
          {KEYWORDS[key] ? highlight(l, key) : l}
        </span>
      ))}
    </CodeFrame>
  );
}
