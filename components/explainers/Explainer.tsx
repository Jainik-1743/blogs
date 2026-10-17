import { SEQUENCES } from "@/lib/explainers";
import BreakerExplainer from "./BreakerExplainer";
import SequenceExplainer from "./SequenceExplainer";

/** Looks up an explainer by name. An unknown name fails the build, so a typo in a lesson cannot ship. */
export default function Explainer({ name }: { name: string }) {
  if (name === "circuit-breaker") return <BreakerExplainer />;
  const def = SEQUENCES[name];
  if (!def) throw new Error(`Unknown explainer "${name}". Known: circuit-breaker, ${Object.keys(SEQUENCES).join(", ")}`);
  return <SequenceExplainer def={def} />;
}
