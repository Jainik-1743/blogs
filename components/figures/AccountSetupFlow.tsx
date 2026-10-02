import Figure from "./Figure";

/**
 * Today's whole setup as one picture: root user locked away, an IAM admin for daily work,
 * an access key that lives only on your laptop, and the CLI that uses it. The red branch is
 * the one mistake that costs real money.
 */

const step = "rounded-lg border px-3 py-2.5";

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1 pl-5 text-ink-dim" aria-hidden="true">
      <span>↓</span>
      <span className="font-mono text-[0.68rem]">{label}</span>
    </div>
  );
}

export default function AccountSetupFlow() {
  return (
    <Figure caption="Steps 1–6 in one picture. Root signs in once to create your admin user, then stays locked. Every command you type from now on runs as the IAM user, through a key that never leaves your laptop.">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ol className="m-0 list-none p-0" aria-label="Account setup chain">
          <li className="m-0">
            <div className={`${step} border-red-400/50 bg-red-400/10`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[0.9rem] font-semibold text-ink">Root user</span>
                <span className="font-mono text-[0.66rem] text-red-300">steps 1–2</span>
              </div>
              <div className="text-[0.78rem] text-ink-dim">Your sign-up email. Can do anything, including close the account.</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5 font-mono text-[0.66rem]">
                <span className="rounded border border-emerald-400/40 px-1.5 text-emerald-300">MFA on</span>
                <span className="rounded border border-line px-1.5 text-ink-dim">used once, then locked away</span>
              </div>
            </div>
          </li>
          <li className="m-0">
            <Arrow label="creates" />
            <div className={`${step} border-sky/50 bg-sky-soft`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[0.9rem] font-semibold text-ink">IAM user “admin”</span>
                <span className="font-mono text-[0.66rem] text-sky">step 3</span>
              </div>
              <div className="text-[0.78rem] text-ink-dim">AdministratorAccess policy. The identity you use every day.</div>
            </div>
          </li>
          <li className="m-0">
            <Arrow label="generates" />
            <div className={`${step} border-amber-400/50 bg-amber-400/10`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[0.9rem] font-semibold text-ink">Access key</span>
                <span className="font-mono text-[0.66rem] text-amber-300">step 5</span>
              </div>
              <div className="font-mono text-[0.72rem] text-ink-dim">AKIA… + a secret</div>
            </div>
          </li>
          <li className="m-0">
            <Arrow label="aws configure saves it in" />
            <div className={`${step} border-line bg-bg-code`}>
              <div className="text-[0.9rem] font-semibold text-ink">~/.aws on your laptop</div>
              <div className="text-[0.78rem] text-ink-dim">Outside every project folder, so git never sees it.</div>
            </div>
          </li>
          <li className="m-0">
            <Arrow label="the aws CLI signs each request with it" />
            <div className={`${step} border-emerald-400/50 bg-emerald-400/10`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[0.9rem] font-semibold text-ink">AWS, Mumbai region</span>
                <span className="font-mono text-[0.66rem] text-emerald-300">step 6 checks this</span>
              </div>
              <div className="text-[0.78rem] text-ink-dim">Answers: “you are user/admin”.</div>
            </div>
          </li>
        </ol>

        <div className="flex flex-col gap-3">
          <div>
            <div className="mb-1 font-mono text-[0.7rem] text-ink-dim">~/.aws/credentials</div>
            <pre className="m-0 overflow-x-auto rounded-lg border border-line bg-bg-code px-3 py-2 text-[0.74rem] leading-relaxed">
              <code>{`[default]
aws_access_key_id     = AKIA…
aws_secret_access_key = ••••••••`}</code>
            </pre>
          </div>
          <div>
            <div className="mb-1 font-mono text-[0.7rem] text-ink-dim">~/.aws/config</div>
            <pre className="m-0 overflow-x-auto rounded-lg border border-line bg-bg-code px-3 py-2 text-[0.74rem] leading-relaxed">
              <code>{`[default]
region = ap-south-1
output = json`}</code>
            </pre>
          </div>

          <div className="rounded-lg border border-red-400/50 bg-red-400/10 px-3 py-2.5">
            <div className="mb-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-red-300">Never this path</div>
            <div className="flex flex-wrap items-center gap-2 text-[0.8rem] text-ink">
              <span className="rounded border border-line bg-bg-code px-1.5 font-mono text-[0.72rem]">AKIA…</span>
              <span className="text-ink-dim">→</span>
              <span className="rounded border border-line bg-bg-code px-1.5 font-mono text-[0.72rem]">.env in repo</span>
              <span className="text-ink-dim">→</span>
              <span className="rounded border border-line bg-bg-code px-1.5 font-mono text-[0.72rem]">git push</span>
              <span className="text-ink-dim">→</span>
              <span className="text-red-300">bots find it in minutes</span>
            </div>
            <div className="mt-1.5 text-[0.76rem] text-ink-dim">
              Public GitHub is scanned all the time. A leaked key is used to start servers on your bill.
            </div>
          </div>
        </div>
      </div>
    </Figure>
  );
}
