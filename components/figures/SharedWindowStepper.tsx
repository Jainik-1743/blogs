"use client";

import Stepper, { PHASE, type PhaseStyle, type StepBase } from "./Stepper";

/** Two <script> tags on one page, one window between them. */

const TAG1 = ["<script>", '  var hotelName = "Grand Palace";', "</script>"];
const TAG2 = ["<script>", "  console.log(hotelName);", '  hotelName = "Overwritten!";', "</script>"];

type Step = StepBase & {
  phase: "one" | "two" | "done";
  tag: 1 | 2 | null;
  line: number | null;
  hotelName: string | null;
  console: string[];
  flash?: boolean;
};

const STEPS: Step[] = [
  { phase: "one", tag: 1, line: 2, title: "First <script> runs — var hotelName", note: "There is one Global EC and one window for the whole page. The var lands on window, like any top-level var.", hotelName: '"Grand Palace"', console: [], flash: true },
  { phase: "one", tag: 1, line: 3, title: "First <script> finishes", note: "The tag ends, but nothing is popped or cleared. The page's window — and hotelName on it — stays exactly as it is.", hotelName: '"Grand Palace"', console: [] },
  { phase: "two", tag: 2, line: 2, title: "Second <script> reads hotelName", note: "No declaration here, yet the name resolves: the lookup goes to the same window and finds the value the first tag put there.", hotelName: '"Grand Palace"', console: ['"Grand Palace"'] },
  { phase: "two", tag: 2, line: 3, title: "Second <script> overwrites it", note: "A plain assignment to the shared slot. The first tag's value is gone, silently, and any later code in either tag now sees the new one.", hotelName: '"Overwritten!"', console: ['"Grand Palace"'], flash: true },
  { phase: "done", tag: null, line: null, title: "One window, no walls", note: "Two tags, one global object. This is Lesson 3's public noticeboard at the scale of whole script files.", hotelName: '"Overwritten!"', console: ['"Grand Palace"'] },
];

const phases: Record<Step["phase"], PhaseStyle> = {
  one: { label: "Script tag 1", className: PHASE.green },
  two: { label: "Script tag 2", className: PHASE.amber },
  done: { label: "Finished", className: PHASE.plain },
};

function Tag({ n, lines, step }: { n: 1 | 2; lines: string[]; step: Step }) {
  const active = step.tag === n;
  return (
    <div className={`overflow-hidden rounded-lg border bg-bg-code ${active ? (n === 1 ? "border-emerald-400/60" : "border-amber-400/60") : "border-line"}`}>
      <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">index.html · tag {n}</div>
      <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.76rem]">
        {lines.map((src, i) => {
          const on = active && step.line === i + 1;
          return (
            <div key={i} className={`px-3 py-0.5 ${on ? (n === 1 ? "bg-emerald-400/20" : "bg-amber-400/20") : ""}`}>
              <code className={on ? "text-ink" : "text-ink-dim"}>{src}</code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

export default function SharedWindowStepper() {
  return (
    <Stepper steps={STEPS} phases={phases} caption="Step through both tags. There is only one window box in the middle, and both tags read and write the same slot in it." interval={2200}>
      {(step) => (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-start">
          <Tag n={1} lines={TAG1} step={step} />
          <div className="flex flex-col items-center gap-1 md:w-[13rem]">
            <div className="hidden font-mono text-ink-dim md:block">⟵ shared ⟶</div>
            <div className={`w-full rounded-lg border px-3 py-2 ${step.flash ? "border-amber-400/70 bg-amber-400/10" : "border-sky/50 bg-sky-soft"}`}>
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-dim">window · the page&apos;s one global object</div>
              <div className="mt-1 flex justify-between font-mono text-[0.78rem]">
                <span className="text-sky-strong">hotelName</span>
                <span className={step.hotelName ? "text-emerald-200" : "text-ink-dim"}>{step.hotelName ?? "—"}</span>
              </div>
            </div>
            <div className="w-full rounded-lg border border-line bg-bg-code px-3 py-2 font-mono text-[0.74rem]">
              <div className="text-[0.6rem] uppercase tracking-[0.08em] text-ink-dim">console</div>
              {step.console.length === 0 ? <span className="text-ink-dim">(nothing yet)</span> : step.console.map((l) => <div key={l} className="text-ink">› {l}</div>)}
            </div>
          </div>
          <Tag n={2} lines={TAG2} step={step} />
        </div>
      )}
    </Stepper>
  );
}
