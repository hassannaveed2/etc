import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { TestForm } from "@/components/admin/tests/TestForm";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveTest } from "../actions";

export const metadata: Metadata = { title: "New test" };

export default async function NewTestPage() {
  await requireUser("content:write");
  const last = await prisma.test.aggregate({ _max: { sortOrder: true } });

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveTest(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="New test" back={{ href: "/admin/tests", label: "Tests" }} />
      <TestForm
        action={save}
        test={{
          slug: "",
          code: "",
          name: "",
          short: "",
          category: "",
          level: "",
          audience: "",
          purpose: "",
          eligibility: "",
          measures: "",
          frequency: "",
          frequencyNote: "",
          fee: null,
          resultsUse: "",
          patternNote: "",
          reliability: "",
          syllabus: [""],
          categories: null,
          tos: null,
          sections: [{ name: "", items: null, detail: "" }],
          image: null,
          sortOrder: (last._max.sortOrder ?? 0) + 1,
          published: false,
          seoTitle: null,
          seoDescription: null,
        }}
      />
    </>
  );
}
