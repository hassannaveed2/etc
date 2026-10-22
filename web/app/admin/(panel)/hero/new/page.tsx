import type { Metadata } from "next";
import { HeroForm } from "@/components/admin/home/HomeEditors";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveHero } from "../actions";

export const metadata: Metadata = { title: "New slide" };

export default async function NewHeroPage() {
  await requireUser("content:write");
  const last = await prisma.heroSlide.aggregate({ _max: { order: true } });

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveHero(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="New slide" back={{ href: "/admin/hero", label: "Hero" }} />
      <HeroForm
        action={save}
        slide={{
          eyebrow: "",
          title: "",
          body: "",
          image: null,
          cta1Label: null,
          cta1Href: null,
          cta2Label: null,
          cta2Href: null,
          order: (last._max.order ?? -1) + 1,
          published: false,
        }}
      />
    </>
  );
}
