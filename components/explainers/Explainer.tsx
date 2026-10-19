import { EXPLAINERS } from "@/lib/explain";
import ArrayExplainer from "./ArrayExplainer";
import BreakerExplainer from "./BreakerExplainer";
import FlowExplainer from "./FlowExplainer";
import SequenceExplainer from "./SequenceExplainer";
import TraceExplainer from "./TraceExplainer";

/** Looks up an explainer by name. An unknown name fails the build, so a typo in a lesson cannot ship. */
export default function Explainer({ name }: { name: string }) {
  if (name === "circuit-breaker") return <BreakerExplainer />;
  const def = EXPLAINERS[name];
  if (def) {
    switch (def.kind) {
      case "flow":
        return <FlowExplainer def={def} />;
      case "array":
        return <ArrayExplainer def={def} />;
      case "trace":
        return <TraceExplainer def={def} />;
      case "seq":
        return <SequenceExplainer def={{ title: def.title, actors: def.actors, steps: def.steps }} />;
    }
  }
  if (process.env.NODE_ENV === "development") {
    return <p className="rounded-lg border border-red-300/60 px-3 py-2 text-[0.85rem]">Explainer "{name}" is missing or invalid (see the dev server log).</p>;
  }
  throw new Error(`Unknown explainer "${name}". Add it to lib/explain/data/<series>.ts`);
}
