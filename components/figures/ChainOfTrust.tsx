import Figure from "./Figure";
import HopChain, { type Hop } from "./HopChain";

/** Trust flows downward: a root every browser already trusts signs an intermediate, which signs yours. */
const hops: Hop[] = [
  { title: "Root CA", desc: "pre-installed in every browser and OS", tone: "purple", edge: "signs" },
  { title: "Intermediate CA", desc: "signed by the root", tone: "sky", edge: "signs" },
  { title: "Your certificate", desc: "yourapp.com", tone: "ok" },
];

export default function ChainOfTrust() {
  return (
    <Figure caption="The chain of trust. Your server sends its certificate plus the intermediate, so the browser can walk the chain up to a root it already trusts. Trust the root, trust everything signed below it.">
      <HopChain hops={hops} label="Chain of trust" />
    </Figure>
  );
}
