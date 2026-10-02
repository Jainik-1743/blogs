import Figure from "./Figure";

/** What `aws sts get-caller-identity` prints, and how to read the ARN so you know who you are. */

const parts = [
  { text: "arn", label: "it's an ARN", tone: "text-ink-dim" },
  { text: "aws", label: "partition", tone: "text-ink-dim" },
  { text: "iam", label: "service", tone: "text-sky" },
  { text: "", label: "region (IAM is global, so empty)", tone: "text-ink-dim" },
  { text: "123456789012", label: "your account ID", tone: "text-amber-300" },
  { text: "user/admin", label: "who you are", tone: "text-emerald-300" },
];

export default function CallerIdentityAnatomy() {
  return (
    <Figure caption="Read the last part of the ARN. user/… means you're the IAM user — correct. A bare :root means you're still signed in as the root user — stop and fix that first.">
      <pre className="m-0 mb-4 overflow-x-auto rounded-lg border border-line bg-bg-code px-3 py-2.5 text-[0.76rem] leading-relaxed">
        <code>{`$ aws sts get-caller-identity
{
    "UserId": "AIDA2EXAMPLEID",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/admin"
}`}</code>
      </pre>

      {/* The ARN split into its labelled pieces */}
      <div className="mb-4 flex flex-wrap items-stretch gap-1 font-mono text-[0.8rem]" role="list" aria-label="ARN parts">
        {parts.map((p, i) => (
          <div key={i} className="flex items-stretch gap-1" role="listitem">
            {i > 0 && <span className="self-start pt-1.5 text-ink-dim">:</span>}
            <div className="flex flex-col items-center">
              <span className={`min-w-6 rounded border border-line bg-bg-code px-2 py-1 text-center ${p.tone}`}>
                {p.text || " "}
              </span>
              <span className="mt-1 max-w-[7.5rem] text-center font-sans text-[0.66rem] leading-tight text-ink-dim">{p.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-3 py-2">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-emerald-300">✓ correct</div>
          <code className="text-[0.74rem] break-all">…:123456789012:user/admin</code>
        </div>
        <div className="rounded-lg border border-red-400/50 bg-red-400/10 px-3 py-2">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-red-300">✕ still root</div>
          <code className="text-[0.74rem] break-all">…:123456789012:root</code>
        </div>
      </div>
    </Figure>
  );
}
