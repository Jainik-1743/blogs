import Figure from "./Figure";

/** The office-building picture: one address, many doors, a guard deciding which doors are open. */
const doors = [
  { port: 22, room: "security room", service: "SSH", open: "your IP only" },
  { port: 80, room: "reception", service: "HTTP", open: "everyone" },
  { port: 443, room: "secure reception", service: "HTTPS", open: "everyone" },
  { port: 3000, room: "your app", service: "Next.js", open: null },
  { port: 5432, room: "record room", service: "PostgreSQL", open: null },
];

export default function ServerDoors() {
  return (
    <Figure
      caption="One server = one building. Each port is a door to a different room. The Security Group is the guard at the gate: every door is locked until you write a rule that opens it."
      note="52.66.12.9"
    >
      <div className="rounded-lg border border-dashed border-line px-3 pb-3 pt-2">
        <div className="mb-2 flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-dim">
          <span>IP address · 52.66.12.9</span>
          <span className="text-amber-300">guard: Security Group</span>
        </div>
        <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-2">
          {doors.map((d) => (
            <div
              key={d.port}
              className={`rounded-lg border px-2 py-2 text-center ${
                d.open ? "border-emerald-400/50 bg-emerald-400/10" : "border-line bg-bg-code"
              }`}
            >
              <div className={`font-mono text-[1.2rem] font-bold ${d.open ? "text-emerald-300" : "text-ink-dim"}`}>
                {d.port}
              </div>
              <div className="text-[0.8rem] text-ink">{d.service}</div>
              <div className="text-[0.72rem] text-ink-dim">{d.room}</div>
              <div className={`mt-1 font-mono text-[0.66rem] uppercase tracking-[0.06em] ${d.open ? "text-emerald-300" : "text-ink-dim"}`}>
                {d.open ? `open · ${d.open}` : "locked"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Figure>
  );
}
