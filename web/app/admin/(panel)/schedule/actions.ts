"use server";

import { defineAction } from "@/lib/admin/action";
import { updateLocked } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { idInput, publishInput, scheduleForm } from "@/lib/validation/admin";

const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const PATHS = ["/", "/candidate-services"];

export const saveSchedule = defineAction({
  permission: "content:write",
  schema: scheduleForm,
  entity: "ScheduleEntry",
  action: (i) => (i.id ? "UPDATE" : "CREATE"),
  tags: ["schedule", "tests"],
  async run(input): Promise<SaveData & { session: string }> {
    const data = {
      testId: input.testId,
      session: input.session,
      regCloses: date(input.regCloses),
      testDate: date(input.testDate),
      status: input.status,
      published: input.published,
    };
    if (input.id) {
      await updateLocked(prisma.scheduleEntry, input.id, input.updatedAt, data);
      const s = await prisma.scheduleEntry.findUniqueOrThrow({ where: { id: input.id }, select: { updatedAt: true } });
      return { id: input.id, session: input.session, viewHref: input.published ? "/candidate-services#schedule" : null, updatedAt: s.updatedAt.toISOString() };
    }
    const s = await prisma.scheduleEntry.create({ data });
    return {
      id: s.id,
      session: s.session,
      redirect: `/admin/schedule/${s.id}?saved=1`,
      viewHref: s.published ? "/candidate-services#schedule" : null,
      updatedAt: s.updatedAt.toISOString(),
    };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.id ? "Updated" : "Created"} schedule entry “${d.session}”`,
  paths: () => PATHS,
});

export const setSchedulePublished = defineAction({
  permission: "content:write",
  schema: publishInput,
  entity: "ScheduleEntry",
  action: (i) => (i.published ? "PUBLISH" : "UNPUBLISH"),
  tags: ["schedule", "tests"],
  async run({ id, published }) {
    const s = await prisma.scheduleEntry.update({ where: { id }, data: { published } });
    return { id, session: s.session };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.published ? "Published" : "Unpublished"} schedule entry “${d.session}”`,
  paths: () => PATHS,
});

export const deleteSchedule = defineAction({
  permission: "content:delete",
  schema: idInput,
  entity: "ScheduleEntry",
  action: "DELETE",
  tags: ["schedule", "tests"],
  async run({ id }) {
    const s = await prisma.scheduleEntry.delete({ where: { id } });
    return { id, session: s.session };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Deleted schedule entry “${d.session}”`,
  paths: () => PATHS,
});
