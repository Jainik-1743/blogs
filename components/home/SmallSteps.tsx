const POINTS = [
  { title: "One lesson at a time", text: "Each lesson takes about ten minutes. You never need to read everything." },
  { title: "Your place is saved", text: "Close the page any time. We remember what you finished and what to read next." },
  { title: "Build a daily habit", text: "Read one lesson a day and watch your streak grow. Progress stays on your device." },
];

/** Replaces big totals with the promise that matters to a new reader: small, saved, steady steps. */
export default function SmallSteps() {
  return (
    <ul className="m-0 grid list-none gap-8 p-0 md:grid-cols-3">
      {POINTS.map((p, i) => (
        <li key={p.title} className={`m-0 ${i > 0 ? "md:border-l md:border-line md:pl-8" : ""}`}>
          <h3 className="m-0 mb-2 text-[1.1rem] font-semibold text-ink">{p.title}</h3>
          <p className="m-0 text-[0.95rem] text-ink-dim">{p.text}</p>
        </li>
      ))}
    </ul>
  );
}
