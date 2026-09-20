import Figure from "./Figure";

/** Users and roles are identities; policies are where permissions live. Groups sit between users and policies. */
const card = "rounded-lg border px-3 py-2.5 text-center";

export default function IamBlocks() {
  return (
    <Figure caption="The four IAM building blocks. Users and roles are identities. Policies are where the actual permissions live — always attached to a group or a role, never hand-written on a person.">
      <div className="mx-auto max-w-[32rem]">
        <div className="grid grid-cols-2 gap-3">
          <div className={`${card} border-sky/50 bg-sky-soft`}>
            <div className="font-semibold text-sky-strong">IAM User</div>
            <div className="text-[0.8rem] text-sky-strong/80">a person who logs in</div>
          </div>
          <div className={`${card} border-emerald-400/50 bg-emerald-400/10`}>
            <div className="font-semibold text-emerald-200">IAM Role</div>
            <div className="text-[0.8rem] text-emerald-200/80">temporary, no password</div>
          </div>
          <div className="text-center text-ink-dim" aria-hidden="true">↓ is placed in</div>
          <div className="text-center text-ink-dim" aria-hidden="true">↓ is assumed by</div>
          <div className={`${card} border-sky/50 bg-sky-soft`}>
            <div className="font-semibold text-sky-strong">IAM Group</div>
            <div className="text-[0.8rem] text-sky-strong/80">a department of users</div>
          </div>
          <div className={`${card} border-emerald-400/50 bg-emerald-400/10`}>
            <div className="font-semibold text-emerald-200">Services</div>
            <div className="text-[0.8rem] text-emerald-200/80">EC2, Lambda, GitHub Actions</div>
          </div>
        </div>
        <div className="py-1 text-center text-ink-dim" aria-hidden="true">↘ &nbsp; permissions come from &nbsp; ↙</div>
        <div className={`${card} mx-auto max-w-[20rem] border-violet-400/50 bg-violet-400/10`}>
          <div className="font-semibold text-violet-200">IAM Policy</div>
          <div className="text-[0.8rem] text-violet-200/80">the permission document (JSON)</div>
        </div>
      </div>
    </Figure>
  );
}
