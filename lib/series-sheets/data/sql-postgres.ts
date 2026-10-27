import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "sql-postgres" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "Everyday PostgreSQL, from `SELECT` and joins to window functions, schema design, indexes, transactions and safe migrations. SQL says **what** you want, the planner picks **how**. `NULL` means unknown.",
  sections: [
    {
      title: "psql and data types",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Type", "Use"],
          rows: [
            ["`integer` / `bigint`", "Whole numbers (2.1 billion / 9 quintillion)"],
            ["`numeric(8,2)`", "Exact decimals: money"],
            ["`text`, `boolean`", "Text of any length, true/false/NULL"],
            ["`timestamptz`", "One exact moment. Prefer it to `timestamp`"],
          ],
        },
      ],
    },
    {
      title: "SELECT, NULL and paging",
      lesson: 0,
      blocks: [
        {
          kind: "code",
          lang: "sql",
          code:
            "SELECT name, price FROM products\nWHERE category = 'bags' AND stock > 0\nORDER BY price DESC LIMIT 2 OFFSET 2;\n\n-- keyset paging: fast at any depth\nWHERE id > :last_id ORDER BY id LIMIT 20;",
          note: "No ORDER BY means no promised order. Text uses single quotes.",
        },
        {
          kind: "table",
          head: ["Trap", "Why", "Fix"],
          rows: [
            ["`city = NULL`", "Unknown, never true", "`IS NULL`"],
            ["`city <> 'Pune'`", "Drops NULL rows", "`OR city IS NULL`"],
            ["`NOT IN (…, NULL)`", "Returns no rows", "`NOT EXISTS`"],
            ["`BETWEEN` on times", "Misses the last day", "`>= a AND < b`"],
          ],
        },
        {
          kind: "points",
          items: [
            "`false AND NULL` is false, `true OR NULL` is true, the rest stay unknown. `WHERE` keeps only true.",
            "`coalesce(a, b)` first non-NULL. `float8` is approximate: `0.1+0.2` gives `0.30000000000000004`.",
          ],
        },
      ],
    },
    {
      title: "Changing data",
      lesson: 0,
      blocks: [
        {
          kind: "code",
          lang: "sql",
          code:
            "INSERT INTO customers (name, email)\n  VALUES ('Gus', 'g@x.com') RETURNING id;\nUPDATE products SET stock = stock - 1\n  WHERE name = 'Pen' RETURNING stock;\nINSERT ... ON CONFLICT (email) DO NOTHING;",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`UPDATE` or `DELETE` with no `WHERE` hits every row. Run the same `WHERE` as a `SELECT` first. Failed inserts still use identity numbers, so ids have gaps.",
        },
      ],
    },
    {
      title: "Joins",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Join", "Keeps"],
          rows: [
            ["`INNER JOIN`", "Only matching rows"],
            ["`LEFT JOIN`", "All left rows, NULL on the right if no match"],
            ["`CROSS JOIN`", "Every pair. A forgotten `ON` does this"],
          ],
        },
        {
          kind: "code",
          lang: "sql",
          code:
            "-- customers with no orders\nSELECT c.name FROM customers c\nWHERE NOT EXISTS (SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id);\n-- self join: referrer name\nFROM customers c\nLEFT JOIN customers r\n  ON r.id = c.referred_by",
        },
        {
          kind: "points",
          items: [
            "A join gives one row per matching pair. A one-to-many join **repeats the one side**, so summing it double counts.",
            "`LEFT JOIN` then `WHERE` on a right column turns it into an inner join. Put right-table filters in `ON`.",
          ],
        },
      ],
    },
    {
      title: "Aggregates and GROUP BY",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "`count(*)` rows. `count(col)` non-NULL. `count(DISTINCT col)` different values. Other aggregates ignore NULL.",
            "After a `LEFT JOIN`, count a right-table column: `count(o.id)`, not `count(*)`.",
            "`WHERE` filters rows, `HAVING` filters groups. Every selected column is grouped or aggregated.",
          ],
        },
        {
          kind: "code",
          lang: "sql",
          code:
            "SELECT customer_id, count(*) AS orders,\n  count(*) FILTER (WHERE status='paid')\n    AS paid\nFROM orders GROUP BY customer_id\nHAVING count(*) >= 2;\n-- monthly report\nGROUP BY date_trunc('month', ordered_at)",
          note: "`ROLLUP (a, b)` adds subtotals. `generate_series` plus LEFT JOIN fills empty months.",
        },
        {
          kind: "steps",
          items: [
            "FROM / JOIN, then WHERE, then GROUP BY and aggregates.",
            "HAVING, then SELECT (aliases born here), then DISTINCT.",
            "ORDER BY, then LIMIT.",
          ],
        },
      ],
    },
    {
      title: "Subqueries and CTEs",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "Scalar subquery: one row, one column. Two rows is an error, no row is NULL.",
            "`IN` and `EXISTS` plan the same. Use `NOT EXISTS`, never `NOT IN`, with nullable data.",
            "CTE used once is inlined (PostgreSQL 12+). Used twice it is computed once. Force with `MATERIALIZED` or `NOT MATERIALIZED`.",
          ],
        },
        {
          kind: "code",
          lang: "sql",
          code:
            "WITH RECURSIVE tree AS (\n  SELECT id, name, 0 AS depth\n  FROM categories WHERE parent_id IS NULL\n  UNION ALL\n  SELECT c.id, c.name, t.depth + 1\n  FROM categories c\n  JOIN tree t ON c.parent_id = t.id\n) SELECT * FROM tree;",
          note: "Cycles loop forever: add `CYCLE id SET is_cycle USING path` (14+) or a depth limit.",
        },
      ],
    },
    {
      title: "Window functions",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Function", "On ties"],
          rows: [
            ["`row_number()`", "Unique 1,2,3,4,5. Add a tie-breaker"],
            ["`rank()`", "Same rank then a gap: 1,2,2,2,5"],
            ["`dense_rank()`", "Same rank, no gap: 1,2,2,2,3"],
          ],
        },
        {
          kind: "code",
          lang: "sql",
          code:
            "SELECT * FROM (\n  SELECT customer_id, total,\n    row_number() OVER (\n      PARTITION BY customer_id\n      ORDER BY total DESC) AS rn\n  FROM ot) x WHERE rn <= 3;\n-- running total, explicit frame\nsum(total) OVER (ORDER BY id ROWS BETWEEN\n  UNBOUNDED PRECEDING AND CURRENT ROW)",
        },
        {
          kind: "points",
          items: [
            "Windows keep every row. They are not allowed in `WHERE`: wrap in a subquery.",
            "`lag(x)` / `lead(x)` read neighbours. Default frame includes ties, so `last_value` returns the current row.",
          ],
        },
      ],
    },
    {
      title: "Schema design",
      lesson: 4,
      blocks: [
        {
          kind: "points",
          items: [
            "**1NF** one value per cell. **2NF** every column depends on the whole key. **3NF** on the key and nothing else.",
            "Constraints: `NOT NULL`, `UNIQUE`, `CHECK`, `PRIMARY KEY`, `FOREIGN KEY`. A `CHECK` passes on NULL, so add `NOT NULL`.",
            "Many-to-many needs a junction table with a composite key. Index the other direction.",
          ],
        },
        {
          kind: "table",
          head: ["ON DELETE", "Effect"],
          rows: [
            ["`NO ACTION` / `RESTRICT`", "Delete refused (default)"],
            ["`CASCADE`", "Children deleted. Only for parts of the parent"],
            ["`SET NULL`", "Child column becomes NULL"],
          ],
        },
      ],
    },
    {
      title: "Keys, money, time, soft delete",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Key", "Size", "Note"],
          rows: [
            ["`integer` identity", "4 bytes", "Runs out at 2.1 billion"],
            ["`bigint` identity", "8 bytes", "**Default choice**"],
            ["`uuid`", "16 bytes", "Unguessable, made anywhere, scatters the index"],
          ],
        },
        {
          kind: "points",
          items: [
            "Use `GENERATED ALWAYS AS IDENTITY`, not `serial`: it refuses manual ids.",
            "Money: `numeric(p,s)` or integer cents (`price_cents`). `1999/100` is `19`: use `/ 100.0`.",
            "`timestamptz` stores one moment (UTC) and shows it in the session zone. Pick one zone for reports.",
            "Soft delete: partial unique index `ON (lower(email)) WHERE deleted_at IS NULL`, plus a view. Every query needs the filter.",
          ],
        },
      ],
    },
    {
      title: "Reading EXPLAIN",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          lang: "sql",
          code:
            "EXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders_big\nWHERE customer_id = 777;",
          note: "ANALYZE runs the statement: wrap writes in a transaction and roll back.",
        },
        {
          kind: "table",
          head: ["Look at", "Meaning"],
          rows: [
            ["`cost=a..b`", "Startup and total, in arbitrary units"],
            ["`rows=` vs actual", "10x apart means stale statistics"],
            ["`Rows Removed by Filter`", "Millions: an index would help"],
            ["`Heap Fetches: 0`", "Index only scan never touched the table"],
          ],
        },
        {
          kind: "table",
          head: ["Scan", "Wins when"],
          rows: [
            ["Seq Scan", "Most of the table, or a tiny table"],
            ["Index Scan", "Few rows, or rows already in order"],
            ["Bitmap Heap Scan", "Middle share spread over many pages"],
            ["Index Only Scan", "All columns in the index, after `VACUUM`"],
          ],
        },
      ],
    },
    {
      title: "Index design",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          lang: "sql",
          code:
            "-- equality columns first, then range\nCREATE INDEX ON orders\n  (customer_id, status);\n-- partial: only the rows you query\nCREATE INDEX ON orders (ordered_at)\n  WHERE status = 'new';\n-- covering\nCREATE INDEX ON orders (customer_id)\n  INCLUDE (amount_cents);",
        },
        {
          kind: "points",
          items: [
            "Index `(a, b)` serves `a` and `a AND b`, not `b` alone. It makes `(a)` redundant.",
            "Not used when: you need most rows, `WHERE id::text = ..` or `col + 0` (function on the column), `LIKE '%x'`, table tiny, stale stats.",
            "Every write pays: 4 extra indexes made a load 11 times slower. Check `idx_scan = 0` in `pg_stat_user_indexes`.",
          ],
        },
      ],
    },
    {
      title: "Transactions and isolation",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "`BEGIN` / `COMMIT` / `ROLLBACK`: all or nothing. After an error the transaction is aborted until `ROLLBACK`. `SAVEPOINT` undoes part.",
            "**Lost update**: read, compute in the app, write. Fix: atomic `SET stock = stock - 4 WHERE stock >= 4`, or `SELECT ... FOR UPDATE`.",
            "**Write skew** (two doctors go off call) passes Repeatable Read. Serializable cancels one.",
          ],
        },
        {
          kind: "table",
          head: ["Level", "Snapshot", "Still allows"],
          rows: [
            ["Read Committed (default)", "Each statement", "Non-repeatable reads, lost updates"],
            ["Repeatable Read", "First statement", "Write skew; may fail `40001`"],
            ["Serializable", "Plus conflict tracking", "Nothing, but you must retry"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Retry the **whole transaction** on `40001` (serialization) or `40P01` (deadlock). Limit tries, add jitter, no emails inside.",
        },
      ],
    },
    {
      title: "Locks, queues, idempotency",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "`ACCESS EXCLUSIVE` (most `ALTER TABLE`) blocks even reads, and requests queue: one waiting `ALTER` froze a plain `SELECT` for 2.2 s. Use `lock_timeout`.",
            "**Deadlock** = opposite lock order. Lock the lower id first, keep transactions short. Detected after 1 s.",
            "Long or `idle in transaction` sessions block vacuum and bloat tables. Set `idle_in_transaction_session_timeout`.",
          ],
        },
        {
          kind: "code",
          lang: "sql",
          code:
            "-- job queue: workers never block\nSELECT id FROM jobs\nWHERE status = 'queued' ORDER BY id\nLIMIT 1 FOR UPDATE SKIP LOCKED;\n-- idempotency key in the same transaction\nINSERT INTO payments (idem_key, ...)\nON CONFLICT (idem_key) DO NOTHING;",
          note: "`NOWAIT` errors at once instead of waiting.",
        },
      ],
    },
    {
      title: "JSONB, search, arrays, upsert",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Operator", "Meaning"],
          rows: [
            ["`->`  /  `->>`", "JSON value / text (cast it)"],
            ["`@>`", "Contains: `attrs @> '{\"brand\":\"Acme\"}'`"],
            ["`?`", "Has key or string element"],
            ["`@@`", "Full-text match: `search @@ websearch_to_tsquery(..)`"],
          ],
        },
        {
          kind: "points",
          items: [
            "GIN index on `jsonb` took a query from 173 ms to 16.7 ms. It serves `@>` and `?`, not `->>`. Planner has no stats per key.",
            "Fields you filter, join or constrain belong in real columns. Arrays: `@>` and `&&` use GIN, `= ANY(tags)` does not.",
          ],
        },
        {
          kind: "code",
          lang: "sql",
          code:
            "INSERT INTO stock_levels (product_id, qty)\nVALUES (1, 5)\nON CONFLICT (product_id) DO UPDATE\n  SET qty = stock_levels.qty\n          + EXCLUDED.qty\nRETURNING *;",
        },
      ],
    },
    {
      title: "Safe migrations",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Change", "Cost on 2M rows"],
          rows: [
            ["Add nullable column", "2 ms (catalog only)"],
            ["Add column, constant default", "2.5 ms (PostgreSQL 11+)"],
            ["Add column, volatile default", "3.8 s rewrite under `ACCESS EXCLUSIVE`"],
            ["`SET NOT NULL` directly", "354 ms scan, blocks all"],
            ["`CREATE INDEX` plain / `CONCURRENTLY`", "Blocks writes / does not"],
          ],
        },
        {
          kind: "steps",
          items: [
            "Start with `SET lock_timeout = '500ms'` and retry on failure.",
            "`NOT NULL`: `ADD CONSTRAINT ... CHECK (x IS NOT NULL) NOT VALID`, `VALIDATE`, then `SET NOT NULL`.",
            "Backfill in batches of about 100,000 rows, one transaction each.",
            "`CREATE INDEX CONCURRENTLY` (not in a transaction). A failure leaves an INVALID index.",
            "Rename or retype by **expand and contract**: add, sync, backfill, switch code, drop.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Test on production-sized data and read `pg_locks`. A 1,000-row dev table hides every problem here.",
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["`= NULL` vs `IS NULL`?", "NULL is unknown, so `= NULL` is never true."],
            ["`WHERE` vs `HAVING`?", "Rows before grouping vs groups after."],
            ["`IN` vs `EXISTS`?", "Same for positive checks. `NOT EXISTS` is NULL-safe."],
            ["`rank` vs `dense_rank`?", "`rank` leaves gaps after ties."],
            ["Why is my index unused?", "Most rows, function on column, wrong column order, stale stats."],
          ],
        },
      ],
    },
  ],
};
