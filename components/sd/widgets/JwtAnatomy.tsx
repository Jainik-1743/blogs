"use client";

import { useState } from "react";
import { Shell, btn } from "./ui";

const HEADER = { alg: "HS256", typ: "JWT" };
const PAYLOAD = { sub: "user_42", name: "Asha", role: "editor", iat: 1767225600, exp: 1767226500 };

const b64url = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

/** The three parts of a JWT, colour-coded, and what happens when someone edits the payload. */
export default function JwtAnatomy({ caption }: { caption: string }) {
  const [tampered, setTampered] = useState(false);
  const payload = tampered ? { ...PAYLOAD, role: "admin" } : PAYLOAD;
  const sig = "3mQf9Zx1yV7bK0aLp2Rt8sWc4dNe6hJg5uOi1kPq";

  return (
    <Shell caption={caption}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={`${btn} ${tampered ? "border-red-400 text-red-300" : ""}`}
          onClick={() => setTampered((t) => !t)}
        >
          {tampered ? "↺ Undo the edit" : "Try it: change role to admin"}
        </button>
      </div>
      <div className="break-all rounded-lg border border-line bg-bg-code p-3 font-mono text-[0.78rem] leading-relaxed">
        <span className="text-rose-300">{b64url(HEADER)}</span>
        <span className="text-ink-dim">.</span>
        <span className={tampered ? "text-red-300 underline decoration-wavy" : "text-violet-300"}>
          {b64url(payload)}
        </span>
        <span className="text-ink-dim">.</span>
        <span className="text-sky">{sig}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-rose-300/40 bg-rose-300/5 p-3">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-rose-300">Header</div>
          <pre className="my-1 border-0 bg-transparent p-0 text-[0.72rem]">
            <code>{JSON.stringify(HEADER, null, 1)}</code>
          </pre>
          <div className="text-[0.75rem] text-ink-dim">Which algorithm signed it.</div>
        </div>
        <div
          className={`rounded-lg border p-3 ${tampered ? "border-red-400/60 bg-red-400/10" : "border-violet-300/40 bg-violet-300/5"}`}
        >
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-violet-300">Payload (claims)</div>
          <pre className="my-1 border-0 bg-transparent p-0 text-[0.72rem]">
            <code>{JSON.stringify(payload, null, 1)}</code>
          </pre>
          <div className="text-[0.75rem] text-ink-dim">Only Base64 — anyone can read it. Never put secrets here.</div>
        </div>
        <div className="rounded-lg border border-sky/40 bg-sky-soft p-3">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-sky">Signature</div>
          <div className="my-1 font-mono text-[0.72rem]">HMAC-SHA256(header + &quot;.&quot; + payload, secret)</div>
          <div className="text-[0.75rem] text-ink-dim">
            Only the server knows the secret, so only it can make a valid one.
          </div>
        </div>
      </div>
      <p
        className={`mb-0 mt-4 rounded-lg border px-3 py-2 text-[0.85rem] ${tampered ? "border-red-400/50 bg-red-400/10 text-red-200" : "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"}`}
      >
        {tampered
          ? "The server recomputes the signature over the edited payload. It no longer matches → 401 Unauthorized. Editing is easy; forging the signature is not."
          : "The server recomputes the signature from header + payload with its secret. It matches → the claims are trusted, with no database lookup."}
      </p>
    </Shell>
  );
}
