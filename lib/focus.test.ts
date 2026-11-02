// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { captureTenderFocus, restoreTenderFocus } from "./focus";

describe("tender focus helpers", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("restores focus to the visible matching tender element", async () => {
    document.body.innerHTML = `
      <article data-tender-id="tender-1" tabindex="0" id="card"></article>
      <article data-tender-id="tender-1" tabindex="0" id="hidden"></article>
      <p id="dashboard-page-title" tabindex="-1">Daftar Tender</p>
    `;
    const card = document.getElementById("card") as HTMLElement;
    const hidden = document.getElementById("hidden") as HTMLElement;
    card.getClientRects = () => [{ width: 1, height: 1 }] as unknown as DOMRectList;
    hidden.getClientRects = () => [] as unknown as DOMRectList;

    captureTenderFocus("tender-1");
    card.blur();
    hidden.focus();
    restoreTenderFocus("tender-1");
    await new Promise((resolve) => window.requestAnimationFrame(resolve));

    expect(document.activeElement).toBe(card);
  });

  it("falls back to the dashboard heading when the tender is gone", async () => {
    document.body.innerHTML = `
      <p id="dashboard-page-title" tabindex="-1">Daftar Tender</p>
    `;
    restoreTenderFocus("missing");
    await new Promise((resolve) => window.requestAnimationFrame(resolve));

    expect(document.activeElement?.id).toBe("dashboard-page-title");
  });
});
