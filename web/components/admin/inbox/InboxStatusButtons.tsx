"use client";

import type { InboxStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setInboxStatus } from "@/app/admin/(panel)/enquiries/actions";

const NEXT: { status: InboxStatus; label: string }[] = [
  { status: "NEW", label: "Mark new" },
  { status: "IN_PROGRESS", label: "Mark in progress" },
  { status: "CLOSED", label: "Mark closed" },
];

export function InboxStatusButtons({ kind, id, status }: { kind: "enquiry" | "message"; id: number; status: InboxStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {NEXT.filter((n) => n.status !== status).map((n) => (
          <button
            key={n.status}
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await setInboxStatus({ kind, id, status: n.status });
                if (!r.ok) setError(r.formError ?? "Couldn’t update the status.");
                else router.refresh();
              })
            }
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50 disabled:opacity-50"
          >
            {n.label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
