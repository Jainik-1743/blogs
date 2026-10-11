import { SQLPOSTGRES_SERIES } from "@/lib/iv";

/** Every /sql-postgres page carries the series accent. */
export default function SqlPostgresLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={SQLPOSTGRES_SERIES.accent}>{children}</div>;
}
