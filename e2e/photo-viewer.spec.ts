import { expect, test, type Page } from "@playwright/test";

async function openViewer(page: Page, title = "Quiet Hours") {
  await page.goto("/");
  await page.getByRole("button", { name: `Open ${title}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

async function swipe(page: Page, dx: number, dy: number) {
  const dialog = page.getByRole("dialog");
  await dialog.evaluate((el, [dx, dy]) => {
    const x = window.innerWidth / 2, y = window.innerHeight / 2;
    const touch = (cx: number, cy: number) => new Touch({ identifier: 1, target: el, clientX: cx, clientY: cy });
    el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [touch(x, y)], changedTouches: [touch(x, y)] }));
    el.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [], changedTouches: [touch(x + dx, y + dy)] }));
  }, [dx, dy] as const);
}

test.describe("full-screen photo viewer", () => {
  test("ArrowRight and ArrowLeft move between works and wrap around", async ({ page }) => {
    const dialog = await openViewer(page);
    await expect(dialog).toHaveAccessibleName("Quiet Hours");
    await page.keyboard.press("ArrowRight");
    await expect(dialog).toHaveAccessibleName("Passage");
    await page.keyboard.press("ArrowLeft");
    await expect(dialog).toHaveAccessibleName("Quiet Hours");
    await page.keyboard.press("ArrowLeft");
    await expect(dialog).toHaveAccessibleName("Edge of Weather");
  });

  test("Escape closes the viewer and returns focus to the card", async ({ page }) => {
    await openViewer(page, "Concrete Light");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open Concrete Light" })).toBeFocused();
  });

  test("swipe left/right browses and swipe down closes @touch", async ({ page }) => {
    const dialog = await openViewer(page);
    await swipe(page, -150, 0);
    await expect(dialog).toHaveAccessibleName("Passage");
    await swipe(page, 150, 0);
    await expect(dialog).toHaveAccessibleName("Quiet Hours");
    await swipe(page, 20, 30); // too short: ignored
    await expect(dialog).toHaveAccessibleName("Quiet Hours");
    await swipe(page, 0, 200);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("shows an error with a working retry when a photo fails", async ({ page }) => {
    let block = true;
    await page.route(/concrete-light.*\.jpg/, (route) => (block ? route.abort() : route.continue()));
    const dialog = await openViewer(page, "Concrete Light");
    await expect(dialog.getByRole("alert")).toContainText("didn’t load");
    block = false;
    await dialog.getByRole("button", { name: "Try again" }).click();
    await expect(dialog.getByRole("alert")).toHaveCount(0);
    await expect(dialog.getByRole("img", { name: /Concrete Light/ })).toBeVisible();
  });
});
