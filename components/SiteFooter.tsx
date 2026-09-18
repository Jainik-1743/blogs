export default function SiteFooter() {
  return (
    <footer className="border-t border-line py-8 text-[0.9rem] text-ink-dim">
      <div className="mx-auto max-w-[860px] px-4">
        © {new Date().getFullYear()} Jainik · Written for people who want to ship, not just read.
      </div>
    </footer>
  );
}
