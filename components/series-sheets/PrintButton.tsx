"use client";

/** Opens the browser's print dialog; "Save as PDF" there gives a PDF of the cheat sheet. */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-sky px-4 py-2 text-[0.88rem] font-semibold on-sky transition hover:-translate-y-0.5"
    >
      <span aria-hidden="true">⎙</span> Print or save as PDF
    </button>
  );
}
