import type { Metadata } from "next";
import AccountView from "@/components/auth/AccountView";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default function AccountPage() {
  return <AccountView />;
}
