import fs from "node:fs";
import path from "node:path";

/** Reads content/<series>/NN.md — the Markdown source of one interview-series lesson. */
export function readIvLesson(series: string, number: number): string {
  const file = path.join(process.cwd(), "content", series, `${String(number).padStart(2, "0")}.md`);
  return fs.readFileSync(file, "utf8");
}
