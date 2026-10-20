import type { Metadata } from "next";
import BadgeAdmin from "@/components/admin/BadgeAdmin";

export const metadata: Metadata = { title: "Manage badges", robots: { index: false, follow: false } };

export default function BadgeAdminPage() {
  return <BadgeAdmin />;
}
