import type { Metadata } from "next";
import AccountView from "@/components/auth/AccountView";
import { SERIES_LIST } from "@/lib/registry";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default function AccountPage() {
  // Series names for the bookmarks list: { devops: "DevOps", dsa: "DSA", ... }
  const seriesNames = Object.fromEntries(SERIES_LIST.map((s) => [s.slug, s.short]));
  return <AccountView seriesNames={seriesNames} />;
}
