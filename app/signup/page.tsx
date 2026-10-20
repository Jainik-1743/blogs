import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: false } };

export default function SignupPage() {
  return <AuthShell mode="signup" />;
}
