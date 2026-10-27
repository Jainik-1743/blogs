import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "observability" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "Logs, metrics, traces, SLOs, alerts, incidents and resilience patterns for a Node.js service, with the numbers interviewers expect. Metrics say **that** something is wrong, traces say **where**, logs say **what**.",
  sections: [
    {
      title: "Monitoring vs observability",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "**Monitoring** answers questions you prepared. **Observability** answers new questions from data the system already emits.",
            "Order in an incident: **metric** (how bad), **trace** (which hop), **log** (which exact case). Link them with ids.",
            "Averages hide the tail: use percentiles. Alert on **symptoms**, diagnose with causes.",
            "Observability costs CPU, money, attention and privacy. Sample the boring data, keep errors.",
          ],
        },
        {
          kind: "table",
          head: ["Method", "Applies to", "Measures"],
          rows: [
            ["Golden signals", "A user-facing service", "Latency, traffic, errors, saturation"],
            ["RED", "A service or endpoint", "Rate, errors, duration"],
            ["USE", "A resource (CPU, pool)", "Utilisation, saturation, errors"],
          ],
        },
      ],
    },
    {
      title: "Structured logging (pino)",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Level", "Use for"],
          rows: [
            ["`fatal`", "Process cannot continue and will exit"],
            ["`error`", "An operation failed; a person may need to act"],
            ["`warn`", "Unexpected, but the request still worked"],
            ["`info`", "Normal business or lifecycle event"],
            ["`debug` / `trace`", "Bug-fixing detail / very fine detail"],
          ],
        },
        {
          kind: "points",
          items: [
            "JSON lines with a **fixed message** and variable facts in fields.",
            "Log errors under the `err` key. `{ e }` printed as `{}` in the test.",
            "Log each failure **once**, where you handle it. Never log secrets. Add `redact` as a safety net.",
            "Cost was about 6 microseconds per line, near zero when the level is off.",
          ],
        },
      ],
    },
    {
      title: "Correlation ids and log sampling",
      lesson: 1,
      blocks: [
        {
          kind: "steps",
          items: [
            "Reuse the incoming request id or make one at the edge.",
            "Put it on a child logger so every line carries it.",
            "Send it on every outgoing call and inside queue messages.",
            "Search the id across services to read the full story.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Sample the boring lines, keep all errors, take totals from metrics. JSON escapes line breaks, so users cannot fake log lines.",
        },
      ],
    },
    {
      title: "Metric types and PromQL",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Type", "Behaviour", "Query it with"],
          rows: [
            ["Counter", "Only goes up; resets on restart", "`rate()`, `increase()`"],
            ["Gauge", "Goes up and down", "Raw value"],
            ["Histogram", "Counts values into buckets", "`histogram_quantile()`"],
          ],
        },
        {
          kind: "code",
          lang: "promql",
          code: "# traffic\nsum(rate(http_requests_total[5m]))\n# error ratio\nsum(rate(http_requests_total\n  {status=~\"5..\"}[5m]))\n / sum(rate(http_requests_total[5m]))\n# p99, all instances\nhistogram_quantile(0.99,\n sum by (le) (rate(\n  http_request_duration_seconds_bucket\n  [5m])))",
        },
      ],
    },
    {
      title: "Percentiles and cardinality",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "Real run: average latency 81 ms, p99 about 820 ms.",
            "Histogram percentiles are **estimates**. Coarse buckets showed p95 0.10 s when the truth was 0.60 s.",
            "**Never average percentiles.** Sum the buckets across servers, then take the quantile.",
            "Every label combination is a series. A `user_id` label turned 2 series into 10,000 (521 KB `/metrics`).",
            "Safe labels: method, **route template** (`/users/:id`), status class, region, version.",
            "Names: base units and `_total`. Initialise key counters. Prometheus gives `up` for free; check config with `promtool`.",
          ],
        },
      ],
    },
    {
      title: "Distributed tracing (OpenTelemetry)",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "A **trace** is a tree of spans with one trace id. A span has name, timing, attributes, events, status.",
            "Always call `span.end()`. Name spans by operation. Keep secrets out of attributes.",
            "API in libraries, SDK in apps. Start the SDK **before** the code it instruments. Set `OTEL_SERVICE_NAME`.",
            "Put `trace_id` and `span_id` in log lines. Queues: inject context into the message, extract in the worker.",
          ],
        },
        {
          kind: "code",
          lang: "text",
          code: "traceparent:\n 00-<trace-id>-<parent-span>-01\n ver  32 hex    16 hex      flags",
          note: "If any hop drops this header, the trace splits in two.",
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Parent-based head sampling kept 10% of traces and never half a trace. Tail sampling keeps the interesting ones but needs a collector.",
        },
      ],
    },
    {
      title: "SLI, SLO, SLA and the nines",
      lesson: 4,
      blocks: [
        {
          kind: "points",
          items: [
            "**SLI** = good events / valid events, from the user's side. **SLO** = SLI + target + window. **SLA** = contract, looser than the SLO.",
            "Latency SLI = share of requests under a threshold. The histogram needs a bucket at that threshold.",
            "Never 100%. Rolling windows are harder to game. Dependencies in series multiply.",
          ],
        },
        {
          kind: "table",
          head: ["SLO", "Budget", "Minutes per 30 days"],
          rows: [
            ["99%", "1%", "432"],
            ["99.9%", "0.1%", "43.2"],
            ["99.95%", "0.05%", "21.6"],
            ["99.99%", "0.01%", "4.3"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Three dependencies at 99.9% in series give 99.7%. Dashboard green but users unhappy: the SLI is wrong.",
        },
      ],
    },
    {
      title: "Error budget and burn rate",
      lesson: 4,
      blocks: [
        {
          kind: "code",
          lang: "text",
          code: "budget    = 1 - SLO\nburn rate = error ratio / budget\nthreshold = fraction x\n  window_hours / alert_hours",
          note: "SLO 99.9%: 1.44% failing is burn 14.4, budget gone in 2.1 days.",
        },
        {
          kind: "table",
          head: ["Error ratio", "Burn rate", "Budget gone in"],
          rows: [
            ["0.10%", "1.0", "30.0 days"],
            ["0.50%", "5.0", "6.0 days"],
            ["1.44%", "14.4", "2.1 days"],
            ["5.00%", "50.0", "0.6 days"],
          ],
        },
        {
          kind: "points",
          items: [
            "The budget is meant to be **spent on change**. Agree a freeze policy with the product owner while it is calm.",
            "Low traffic makes budgets jumpy. Count budget in requests.",
          ],
        },
      ],
    },
    {
      title: "Good alerts",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "A page must be **urgent, actionable and about user pain**. Otherwise: ticket, dashboard or nothing.",
            "Every page links a runbook. Fight fatigue: count the actionable share of pages.",
            "Never alert on average latency. Beware low traffic, long `for:`, and missing data. Add a dead man's switch.",
          ],
        },
        {
          kind: "table",
          head: ["Alert", "Long window", "Burn", "Action"],
          rows: [
            ["Fast burn", "2% in 1 h (short 5m)", "14.4", "Page"],
            ["Slow burn", "5% in 6 h", "6", "Page"],
            ["Trend", "10% in 3 days", "1", "Ticket"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Join two windows with `and`: long means big enough, short means still happening, so the alert clears on recovery. Test with `promtool test rules`.",
        },
      ],
    },
    {
      title: "Alertmanager and dashboards",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Setting", "Default", "Meaning"],
          rows: [
            ["`group_wait`", "30s", "Collect more alerts before the first message"],
            ["`group_interval`", "5m", "Wait before news about a group"],
            ["`repeat_interval`", "4h", "Resend if nothing changed"],
          ],
        },
        {
          kind: "points",
          items: [
            "Alertmanager **groups**, **routes**, **inhibits** (a big alert hides its children) and **silences**.",
            "One dashboard, one question. Overview: traffic, errors, percentiles, saturation, deploy markers. Keep it in version control.",
          ],
        },
      ],
    },
    {
      title: "Incident response",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Level", "Meaning", "Response"],
          rows: [
            ["SEV-1", "Critical, many customers hurt", "Full response, IC, exec notice"],
            ["SEV-2", "Major, partial impact", "Coordinated team"],
            ["SEV-3", "Minor, workaround exists", "Owning team"],
          ],
        },
        {
          kind: "points",
          items: [
            "Roles: **IC** (coordinates, rarely fixes), deputy, scribe, experts, liaison. One channel, regular updates.",
            "**Mitigate first**, understand later. Small reversible changes, one at a time, confirm with the SLI.",
            "Unsure about severity? Treat it as the higher one.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Mean time to recover (MTTR) hides uneven incidents. Track detect, ack, mitigate, resolve, and budget used per incident.",
        },
      ],
    },
    {
      title: "Blameless post-mortems",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "Ask what in the system made the mistake easy. Blameless is not unaccountable.",
            "List **contributing factors**, not one root cause.",
            "Timeline, impact in budget terms, what went well, what was lucky.",
            "A good action item is small, has an owner and a date, and is tracked.",
            "On-call: primary and secondary, real rotation size, handoffs, rest, improve one thing per shift.",
          ],
        },
      ],
    },
    {
      title: "Timeouts, retries, breakers",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "A **slow** dependency is worse than a dead one. Timeout on every call, a bit above healthy p99. Share one **deadline**.",
            "Retry only passing failures on **idempotent** calls (or with an idempotency key), inside a deadline, with a retry budget.",
            "Layers multiply: 3 x 3 x 3 = 27 calls. Retry in one layer only.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "delay = random() *\n  min(cap, base * 2 ** attempt)",
          note: "Full jitter: 1000 retries, busiest 10 ms slice 35 instead of 200.",
        },
        {
          kind: "table",
          head: ["Breaker state", "Behaviour"],
          rows: [
            ["Closed", "Calls pass; failures counted"],
            ["Open", "Fail fast, no calls"],
            ["Half-open", "Trial call after a wait; success closes it"],
          ],
        },
      ],
    },
    {
      title: "Bulkheads, shedding, degradation",
      lesson: 7,
      blocks: [
        {
          kind: "points",
          items: [
            "Breaker: one per dependency, % over a window plus a minimum volume. Count timeouts and 5xx, not 4xx. Export its state.",
            "**Bulkhead:** a separate limit per dependency, so a slow optional one cannot starve a critical one.",
            "**Load shedding:** refuse early (503/429, `Retry-After`). An unlimited queue just turns overload into delay.",
            "**Degradation:** plan B decided in advance, marked degraded, counted. Stale price to browse, never to charge.",
            "Test with fault injection: hangs, slowness, flapping, partial failure.",
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 8,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Three pillars?", "Metrics say that, traces say where, logs say what."],
            ["Why not average latency?", "1% at 10 s: average 236 ms, p99 8.7 s."],
            ["Cardinality?", "Labels multiply series. No user ids."],
            ["SLI vs SLO vs SLA?", "Measure, target, contract."],
            ["99.9% in minutes?", "43.2 per 30 days. 99.99% is 4.3."],
            ["Burn rate?", "Error ratio / budget ratio. 14.4 for 1 h = 2%."],
            ["Good alert?", "Urgent, actionable, user pain, runbook."],
            ["First 10 minutes?", "Severity, roles, channel, mitigate, update."],
            ["Retries safe?", "Idempotent only, backoff + jitter + budget."],
            ["Mitigate or fix?", "Mitigate first (roll back), fix later."],
          ],
        },
      ],
    },
  ],
};
