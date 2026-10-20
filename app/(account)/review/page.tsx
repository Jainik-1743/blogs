import type { Metadata } from "next";
import ReviewView from "@/components/auth/ReviewView";

export const metadata: Metadata = { title: "Daily review", robots: { index: false, follow: false } };

export default function ReviewPage() {
  return <ReviewView />;
}
