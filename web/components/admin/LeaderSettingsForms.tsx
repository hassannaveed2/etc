"use client";

import { AdminForm, Panel, type FormAction } from "@/components/admin/AdminForm";
import { RichTextField } from "@/components/admin/fields/RichTextField";
import { TextArea, TextField } from "@/components/admin/fields/TextField";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import type { MediaItem } from "@/lib/admin/media";
import type { SiteSettings } from "@/lib/validation/content";

export type LeaderFormValues = {
  role: string;
  name: string;
  title: string;
  quote: string;
  messageHtml: string;
  photo: MediaItem | null;
  updatedAt: string;
};

export function LeaderForm({ action, leader: l }: { action: FormAction; leader: LeaderFormValues }) {
  return (
    <AdminForm
      action={action}
      cancelHref="/admin/leaders"
      version={l.updatedAt}
      viewHref="/about#leadership"
      aside={
        <Panel title="Photograph">
          <MediaPicker name="photoId" label="Portrait" accept="image" value={l.photo} hint="Square crop works best." />
        </Panel>
      }
    >
      <input type="hidden" name="role" value={l.role} />
      <Panel title="Leader">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="name" label="Name" required defaultValue={l.name} />
          <TextField name="title" label="Title" required defaultValue={l.title} />
        </div>
        <TextArea name="quote" label="Quote" required rows={3} maxLength={1000} defaultValue={l.quote} hint="Shown in large type. Don’t add quotation marks." />
        <RichTextField name="messageHtml" label="Message" required defaultValue={l.messageHtml} />
      </Panel>
    </AdminForm>
  );
}

export function SettingsForm({ action, settings: s, version }: { action: FormAction; settings: SiteSettings; version: string }) {
  return (
    <AdminForm action={action} cancelHref="/admin" version={version} viewHref="/contact">
      <Panel title="Contact details" description="Shown in the header, footer and on the Contact page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="helpline" label="Helpline" required defaultValue={s.helpline} />
          <TextField name="supportEmail" label="Support email" required defaultValue={s.supportEmail} />
        </div>
        <TextField name="address" label="Address" required defaultValue={s.address} />
        <TextField name="officeHours" label="Office hours" required defaultValue={s.officeHours} />
      </Panel>
      <Panel title="Official portals" description="Registration, admit cards and results are handled only by the official ETC/HEC portal. These links open in a new tab.">
        <TextField name="portalRegistrationUrl" label="Registration portal" required defaultValue={s.portalRegistrationUrl} placeholder="https://" />
        <TextField name="portalAdmitCardUrl" label="Admit card (roll number slip) portal" required defaultValue={s.portalAdmitCardUrl} placeholder="https://" />
        <TextField name="portalResultsUrl" label="Results portal" required defaultValue={s.portalResultsUrl} placeholder="https://" />
      </Panel>
      <Panel title="Notifications" description="Where new enquiries and contact messages are emailed. Leave empty to only keep them in the inbox.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="enquiryNotifyEmail" label="Enquiry notifications" type="email" defaultValue={s.enquiryNotifyEmail} />
          <TextField name="contactNotifyEmail" label="Contact-form notifications" type="email" defaultValue={s.contactNotifyEmail} />
        </div>
      </Panel>
    </AdminForm>
  );
}
