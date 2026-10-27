import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "ai-engineering" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "What a full-stack developer needs to ship an LLM feature safely: the OWASP risks, prompt injection, evals, cost and speed, and logging with guardrails. Treat the model as an **untrusted user** and enforce rules in **code**.",
  sections: [
    {
      title: "The big idea",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "An LLM app is a normal web app plus a part that **reads text from anyone and can be talked into almost anything**.",
            "Model **input and output** both cross a trust boundary. Validate, encode and authorize on both sides.",
            "A prompt is **not** a security control. Rules live in code, auth systems and downstream APIs.",
            "Most fixes are old engineering: least privilege, validation, rate limits, logging.",
          ],
        },
      ],
    },
    {
      title: "OWASP LLM Top 10 (2025)",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["ID", "Risk", "In a phrase"],
          mono: [0],
          rows: [
            ["LLM01", "Prompt Injection", "Text changes what the model does"],
            ["LLM02", "Sensitive Info Disclosure", "Private data comes out"],
            ["LLM03", "Supply Chain", "Bad model, data or package comes in"],
            ["LLM04", "Data and Model Poisoning", "Training or embedding data is tampered with"],
            ["LLM05", "Improper Output Handling", "Output is used unsafely downstream"],
            ["LLM06", "Excessive Agency", "The model can do too much"],
            ["LLM07", "System Prompt Leakage", "Hidden instructions get read"],
            ["LLM08", "Vector and Embedding Weaknesses", "RAG store leaks or is poisoned"],
            ["LLM09", "Misinformation", "Confident wrong answers"],
            ["LLM10", "Unbounded Consumption", "Runaway cost, load or copying"],
          ],
        },
      ],
    },
    {
      title: "The fix for each risk",
      lesson: 0,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Output (05)", "Encode, parameterize, validate. Never `innerHTML` model text"],
            ["Agency (06)", "Few tools, the user's own permissions, approval for risky steps"],
            ["Consumption (10)", "Input and output caps, per-user budget, timeout, step limit"],
            ["Vectors (08)", "Filter by tenant and permission **inside the query**"],
            ["Leakage (07)", "Nothing secret in the system prompt"],
            ["Disclosure (02)", "Best: do not send the data. Regex redaction is one layer"],
            ["Supply chain (03/04)", "Pin and check models, adapters, datasets, packages"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "First three controls on a new feature: tool allow-list, output validation and encoding, per-user budgets plus logging.",
        },
      ],
    },
    {
      title: "Prompt injection",
      lesson: 1,
      blocks: [
        {
          kind: "points",
          items: [
            "Instructions and data share **one text channel**, so the model cannot reliably tell them apart.",
            "**Direct:** the user types the attack. **Indirect:** it hides in an email, page or file the model reads. Indirect is the serious case: the attacker borrows the victim's permissions.",
            "A better system prompt lowers risk but never fixes it. Filters and detector prompts are extra layers only.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Lethal trifecta: private data + untrusted content + a way to send data out. Cut at least one leg.",
        },
      ],
    },
    {
      title: "Safe agent defences",
      lesson: 1,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Least-privilege tools**: read-only where possible, the user's own rights.",
            "**Allow-list** tools per task (not a block-list).",
            "**Validate** tool arguments and model output with schemas.",
            "**Human approval** for risky or irreversible actions.",
            "**Separate** trusted and untrusted content; track tainted data.",
            "**Sandbox** any model-written code.",
            "**Log** every decision the policy layer makes.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "A policy layer limits actions, not words. Wrong or manipulated text still needs output checks, citations and evals.",
        },
      ],
    },
    {
      title: "Evals: a test suite for fuzzy output",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Method", "Good for", "Weakness"],
          rows: [
            ["Exact match", "Label, number, ID", "Breaks on harmless rewording"],
            ["Regex / must-not-contain", "Required phrases, leaks", "Misses meaning"],
            ["Schema check", "Structured output, tool calls", "Says nothing on quality"],
            ["Code oracle", "Run the SQL, compile the code", "Needs a checker per task"],
            ["LLM judge", "Tone, faithfulness", "Cost, noise, bias"],
          ],
        },
        {
          kind: "points",
          items: [
            "Cheap code checks first; a judge only where code cannot score. Calibrate it with human labels.",
            "Golden set: versioned, grown from production failures, with hard cases and refusals.",
            "Gate in CI: exit non-zero, print failures, keep the baseline in the repo.",
          ],
        },
      ],
    },
    {
      title: "Judges and small test sets",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Judge bias", "Mitigation"],
          rows: [
            ["Position: favours the first answer", "Judge both orders; count a win only if both agree"],
            ["Verbosity: longer scores higher", "Put length in the rubric; compare at similar length"],
            ["Self-preference: likes its own style", "Use a different model family, or code checks"],
          ],
        },
        {
          kind: "points",
          items: [
            "17 of 20 passes is not a true 85%. Report a **Wilson interval**; it shrinks with the square root of the cases.",
            "Overlapping intervals mean no claim. Read the **paired flips** (which cases changed).",
            "Above temperature 0, run each case several times. Pick the main metric before the run.",
          ],
        },
      ],
    },
    {
      title: "Tokens, cost and speed",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "Cost and delay follow **tokens**. Output is usually the slower, pricier side.",
            "**Time to first token** (feel) differs from **total time**. Streaming helps the first, not the second.",
            "Order of savings: shorter prompt, **retrieve** instead of stuffing, trim history, cap output, then caches.",
            "Prices and tokenizers differ by provider. Read their current docs; never quote from memory.",
          ],
        },
        {
          kind: "code",
          lang: "text",
          code: "GOOD  [rules][tools] | [question]\nBAD   [14:03:22][rules][tools] | [q]",
          note: "Prefix cache matches the start, token by token. Stable first, changing last.",
        },
      ],
    },
    {
      title: "Response cache, routing, retries",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Cache risk", "Defence"],
          rows: [
            ["Stale answer", "Short TTL; prompt and content version in the key"],
            ["Wrong-user answer", "User or tenant id in the key, or do not cache"],
            ["Near but not same", "High threshold; semantic cache for low-risk FAQ only"],
            ["Poisoning, private text", "Cache only validated answers; redact; per tenant"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Normalise** the key (case, filler words): in the lesson's demo, 24 model calls fell to 8.",
            "**Route** cheap first, escalate when unsure, and measure quality per route.",
            "Retry only temporary errors (timeout, overload, rate limit), with **backoff and jitter**, a max attempts, a per-attempt timeout shorter than the total deadline.",
          ],
        },
      ],
    },
    {
      title: "Log and guard every request",
      lesson: 4,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["request / user id", "Link logs, traces, support tickets"],
            ["prompt version", "Which prompt produced which result"],
            ["model + settings", "Compare after a model change"],
            ["token counts", "Cost and size"],
            ["latency per step", "Find the slow span"],
            ["attempts, outcome", "ok / fallback / blocked / failed"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Log facts, not private content. Redaction is a layer, not a promise.",
        },
      ],
    },
    {
      title: "Guardrail layers",
      lesson: 4,
      blocks: [
        {
          kind: "steps",
          items: [
            "Input limits and rate limits; redact private data.",
            "Versioned prompts, rolled out gradually and testable by evals.",
            "Timeouts; validate output shape, retry a few times, then fall back.",
            "Content checks as extra layers, never guarantees.",
            "Least-privilege tools; safe **fallback** answer or a human.",
            "**Circuit breaker**: after repeated failures, stop calling and fail fast.",
            "**Kill switch**: flip a setting to turn the feature off in seconds.",
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Fix prompt injection with a prompt?", "No. Limit what a tricked model can do, in code."],
            ["Why is the system prompt not a secret?", "It can be extracted. Keep secrets and rules out of it."],
            ["What is denial of wallet?", "Abuse that runs up your bill. Caps, budgets, timeouts."],
            ["Model returns bad JSON?", "Validate, retry a few times, fall back, log, add to evals."],
            ["Scores up, users unhappy?", "Golden set drifted from traffic, overfit prompt, or biased judge."],
            ["Costs doubled, traffic did not?", "Check tokens per request, cache hit rate, escalation rate."],
            ["Incident with harmful output?", "Stop the harm first, then investigate, then add an eval."],
          ],
        },
      ],
    },
  ],
};
