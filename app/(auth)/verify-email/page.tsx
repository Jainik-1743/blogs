import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmail from "@/components/auth/VerifyEmail";
import { AuthFormSkeleton } from "@/components/Skeleton";

export const metadata: Metadata = { title: "Confirm your email", robots: { index: false, follow: false } };

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="rounded-2xl border border-line bg-bg-elev p-6 sm:p-8">
        <Suspense fallback={<AuthFormSkeleton />}>
          <VerifyEmail />
        </Suspense>
      </div>
    </div>
  );
}
