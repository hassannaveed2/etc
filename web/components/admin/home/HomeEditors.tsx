"use client";

import { AdminForm, Panel, type FormAction } from "@/components/admin/AdminForm";
import { Repeater } from "@/components/admin/fields/Repeater";
import { DateField, NumberField, Select, TextArea, TextField } from "@/components/admin/fields/TextField";
import { Toggle } from "@/components/admin/fields/Toggle";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import type { MediaItem } from "@/lib/admin/media";
import { CLIENT_SECTOR, STATUS } from "@/lib/labels";

export type HeroFormValues = {
  id?: number;
  eyebrow: string;
  title: string;
  body: string;
  image: MediaItem | null;
  cta1Label: string | null;
  cta1Href: string | null;
  cta2Label: string | null;
  cta2Href: string | null;
  order: number;
  published: boolean;
  updatedAt?: string;
};

export function HeroForm({ action, slide: s }: { action: FormAction; slide: HeroFormValues }) {
  return (
    <AdminForm
      action={action}
      cancelHref="/admin/hero"
      version={s.updatedAt}
      viewHref={s.id ? "/" : null}
      aside={
        <Panel title="Publishing">
          <Toggle name="published" label="Published" description="Shown in the homepage carousel." defaultChecked={s.published} />
          <NumberField name="order" label="Position" defaultValue={s.order} hint="Lower numbers come first. The first slide's title is the page heading." />
        </Panel>
      }
    >
      <Panel title="Slide">
        <TextField name="eyebrow" label="Eyebrow" required defaultValue={s.eyebrow} hint="Short line above the title." />
        <TextField name="title" label="Title" required defaultValue={s.title} />
        <TextArea name="body" label="Text" required rows={3} maxLength={1000} defaultValue={s.body} />
        <MediaPicker name="imageId" label="Background image" accept="image" required value={s.image} hint="Wide photograph, at least 2000 px across." />
      </Panel>
      <Panel title="Buttons" description="Optional. Links start with / for pages on this site, or https:// for other sites.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="cta1Label" label="Main button text" defaultValue={s.cta1Label} />
          <TextField name="cta1Href" label="Main button link" defaultValue={s.cta1Href} placeholder="/tests" />
          <TextField name="cta2Label" label="Second button text" defaultValue={s.cta2Label} />
          <TextField name="cta2Href" label="Second button link" defaultValue={s.cta2Href} placeholder="/about" />
        </div>
      </Panel>
    </AdminForm>
  );
}

export type ScheduleFormValues = {
  id?: number;
  testId: number | null;
  session: string;
  regCloses: string;
  testDate: string;
  status: string;
  published: boolean;
  updatedAt?: string;
};

export function ScheduleForm({ action, entry: e, tests }: { action: FormAction; entry: ScheduleFormValues; tests: { id: number; code: string }[] }) {
  return (
    <AdminForm
      action={action}
      cancelHref="/admin/schedule"
      version={e.updatedAt}
      viewHref={e.id && e.published ? "/candidate-services#schedule" : null}
      aside={
        <Panel title="Publishing">
          <Toggle name="published" label="Published" description="Shown on the homepage, Candidate Services and the test page." defaultChecked={e.published} />
          <Select name="status" label="Status" defaultValue={e.status} options={Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))} />
        </Panel>
      }
    >
      <Panel title="Session">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="testId"
            label="Test"
            required
            placeholder="Choose a test"
            defaultValue={e.testId ? String(e.testId) : ""}
            options={tests.map((t) => ({ value: String(t.id), label: t.code }))}
          />
          <TextField name="session" label="Session" required defaultValue={e.session} placeholder="e.g. USAT December 2026" />
          <DateField name="regCloses" label="Registration closes" required defaultValue={e.regCloses} />
          <DateField name="testDate" label="Test date" required defaultValue={e.testDate} />
        </div>
      </Panel>
    </AdminForm>
  );
}

export type StatValues = { value: number; label: string; note: string };

export function StatsEditor({ action, items, version }: { action: FormAction; items: StatValues[]; version: string }) {
  return (
    <AdminForm action={action} cancelHref="/admin" version={version} viewHref="/">
      <Panel title="ETC in numbers" description="Shown on the homepage in this order. Use whole numbers; separators are added automatically.">
        <Repeater
          name="items"
          legend="Numbers"
          itemLabel="number"
          initial={items}
          blank={{ value: 0, label: "", note: "" }}
          render={(s, p) => (
            <div className="grid gap-3 sm:grid-cols-[10rem_1fr_1fr]">
              <NumberField name={`${p}.value`} label={`Value of ${s.label || "new number"}`} required min={0} defaultValue={s.value} />
              <TextField name={`${p}.label`} label="Label" required defaultValue={s.label} />
              <TextField name={`${p}.note`} label="Note" required defaultValue={s.note} />
            </div>
          )}
        />
      </Panel>
    </AdminForm>
  );
}

export type ClientValues = { name: string; sector: string };

export function ClientsEditor({ action, items, version }: { action: FormAction; items: ClientValues[]; version: string }) {
  return (
    <AdminForm action={action} cancelHref="/admin" version={version} viewHref="/institutions#clients">
      <Panel title="Clients and partners" description="Grouped by sector on the Institutions page; all appear in the homepage marquee.">
        <Repeater
          name="items"
          legend="Clients"
          itemLabel="client"
          initial={items}
          blank={{ name: "", sector: "" }}
          render={(c, p) => (
            <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
              <TextField name={`${p}.name`} label="Client name" required defaultValue={c.name} />
              <Select
                name={`${p}.sector`}
                label="Sector"
                required
                placeholder="Choose a sector"
                defaultValue={c.sector}
                options={Object.entries(CLIENT_SECTOR).map(([value, s]) => ({ value, label: s.label }))}
              />
            </div>
          )}
        />
      </Panel>
    </AdminForm>
  );
}
