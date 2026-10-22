"use client";

import { AdminForm, Panel, type FormAction } from "@/components/admin/AdminForm";
import { Select, TextField } from "@/components/admin/fields/TextField";
import { Toggle } from "@/components/admin/fields/Toggle";

export type UserFormValues = { id?: number; name: string; email: string; role: string; active: boolean; lastLoginAt?: string | null; updatedAt?: string };

export function UserForm({ action, user: u }: { action: FormAction; user: UserFormValues }) {
  return (
    <AdminForm
      action={action}
      cancelHref="/admin/users"
      version={u.updatedAt}
      aside={
        <Panel title="Access">
          <Select
            name="role"
            label="Role"
            required
            defaultValue={u.role}
            options={[
              { value: "EDITOR", label: "Editor — content, media and inbox" },
              { value: "ADMIN", label: "Admin — everything, including users and settings" },
            ]}
          />
          <Toggle name="active" label="Active" description="Inactive users can’t sign in, and any open session stops working." defaultChecked={u.active} />
          {u.id && <p className="text-xs text-muted">Last signed in: {u.lastLoginAt ?? "never"}</p>}
        </Panel>
      }
    >
      <Panel title="Account">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="name" label="Name" required defaultValue={u.name} autoComplete="off" />
          <TextField name="email" label="Email" type="email" required defaultValue={u.email} autoComplete="off" />
        </div>
        <TextField
          name="password"
          label={u.id ? "New password" : "Password"}
          type="password"
          required={!u.id}
          autoComplete="new-password"
          hint={u.id ? "Leave empty to keep the current password. At least 12 characters." : "At least 12 characters. Share it with the person securely."}
        />
      </Panel>
    </AdminForm>
  );
}
