"use client";

import { AdminForm, Panel, type FormAction } from "@/components/admin/AdminForm";
import { Repeater } from "@/components/admin/fields/Repeater";
import { SlugField } from "@/components/admin/fields/SlugField";
import { NumberField, Select, TextArea, TextField } from "@/components/admin/fields/TextField";
import { Toggle } from "@/components/admin/fields/Toggle";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import type { MediaItem } from "@/lib/admin/media";
import type { Tos, UsatCategory } from "@/lib/content/types";
import { TEST_CATEGORY } from "@/lib/labels";
import { TosGrid } from "./TosGrid";

export type TestFormValues = {
  id?: number;
  slug: string;
  code: string;
  name: string;
  short: string;
  category: string;
  level: string;
  audience: string;
  purpose: string;
  eligibility: string;
  measures: string;
  frequency: string;
  frequencyNote: string;
  fee: number | null;
  resultsUse: string;
  patternNote: string;
  reliability: string;
  syllabus: string[];
  categories: UsatCategory[] | null;
  tos: Tos | null;
  sections: { name: string; items: string | null; detail: string }[];
  image: MediaItem | null;
  sortOrder: number;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt?: string;
};

const LEVELS = ["Knowledge", "Understanding", "Application", "Analysis", "Evaluation", "Create"];

export function TestForm({ action, test: t }: { action: FormAction; test: TestFormValues }) {
  return (
    <AdminForm
      action={action}
      cancelHref="/admin/tests"
      version={t.updatedAt}
      viewHref={t.id && t.published ? `/tests/${t.slug}` : null}
      aside={
        <>
          <Panel title="Publishing">
            <Toggle name="published" label="Published" description="Listed in the test directory and menus." defaultChecked={t.published} />
            <NumberField name="sortOrder" label="Order in lists" defaultValue={t.sortOrder} hint="Lower numbers come first." />
          </Panel>
          <Panel title="Fee">
            <NumberField name="fee" label="Fee per candidate (Rs.)" min={0} defaultValue={t.fee ?? ""} />
            <Toggle name="feeByAgreement" label="By agreement" description="No fixed fee (e.g. customized tests)." defaultChecked={t.fee === null && !!t.id} />
          </Panel>
          <Panel title="Image">
            <MediaPicker name="imageId" label="Card and header image" accept="image" value={t.image} />
          </Panel>
          <Panel title="Search engines" description="Leave empty to use the code, name and short description.">
            <TextField name="seoTitle" label="SEO title" maxLength={70} defaultValue={t.seoTitle} />
            <TextArea name="seoDescription" label="SEO description" rows={3} maxLength={160} defaultValue={t.seoDescription} />
          </Panel>
        </>
      }
    >
      <Panel title="Overview">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="name" label="Name" required defaultValue={t.name} />
          <TextField name="code" label="Code" required defaultValue={t.code} maxLength={40} hint="Short name, e.g. USAT." />
          <SlugField name="slug" label="URL slug" sourceName="code" prefix="/tests/" defaultValue={t.slug} required />
          <Select
            name="category"
            label="Purpose"
            required
            placeholder="Choose a purpose"
            defaultValue={t.category}
            options={Object.entries(TEST_CATEGORY).map(([value, c]) => ({ value, label: c.label }))}
          />
          <TextField name="level" label="Level" required defaultValue={t.level} hint="e.g. Undergraduate, MS / MPhil, PhD." />
          <TextField name="audience" label="Who takes it" required defaultValue={t.audience} />
        </div>
        <TextArea name="short" label="Short description" required rows={2} maxLength={500} defaultValue={t.short} hint="Shown on cards." />
        <TextArea name="purpose" label="Purpose" required rows={4} defaultValue={t.purpose} />
        <TextArea name="resultsUse" label="How results are used" required rows={3} defaultValue={t.resultsUse} />
      </Panel>

      <Panel title="Eligibility and measures">
        <TextArea name="eligibility" label="Eligibility" required rows={3} defaultValue={t.eligibility} />
        <TextArea name="measures" label="What it measures" required rows={3} defaultValue={t.measures} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="frequency" label="Frequency" required defaultValue={t.frequency} />
          <TextField name="frequencyNote" label="Frequency note" required defaultValue={t.frequencyNote} />
        </div>
      </Panel>

      <Panel title="Pattern">
        <TextArea name="patternNote" label="Pattern note" required rows={2} defaultValue={t.patternNote} />
        <Repeater
          name="sections"
          legend="Sections"
          itemLabel="section"
          min={1}
          initial={t.sections}
          blank={{ name: "", items: null, detail: "" }}
          render={(s, p) => (
            <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
              <TextField name={`${p}.name`} label="Section" required defaultValue={s.name} />
              <TextField name={`${p}.items`} label="Items / marks" defaultValue={s.items ?? ""} hint="Empty shows “As published”." />
              <div className="sm:col-span-2">
                <TextField name={`${p}.detail`} label="What it covers" required defaultValue={s.detail} />
              </div>
            </div>
          )}
        />
        <Repeater
          name="syllabus"
          legend="Syllabus areas"
          itemLabel="syllabus item"
          min={1}
          initial={t.syllabus}
          blank=""
          render={(s, p) => <TextField name={p} label="Syllabus area" required defaultValue={s} />}
        />
      </Panel>

      <Panel title="Streams" description="Only for tests with stream categories, such as USAT. Leave empty otherwise.">
        <Repeater
          name="categories"
          legend="Streams"
          itemLabel="stream"
          initial={t.categories ?? []}
          blank={{ code: "", stream: "", subjects: "", levels: [0, 0, 0, 0, 0, 0] }}
          render={(c, p) => (
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                <TextField name={`${p}.code`} label="Code" required defaultValue={c.code} />
                <TextField name={`${p}.stream`} label="Stream" required defaultValue={c.stream} />
              </div>
              <TextField name={`${p}.subjects`} label="Subjects" required defaultValue={c.subjects} />
              <fieldset>
                <legend className="text-sm font-semibold text-ink">Thinking-level profile (number of MCQs)</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
                  {LEVELS.map((l, k) => (
                    <NumberField key={l} name={`${p}.levels.${k}`} label={l} min={0} defaultValue={c.levels[k] ?? 0} />
                  ))}
                </div>
              </fieldset>
            </div>
          )}
        />
      </Panel>

      <Panel title="Table of specifications">
        <TosGrid value={t.tos} />
      </Panel>

      <Panel title="Reliability">
        <TextArea name="reliability" label="How we make sure scores are reliable" required rows={3} defaultValue={t.reliability} />
      </Panel>
    </AdminForm>
  );
}
