import Figure from "./Figure";

/** Two timelines: what happens to a bare `npm start`, and what PM2 does instead. */
const rows = [
  { event: "You close the SSH terminal", bare: "app dies", pm2: "keeps running (daemon)" },
  { event: "App throws an uncaught error", bare: "process exits, site down", pm2: "restarted in ~100 ms, logged" },
  { event: "Server reboots (patch, crash)", bare: "nothing starts, site down", pm2: "pm2 startup brings it back" },
  { event: "You deploy new code", bare: "kill, start, seconds of downtime", pm2: "pm2 reload — zero-downtime swap" },
  { event: "Machine has 2 CPU cores", bare: "1 core used", pm2: "-i max: one process per core" },
];

export default function Pm2Loop() {
  return (
    <Figure caption="Why a process manager exists. Left: a bare `npm start`. Right: the same app under PM2.">
      <div className="overflow-x-auto">
        <table className="my-0 min-w-full text-[0.88rem]">
          <thead>
            <tr>
              <th>Event</th>
              <th className="text-red-300">npm start</th>
              <th className="text-emerald-300">pm2 start</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.event}>
                <td>{r.event}</td>
                <td className="text-red-200/90">{r.bare}</td>
                <td className="text-emerald-200/90">{r.pm2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}
