/**
 * Private notes on lessons. All of a reader's notes live in one record (notes/{uid}) holding a map, like bookmarks.
 * Cost on the free database plan (50,000 reads and 20,000 writes a day) is kept low on purpose:
 *   - the record is read once per visit, the first time a note box or the notes page needs it;
 *   - a note is written only when the reader presses Save: one write per save, never while typing.
 */
export const MAX_NOTE_CHARS = 2000;
/** 200 notes of 2,000 characters is about 400 KB, well inside the 1 MB limit on one record. */
export const MAX_NOTES = 200;

export type Note = { path: string; title: string; series: string; text: string; at: number };

/** Field names cannot contain "/", so /dsa/lesson-49 is stored as dsa~lesson-49. */
export const noteKey = (path: string) => path.replace(/^\/+|\/+$/g, "").replace(/\//g, "~");
