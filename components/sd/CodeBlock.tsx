import type { ReactNode } from "react";
import CopyButton from "@/components/CopyButton";

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

export default function CodeBlock({ lang, code }: { lang?: string; code: string }) {
  const key = lang ? (ALIAS[lang.toLowerCase()] ?? lang.toLowerCase()) : "text";
  const label = LABEL[key] ?? (lang ? lang.toUpperCase() : "Text");
  const lines = code.split("\n");

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-line bg-bg-code">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-bg-elev px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-dim">
          <span className="flex gap-1" aria-hidden="true">
            <i className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
            <i className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
          </span>
          {label}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="my-0 rounded-none border-0 bg-transparent px-4 py-3">
        <code>
          {lines.map((l, i) => (
            <span key={i} className="block min-h-[1.2em]">
              {KEYWORDS[key] ? highlight(l, key) : l}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
