import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";

// Account pages are for readers, not for search results.
export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return <AuthShell mode="login" />;
}
