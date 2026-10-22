import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeroForm } from "@/components/admin/home/HomeEditors";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { toMediaItem } from "@/lib/admin/media";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveHero } from "../actions";

export const metadata: Metadata = { title: "Edit slide" };

export default async function EditHeroPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("content:write");
  const id = Number((await params).id);
  const s = Number.isInteger(id) ? await prisma.heroSlide.findUnique({ where: { id }, include: { image: true } }) : null;
  if (!s) notFound();

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveHero({ ...formDataToObject(fd), id });
  }

  return (
    <>
      <PageHeader title={s.title} back={{ href: "/admin/hero", label: "Hero" }} />
      <HeroForm
        action={save}
        slide={{
          id: s.id,
          eyebrow: s.eyebrow,
          title: s.title,
          body: s.body,
          image: toMediaItem(s.image),
          cta1Label: s.cta1Label,
          cta1Href: s.cta1Href,
          cta2Label: s.cta2Label,
          cta2Href: s.cta2Href,
          order: s.order,
          published: s.published,
          updatedAt: s.updatedAt.toISOString(),
        }}
      />
    </>
  );
}
