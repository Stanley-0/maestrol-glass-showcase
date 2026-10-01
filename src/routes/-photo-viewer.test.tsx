import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";

import { Route } from "./index";

const Portfolio = Route.options.component as ComponentType;

async function openViewer(title = "Quiet Hours") {
  const user = userEvent.setup();
  render(<Portfolio />);
  const trigger = screen.getByRole("button", { name: `Open ${title}` });
  trigger.focus();
  await user.click(trigger);
  const dialog = screen.getByRole("dialog");
  return { user, trigger, dialog };
}

describe("full-screen photo viewer", () => {
  it("is a labelled modal dialog with named controls", async () => {
    const { dialog } = await openViewer();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Quiet Hours");
    expect(dialog).toHaveAccessibleDescription(/to browse/i);
    const v = within(dialog);
    expect(v.getByRole("button", { name: "Close photo viewer" })).toBeInTheDocument();
    expect(v.getByRole("button", { name: "Next: Passage" })).toBeInTheDocument();
    expect(v.getByRole("button", { name: "Previous: Edge of Weather" })).toBeInTheDocument();
    expect(v.getByRole("img", { name: /Quiet Hours — Editorial portrait/ })).toBeInTheDocument();
    expect(v.getByText(/of/, { selector: ".sr-only" }).parentElement).toHaveAttribute("aria-live", "polite");
  });

  it("moves focus into the viewer on open", async () => {
    const { dialog } = await openViewer();
    expect(within(dialog).getByRole("button", { name: "Close photo viewer" })).toHaveFocus();
  });

  it("traps Tab and Shift+Tab inside the viewer", async () => {
    const { user, dialog } = await openViewer();
    for (let i = 0; i < 8; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    for (let i = 0; i < 8; i++) {
      await user.tab({ shift: true });
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it("wraps focus from the last control back to the first", async () => {
    const { user, dialog } = await openViewer();
    const next = within(dialog).getByRole("button", { name: /^Next:/ });
    next.focus();
    await user.tab();
    expect(within(dialog).getByRole("button", { name: "Close photo viewer" })).toHaveFocus();
  });

  it("restores focus to the opening card when closed with Escape", async () => {
    const { user, trigger } = await openViewer();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("restores focus when closed with the Close button", async () => {
    const { user, trigger, dialog } = await openViewer("Concrete Light");
    await user.click(within(dialog).getByRole("button", { name: "Close photo viewer" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("updates the announced title when browsing with arrow keys", async () => {
    const { user } = await openViewer();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Passage");
  });
});
