"use server";

import type { FormState } from "@/components/site/forms/FormShell";

// Placeholder until Task 26 wires validation, storage, rate limiting and mail.
export async function submitEnquiry(_prev: FormState, _fd: FormData): Promise<FormState> {
  return { status: "error", formError: "Not available yet." };
}

export async function submitContact(_prev: FormState, _fd: FormData): Promise<FormState> {
  return { status: "error", formError: "Not available yet." };
}
