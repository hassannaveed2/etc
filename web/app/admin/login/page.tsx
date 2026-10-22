import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  if (await getCurrentUser()) redirect("/admin");
  const { callbackUrl } = await searchParams;
  let next: string | undefined;
  try {
    next = callbackUrl ? new URL(callbackUrl, "http://x").pathname : undefined;
  } catch {
    next = undefined;
  }

  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-mint-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/brand/etc-crest.png" alt="" width={428} height={480} className="h-16 w-auto" priority />
          <p className="eyebrow mt-5">Education Testing Council</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-green-700">Sign in to ETC Admin</h1>
        </div>
        <div className="rounded-xl border border-line bg-white p-6 shadow-card sm:p-8">
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">For ETC staff only. Contact an administrator if you need an account.</p>
      </div>
    </main>
  );
}
