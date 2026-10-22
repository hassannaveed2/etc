"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

type LoginState = { error?: string; email?: string };

const LOGIN_ERROR = "Email or password is incorrect, or the account is locked. Try again in 15 minutes.";

function safeNext(raw: FormDataEntryValue | null): string {
  const next = typeof raw === "string" ? raw : "";
  return next.startsWith("/admin") && !next.startsWith("//") && next !== "/admin/login" ? next : "/admin";
}

export async function loginAction(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "");
  try {
    await signIn("credentials", { email, password: String(fd.get("password") ?? ""), redirectTo: safeNext(fd.get("next")) });
    return {};
  } catch (e) {
    // signIn signals success by throwing a redirect; only credential failures are AuthErrors.
    if (e instanceof AuthError) return { error: LOGIN_ERROR, email };
    throw e;
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
