"use client";

import { AdminForm, Panel, type FormAction } from "@/components/admin/AdminForm";
import { Repeater } from "@/components/admin/fields/Repeater";
import { RichTextField } from "@/components/admin/fields/RichTextField";
import { SlugField } from "@/components/admin/fields/SlugField";
import { DateField, Select, TextArea, TextField } from "@/components/admin/fields/TextField";
import { Toggle } from "@/components/admin/fields/Toggle";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import type { MediaItem } from "@/lib/admin/media";
import { NOTICE_TYPE, STATUS } from "@/lib/labels";

export type NoticeFormValues = {
  id?: number;
  slug: string;
  title: string;
  type: string;
  testId: number | null;
  status: string;
  publishedAt: string;
  deadline: string | null;
  summary: string;
  bodyHtml: string;
  published: boolean;
  isSample: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  attachments: { label: string; media: MediaItem | null }[];
  updatedAt?: string;
};

export function NoticeForm({
  action,
  notice,
  tests,
}: {
  action: FormAction;
  notice: NoticeFormValues;
  tests: { id: number; code: string }[];
}) {
  return (
    <AdminForm
      action={action}
      cancelHref="/admin/notices"
      version={notice.updatedAt}
      viewHref={notice.id && notice.published ? `/news/${notice.slug}` : null}
      aside={
        <>
          <Panel title="Publishing">
            <Toggle name="published" label="Published" description="Visible on the public site." defaultChecked={notice.published} />
            <Toggle name="isSample" label="Sample content" description="Shows a “Sample” label until ETC replaces it." defaultChecked={notice.isSample} />
            <Select
              name="status"
              label="Status"
              defaultValue={notice.status}
              options={Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))}
            />
          </Panel>
          <Panel title="Search engines" description="Leave empty to use the title and summary.">
            <TextField name="seoTitle" label="SEO title" maxLength={70} defaultValue={notice.seoTitle} hint="Up to 70 characters." />
            <TextArea name="seoDescription" label="SEO description" rows={3} maxLength={160} defaultValue={notice.seoDescription} hint="Up to 160 characters." />
          </Panel>
        </>
      }
    >
      <Panel title="Notice">
        <TextField name="title" label="Title" required defaultValue={notice.title} maxLength={191} />
        <SlugField name="slug" label="URL slug" sourceName="title" prefix="/news/" defaultValue={notice.slug} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="type"
            label="Notice type"
            required
            placeholder="Choose a type"
            defaultValue={notice.type}
            options={Object.entries(NOTICE_TYPE).map(([value, t]) => ({ value, label: t.label }))}
          />
          <Select
            name="testId"
            label="Related test"
            placeholder="General — no specific test"
            defaultValue={notice.testId ? String(notice.testId) : ""}
            options={tests.map((t) => ({ value: String(t.id), label: t.code }))}
          />
          <DateField name="publishedAt" label="Publish date" required defaultValue={notice.publishedAt} />
          <DateField name="deadline" label="Deadline" defaultValue={notice.deadline} hint="Optional. Shown on the notice and its list row." />
        </div>
        <TextArea name="summary" label="Summary" required rows={3} maxLength={1000} defaultValue={notice.summary} hint="One or two sentences shown in lists." />
        <RichTextField name="bodyHtml" label="Body" required defaultValue={notice.bodyHtml} />
      </Panel>
      <Panel title="Attachments" description="Official PDFs for this notice.">
        <Repeater
          name="attachments"
          legend="Files"
          itemLabel="attachment"
          initial={notice.attachments}
          blank={{ label: "", media: null }}
          render={(a, prefix) => (
            <div className="grid gap-3">
              <TextField name={`${prefix}.label`} label="Label" required defaultValue={a.label} placeholder="e.g. USAT December 2026 — official notice" />
              <MediaPicker name={`${prefix}.mediaId`} label="PDF" accept="pdf" required value={a.media} />
            </div>
          )}
        />
      </Panel>
    </AdminForm>
  );
}
