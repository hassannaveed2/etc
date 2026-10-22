// @vitest-environment jsdom
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { formDataToObject } from "@/lib/admin/form-data";
import { ErrorSummary } from "@/components/admin/fields/ErrorSummary";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextField } from "@/components/admin/fields/TextField";
import { Repeater } from "@/components/admin/fields/Repeater";
import { FormErrorsProvider } from "@/components/admin/fields/Field";

afterEach(cleanup);

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.append(k, v);
  return f;
};

describe("formDataToObject", () => {
  test("rebuilds nested arrays and objects from dotted names", () => {
    expect(formDataToObject(fd({ title: "A", "sections.0.name": "X", "sections.1.name": "Y", "sections.1.items": "3", published: "on" }))).toEqual({
      title: "A",
      sections: [{ name: "X" }, { name: "Y", items: "3" }],
      published: "on",
    });
  });
  test("handles arrays of scalars and deep nesting; holes from removed rows collapse", () => {
    expect(formDataToObject(fd({ "syllabus.0": "a", "syllabus.2": "c", "tos.rows.0.v.0": "1", "tos.rows.0.v.1": "2", "tos.levels.0": "K" }))).toEqual({
      syllabus: ["a", "c"],
      tos: { rows: [{ v: ["1", "2"] }], levels: ["K"] },
    });
  });
  test("ignores Next.js internal action fields", () => {
    expect(formDataToObject(fd({ $ACTION_ID_abc: "", a: "1" }))).toEqual({ a: "1" });
  });
});

describe("ErrorSummary", () => {
  test("focuses itself and links each error to its field", () => {
    render(<ErrorSummary errors={{ title: "Title is required.", "sections.0.name": "Section name is required." }} labels={{ title: "Title" }} />);
    const box = screen.getByRole("alert");
    expect(document.activeElement).toBe(box);
    expect(screen.getByRole("link", { name: "Title is required." }).getAttribute("href")).toBe("#field-title");
    expect(screen.getByRole("link", { name: "Section name is required." }).getAttribute("href")).toBe("#field-sections.0.name");
  });
  test("shows a form-level error without field links", () => {
    render(<ErrorSummary formError="Someone else saved this item while you were editing. Reload to see their changes." />);
    expect(screen.getByRole("alert").textContent).toContain("Someone else saved");
  });
});

describe("fields", () => {
  test("a field error is linked by aria-describedby", () => {
    render(
      <FormErrorsProvider errors={{ title: "Title is required." }}>
        <TextField name="title" label="Title" required />
      </FormErrorsProvider>,
    );
    const input = screen.getByLabelText(/Title/);
    expect(input.id).toBe("field-title");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby")!.split(" ").pop()!)!.textContent).toBe("Title is required.");
  });

  test("SlugField follows the source until edited by hand", () => {
    render(
      <form>
        <TextField name="title" label="Title" />
        <SlugField name="slug" label="URL slug" sourceName="title" />
      </form>,
    );
    const title = screen.getByLabelText("Title") as HTMLInputElement;
    const slug = screen.getByLabelText("URL slug") as HTMLInputElement;
    fireEvent.input(title, { target: { value: "USAT December 2026: Registration Open!" } });
    expect(slug.value).toBe("usat-december-2026-registration-open");
    fireEvent.input(slug, { target: { value: "usat-dec" } });
    fireEvent.input(title, { target: { value: "Something else" } });
    expect(slug.value).toBe("usat-dec");
  });

  test("SlugField keeps an existing slug when editing", () => {
    render(
      <form>
        <TextField name="title" label="Title" defaultValue="Old" />
        <SlugField name="slug" label="URL slug" sourceName="title" defaultValue="old-slug" />
      </form>,
    );
    fireEvent.input(screen.getByLabelText("Title"), { target: { value: "New title" } });
    expect((screen.getByLabelText("URL slug") as HTMLInputElement).value).toBe("old-slug");
  });
});

describe("Repeater", () => {
  const renderRepeater = () =>
    render(
      <Repeater
        name="sections"
        legend="Pattern sections"
        itemLabel="section"
        initial={[{ name: "A" }, { name: "B" }]}
        blank={{ name: "" }}
        render={(item, prefix) => <TextField name={`${prefix}.name`} label="Section name" defaultValue={item.name} />}
      />,
    );

  test("add appends a blank row with indexed names", () => {
    renderRepeater();
    fireEvent.click(screen.getByRole("button", { name: "Add section" }));
    const inputs = screen.getAllByLabelText("Section name") as HTMLInputElement[];
    expect(inputs.map((i) => i.name)).toEqual(["sections.0.name", "sections.1.name", "sections.2.name"]);
    expect(inputs[2].value).toBe("");
  });

  test("move up reorders and remove deletes", () => {
    renderRepeater();
    fireEvent.click(screen.getByRole("button", { name: "Move section 2 up" }));
    expect((screen.getAllByLabelText("Section name") as HTMLInputElement[]).map((i) => i.value)).toEqual(["B", "A"]);
    fireEvent.click(screen.getByRole("button", { name: "Remove section 1" }));
    expect((screen.getAllByLabelText("Section name") as HTMLInputElement[]).map((i) => i.value)).toEqual(["A"]);
  });
});
