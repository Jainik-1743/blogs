"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { deleteDoc, doc, setDoc, writeBatch } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { METRICS, clearBadgeCache, loadBadges, type Badge as BadgeData, type MetricId } from "@/lib/badges";
import { isAdminUser } from "@/lib/admin";
import { useAccount } from "@/components/auth/AuthProvider";
import { Field, Notice, SelectField, Switch, inputClass } from "@/components/auth/fields";
import Badge from "@/components/Badge";
import { useToast } from "@/components/Toast";
import seed from "@/data/badges.seed.json";
import { AdminSkeleton } from "@/components/Skeleton";

const BLANK: BadgeData = { id: "", name: "", track: "reading", metric: "activeDays", threshold: 5, blurb: "", image: "", enabled: true, share: "" };

/** Turns a picked picture into a small WebP data URL (at most 420px wide), so it can live in the database. */
async function toDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 420 / bmp.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.9);
}

function Editor({ initial, isNew, onSaved, onDeleted }: { initial: BadgeData; isNew?: boolean; onSaved: () => void; onDeleted?: () => void }) {
  const toast = useToast();
  const [b, setB] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<BadgeData>) => setB((v) => ({ ...v, ...p }));
  const id = (isNew ? b.id : initial.id).trim().toLowerCase();

  async function pick(file: File | undefined) {
    if (!file) return;
    try {
      const url = await toDataUrl(file);
      if (url.length > 280_000) return toast("That picture is too large even after shrinking. Use a simpler image.", "error");
      set({ image: url });
    } catch {
      toast("That file could not be read as an image.", "error");
    }
  }

  async function save() {
    const fb = getFirebase();
    if (!fb) return;
    if (!/^[a-z0-9-]{2,30}$/.test(id)) return toast("The id needs 2 to 30 lowercase letters, numbers or dashes.", "error");
    if (!b.name.trim() || !b.track.trim() || !b.image) return toast("Name, track and a picture are required.", "error");
    if (!Number.isFinite(b.threshold) || b.threshold < 1) return toast("The number to reach must be 1 or more.", "error");
    setBusy(true);
    try {
      await setDoc(doc(fb.db, "badges", id), {
        name: b.name.trim(), track: b.track.trim().toLowerCase(), metric: b.metric, threshold: Math.round(b.threshold),
        blurb: b.blurb.trim(), image: b.image, enabled: b.enabled,
        ...(b.share?.trim() ? { share: b.share.trim() } : {}),
      });
      clearBadgeCache();
      toast(isNew ? "Badge added." : "Badge saved.");
      if (isNew) setB(BLANK);
      onSaved();
    } catch (err) {
      toast(`Could not save: ${(err as { code?: string }).code ?? "unknown error"}`, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const fb = getFirebase();
    if (!fb || !window.confirm(`Delete the ${initial.name} badge?`)) return;
    setBusy(true);
    try {
      await deleteDoc(doc(fb.db, "badges", id));
      clearBadgeCache();
      toast("Badge deleted.", "info");
      onDeleted?.();
    } catch (err) {
      toast(`Could not delete: ${(err as { code?: string }).code ?? "unknown error"}`, "error");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-bg-elev p-5 sm:p-6">
      <div className="grid gap-6 md:grid-cols-[9rem_1fr]">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-36 w-full place-items-center">
            {b.image ? <Badge badge={{ name: b.name || "New", image: b.image }} size={110} /> : <span className="text-[0.8rem] text-ink-dim">No picture</span>}
          </div>
          <label className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-[0.82rem] font-semibold text-ink hover:border-sky hover:text-sky">
            Upload picture
            <input type="file" accept="image/png,image/webp,image/jpeg" className="sr-only" onChange={(e) => void pick(e.target.files?.[0])} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {isNew && (
            <Field id={`id-${initial.id || "new"}`} label="Id" hint="Short, lowercase, never changes. Example: gold">
              <input value={b.id} onChange={(e) => set({ id: e.target.value })} className={inputClass} placeholder="gold" />
            </Field>
          )}
          <Field id={`name-${id || "new"}`} label="Name">
            <input value={b.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} placeholder="Gold" />
          </Field>
          <Field id={`track-${id || "new"}`} label="Track" hint="Badges with the same track form one ladder.">
            <input value={b.track} onChange={(e) => set({ track: e.target.value })} className={inputClass} placeholder="reading" />
          </Field>
          <SelectField id={`metric-${id || "new"}`} label="What it measures" value={b.metric} onChange={(v) => set({ metric: v as MetricId })} options={METRICS.map((m) => ({ value: m.id, label: m.label }))} placeholder="Active days" />
          <Field id={`threshold-${id || "new"}`} label="Number to reach">
            <input type="number" min={1} value={Number.isFinite(b.threshold) ? b.threshold : ""} onChange={(e) => set({ threshold: Number(e.target.value) })} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field id={`blurb-${id || "new"}`} label="Short message">
              <input value={b.blurb} onChange={(e) => set({ blurb: e.target.value })} className={inputClass} placeholder="Two weeks of real progress." />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field id={`share-${id || "new"}`} label="Share message" optional hint="Wording readers send to friends. Use {badge} {value} {unit} {blurb} {url}. Leave empty for the built-in lines.">
              <textarea rows={3} value={b.share ?? ""} onChange={(e) => set({ share: e.target.value })} className={inputClass} placeholder="Gold unlocked: {value} {unit} of showing up. {blurb} Join me: {url}" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field id={`image-${id || "new"}`} label="Picture address" optional hint="Filled in by Upload picture. You can also paste a site path like /badges/gold.webp or a full URL.">
              <input value={b.image.startsWith("data:") ? "(uploaded picture)" : b.image} readOnly={b.image.startsWith("data:")} onChange={(e) => set({ image: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Switch id={`enabled-${id || "new"}`} label="Show this badge" text="Switch off to hide it without deleting it." checked={b.enabled} onChange={(v) => set({ enabled: v })} />
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={save} className="rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg hover:brightness-110 disabled:opacity-60">{busy ? "Saving…" : isNew ? "Add badge" : "Save"}</button>
        {!isNew && <button type="button" disabled={busy} onClick={remove} className="rounded-lg border border-[#f87171]/60 px-4 py-2 text-[0.88rem] font-semibold text-[#f87171] hover:bg-[#f87171]/10">Delete</button>}
      </div>
    </div>
  );
}

/** Owner-only page to manage badges: add, edit, hide or delete them. Changes are live for everyone within a few hours. */
export default function BadgeAdmin() {
  const { status, user, enabled } = useAccount();
  const toast = useToast();
  const [list, setList] = useState<BadgeData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setList(await loadBadges(true));
      setError(null);
    } catch (err) {
      setError((err as { code?: string }).code ?? "unknown");
    }
  }, []);

  const isAdmin = isAdminUser(user);
  useEffect(() => {
    if (status === "ready" && isAdmin) void reload();
  }, [status, isAdmin, reload]);

  async function addDefaults() {
    const fb = getFirebase();
    if (!fb) return;
    try {
      const batch = writeBatch(fb.db);
      for (const { id, ...rest } of seed as (BadgeData)[]) batch.set(doc(fb.db, "badges", id), rest);
      await batch.commit();
      clearBadgeCache();
      toast("The five default badges were added.");
      void reload();
    } catch (err) {
      toast(`Could not add them: ${(err as { code?: string }).code ?? "unknown error"}`, "error");
    }
  }

  if (!enabled) return <Notice tone="info">Accounts are not set up on this copy of the site.</Notice>;
  if (status === "loading") return <AdminSkeleton />;
  if (status === "out") return <Notice tone="info">Please <Link href="/login?next=/admin/badges">sign in</Link> to continue.</Notice>;
  if (!isAdmin) return <Notice tone="error">Only the site owner can manage badges.</Notice>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-1 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-sky">Admin</p>
        <h1 className="m-0 text-[2rem] font-bold tracking-tight text-ink">Badges</h1>
        <p className="mt-2 mb-0 max-w-[62ch] text-ink-dim">
          Every badge on the site comes from this list, so you can add or change one here without touching the code. Readers see changes within a few hours.
        </p>
      </div>

      {error && <Notice tone="error">The badges could not be loaded ({error}). Deploy the Firestore rules and try again.</Notice>}

      {list && list.length === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-bg-elev p-6">
          <p className="m-0 max-w-xl text-ink-dim">There are no badges yet. Add the five default ones (Silver, Gold, Platinum, Diamond, Elite) to start, then edit them as you like.</p>
          <button type="button" onClick={addDefaults} className="rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg hover:brightness-110">Add the default badges</button>
        </div>
      )}

      {list?.map((b) => <Editor key={b.id} initial={b} onSaved={reload} onDeleted={reload} />)}

      <div>
        <h2 className="mb-4 text-[1.3rem] font-bold text-ink">Add a new badge</h2>
        <Editor initial={BLANK} isNew onSaved={reload} />
      </div>
    </div>
  );
}
