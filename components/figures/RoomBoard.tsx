import Figure from "./Figure";

/** A reserved-but-empty slot on the room board vs. a room number that was never on it. */
export default function RoomBoard() {
  return (
    <Figure caption="One is a real, empty entry. The other was never entered on the board at all." note="room board">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-4 py-4 text-center">
          <div className="text-[0.9rem] font-semibold text-emerald-200">Room 101 — on the board</div>
          <div className="mx-auto my-3 w-[11rem] rounded-md border border-line bg-bg-code px-3 py-2 font-mono text-[0.78rem]">
            <div className="flex justify-between"><span className="text-sky-strong">guestName</span><span className="text-ink-dim">undefined</span></div>
          </div>
          <div className="font-mono text-[0.75rem] text-emerald-200">status: &ldquo;Vacant&rdquo; = undefined</div>
          <div className="mt-1 text-[0.78rem] text-ink-dim">a real slot, just empty right now</div>
        </div>
        <div className="rounded-lg border border-dashed border-red-400/60 bg-red-400/10 px-4 py-4 text-center">
          <div className="text-[0.9rem] font-semibold text-red-200">Room 999 — not on the board</div>
          <div className="mx-auto my-3 flex h-[2.6rem] w-[11rem] items-center justify-center rounded-md border border-dashed border-red-400/40 font-mono text-[0.75rem] text-red-300/70">
            no such slot exists
          </div>
          <div className="font-mono text-[0.75rem] text-red-300">= ReferenceError</div>
          <div className="mt-1 text-[0.78rem] text-ink-dim">not defined, ever</div>
        </div>
      </div>
    </Figure>
  );
}
