"use client";

import { AdminForm, Panel, type FormAction } from "@/components/admin/AdminForm";
import { DateField, Select, TextField } from "@/components/admin/fields/TextField";
import { Toggle } from "@/components/admin/fields/Toggle";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import type { MediaItem } from "@/lib/admin/media";
import { RESOURCE_TYPE } from "@/lib/labels";

export type ResourceFormValues = {
  id?: number;
  title: string;
  type: string;
  testId: number | null;
  date: string;
  media: MediaItem | null;
  published: boolean;
  isSample: boolean;
  updatedAt?: string;
};

export function ResourceForm({ action, resource: r, tests }: { action: FormAction; resource: ResourceFormValues; tests: { id: number; code: string }[] }) {
  return (
    <AdminForm
      action={action}
      cancelHref="/admin/resources"
      version={r.updatedAt}
      viewHref={r.id && r.published ? "/resources" : null}
      aside={
        <Panel title="Publishing">
          <Toggle name="published" label="Published" description="Listed in the resource library and on its test page." defaultChecked={r.published} />
          <Toggle name="isSample" label="Sample content" description="Shows a “Sample” label until ETC replaces it." defaultChecked={r.isSample} />
        </Panel>
      }
    >
      <Panel title="Resource">
        <TextField name="title" label="Title" required defaultValue={r.title} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            name="type"
            label="Resource type"
            required
            placeholder="Choose a type"
            defaultValue={r.type}
            options={Object.entries(RESOURCE_TYPE).map(([value, t]) => ({ value, label: t.label }))}
          />
          <Select
            name="testId"
            label="Related test"
            placeholder="General — no specific test"
            defaultValue={r.testId ? String(r.testId) : ""}
            options={tests.map((t) => ({ value: String(t.id), label: t.code }))}
          />
          <DateField name="date" label="Document date" required defaultValue={r.date} hint="Shown as “Updated …”." />
        </div>
        <MediaPicker name="mediaId" label="PDF" accept="pdf" required value={r.media} />
      </Panel>
    </AdminForm>
  );
}
