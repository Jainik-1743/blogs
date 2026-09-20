import Figure from "./Figure";

/** Long-lived keys on disk vs an attached role with temporary credentials. */
const cols = [
  {
    title: "Wrong: keys on disk",
    tone: "border-red-400/50 bg-red-400/10",
    label: "text-red-300",
    head: ".env file on the server",
    lines: ["AWS_ACCESS_KEY_ID=AKIA…", "AWS_SECRET_ACCESS_KEY=…"],
    note: "never expires · works from anywhere",
  },
  {
    title: "Right: role attached",
    tone: "border-emerald-400/50 bg-emerald-400/10",
    label: "text-emerald-300",
    head: "IAM role on the instance",
    lines: ["temporary credentials", "rotated automatically"],
    note: "expires in hours · only from this instance",
  },
];

const box = "rounded-lg border border-line bg-bg-code px-3 py-2 text-center text-[0.85rem] text-ink-dim";

export default function KeysVsRole() {
  return (
    <Figure caption="Same access to S3 either way — but only one survives a server break-in. The permanent key never expires; the temporary key card expires on its own.">
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {cols.map((c) => (
          <div key={c.title} className="flex flex-col gap-2">
            <div className="text-center text-[0.95rem] font-semibold text-ink">{c.title}</div>
            <div className={box}>EC2 server</div>
            <div className="text-center text-ink-dim" aria-hidden="true">↓</div>
            <div className={`rounded-lg border px-3 py-3 text-center ${c.tone}`}>
              <div className="text-[0.9rem] font-semibold text-ink">{c.head}</div>
              {c.lines.map((l) => (
                <div key={l} className={`mt-1 font-mono text-[0.78rem] ${c.label}`}>{l}</div>
              ))}
              <div className="mt-1 text-[0.75rem] text-ink-dim">{c.note}</div>
            </div>
            <div className="text-center text-ink-dim" aria-hidden="true">↓</div>
            <div className={box}>S3 bucket</div>
          </div>
        ))}
      </div>
    </Figure>
  );
}
