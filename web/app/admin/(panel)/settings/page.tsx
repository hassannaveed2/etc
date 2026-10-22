import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/LeaderSettingsForms";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { listVersion } from "@/lib/admin/lock";
import { requireUser } from "@/lib/auth/session";
import { _getSettings } from "@/lib/content/settings";
import { prisma } from "@/lib/db";
import { saveSettings } from "./actions";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireUser("settings:manage");
  const [settings, rows] = await Promise.all([_getSettings(), prisma.setting.findMany({ select: { updatedAt: true } })]);

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveSettings(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="Settings" description="Contact details, official portal links and notification addresses used across the site." />
      <SettingsForm action={save} settings={settings} version={listVersion(rows)} />
    </>
  );
}
