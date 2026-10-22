// @vitest-environment jsdom
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { StatusChip } from "@/components/site/StatusChip";
import { ResourceCard } from "@/components/site/ResourceCard";
import { NoticeRow } from "@/components/site/NoticeRow";
import { TestCard } from "@/components/site/TestCard";
import { Counter } from "@/components/site/Counter";
import { Tabs } from "@/components/site/Tabs";
import { Accordion } from "@/components/site/Accordion";
import { Carousel } from "@/components/site/Carousel";
import { Pagination } from "@/components/site/Pagination";
import type { HeroSlideItem, NoticeRow as NoticeRowData, ResourceCard as ResourceCardData } from "@/lib/content/types";

afterEach(cleanup);

const notice: NoticeRowData = {
  slug: "usat-reg-dec-2026",
  title: "USAT December 2026 session: registration open",
  type: "ADMISSION",
  testSlug: "usat",
  testCode: "USAT",
  status: "OPEN",
  summary: "Online registration is open.",
  publishedAt: "2026-10-15",
  deadline: "2026-11-20",
  isSample: true,
};

describe("cards", () => {
  test("status chip label and classes per status", () => {
    render(<StatusChip status="OPEN" />);
    const chip = screen.getByTestId("status-chip");
    expect(chip.textContent).toBe("Open");
    expect(chip.className).toContain("bg-status-open/10");
    expect(chip.className).toContain("text-status-open");
    cleanup();
    render(<StatusChip status="RESULT" />);
    expect(screen.getByTestId("status-chip").textContent).toBe("Result announced");
  });

  test("notice row links to /news/<slug> and shows deadline and sample chip", () => {
    render(<NoticeRow notice={notice} />);
    expect(screen.getByRole("link", { name: notice.title }).getAttribute("href")).toBe("/news/usat-reg-dec-2026");
    expect(screen.getByText("Deadline 20 Nov 2026")).toBeTruthy();
    expect(screen.getByText("Sample")).toBeTruthy();
    expect(screen.getByText("Admission")).toBeTruthy();
  });

  test("resource card shows type, test, size, date and sample chip", () => {
    const r: ResourceCardData = {
      id: 1,
      title: "LAT sample questions",
      type: "SAMPLE_PAPER",
      testCode: "LAT",
      fileUrl: "https://cdn/x.pdf",
      sizeLabel: "760 KB",
      date: "2026-07-20",
      isSample: true,
    };
    render(<ResourceCard resource={r} />);
    expect(screen.getByText("Sample paper · LAT")).toBeTruthy();
    expect(screen.getByText("PDF · 760 KB · Updated 20 Jul 2026")).toBeTruthy();
    expect(screen.getByText("Sample")).toBeTruthy();
    expect(screen.getByRole("link", { name: "LAT sample questions" }).getAttribute("href")).toBe("https://cdn/x.pdf");
  });

  test("test card shows fee and links to /tests/<slug>", () => {
    render(
      <TestCard
        test={{ slug: "customized", code: "Customized", name: "Customized Tests", short: "Built to order.", category: "RECRUITMENT", level: "As defined", fee: null, frequency: "By agreement", image: null }}
      />,
    );
    expect(screen.getByRole("link", { name: "Customized Tests" }).getAttribute("href")).toBe("/tests/customized");
    expect(screen.getByText("Fee*").nextElementSibling!.textContent).toBe("By agreement");
  });
});

describe("counter", () => {
  test("server HTML holds the final formatted value", () => {
    expect(renderToStaticMarkup(<Counter value={1852391} />)).toContain("1,852,391");
    expect(renderToStaticMarkup(<Counter value={103} suffix="+" />)).toContain("103+");
  });
});

describe("tabs", () => {
  const tabs = ["USAT-E", "USAT-M", "USAT-CS"].map((id) => ({ id, label: id, panel: <p>{id} panel</p> }));

  test("arrow keys, Home and End move selection and focus", () => {
    render(<Tabs label="USAT categories" tabs={tabs} />);
    const [e, m, cs] = screen.getAllByRole("tab");
    expect(e.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(e, { key: "ArrowRight" });
    expect(m.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(m);
    fireEvent.keyDown(m, { key: "End" });
    expect(cs.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(cs, { key: "ArrowRight" });
    expect(e.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(e, { key: "Home" });
    expect(e.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("USAT-E panel")).toBeTruthy();
    expect(screen.getByText("USAT-M panel", { selector: "p" }).closest("[role=tabpanel]")!.hasAttribute("hidden")).toBe(true);
  });
});

describe("accordion", () => {
  test("toggles aria-expanded and the panel", () => {
    render(<Accordion items={[{ id: "q1", title: "How do I register?", body: <p>On the portal.</p> }]} />);
    const btn = screen.getByRole("button", { name: "How do I register?" });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("On the portal.").closest("[id]")!.hasAttribute("hidden")).toBe(false);
  });
});

describe("carousel", () => {
  const slide = (id: number, title: string): HeroSlideItem => ({
    id,
    eyebrow: "E",
    title,
    body: "B",
    image: { url: "/x.jpg", alt: "", width: 2000, height: 1131 },
    cta1Label: null,
    cta1Href: null,
    cta2Label: null,
    cta2Href: null,
  });

  test("pause toggles its label and next moves the slide", () => {
    render(<Carousel slides={[slide(1, "One"), slide(2, "Two")]} />);
    const pause = screen.getByRole("button", { name: "Pause slideshow" });
    fireEvent.click(pause);
    expect(screen.getByRole("button", { name: "Play slideshow" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    // inactive slides are aria-hidden (no accessible name), so match on the attribute
    const groups = screen.getAllByRole("group", { hidden: true }).filter((g) => / of 2$/.test(g.getAttribute("aria-label") ?? ""));
    expect(groups).toHaveLength(2);
    expect(groups[0].getAttribute("aria-hidden")).toBe("true");
    expect(groups[1].getAttribute("aria-hidden")).toBe("false");
  });

  test("first slide title is the page h1, later ones are h2", () => {
    render(<Carousel slides={[slide(1, "One"), slide(2, "Two")]} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("One");
    expect(screen.getAllByRole("heading", { level: 2, hidden: true }).map((h) => h.textContent)).toEqual(["Two"]);
  });
});

describe("pagination", () => {
  test("renders page links with the current page marked", () => {
    render(<Pagination page={2} pages={3} makeHref={(n) => `/news?page=${n}`} />);
    expect(screen.getByRole("link", { name: "Page 2" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Next page" }).getAttribute("href")).toBe("/news?page=3");
    expect(screen.getByRole("link", { name: "Previous page" }).getAttribute("href")).toBe("/news?page=1");
  });
  test("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} pages={1} makeHref={(n) => `?page=${n}`} />);
    expect(container.innerHTML).toBe("");
  });
});
