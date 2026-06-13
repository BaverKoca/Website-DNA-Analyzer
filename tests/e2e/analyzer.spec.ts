import { expect, test } from "@playwright/test";

test("runs a real website analysis", async ({ page }) => {
  test.setTimeout(90000);

  await page.goto("/");
  await page.getByLabel("Website URL").fill("example.com");
  await page.locator("form").getByRole("button", { name: "Analyze" }).click();

  await expect(page.getByText("Extraction complete")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Design DNA match", { exact: true })).toBeVisible();
  await expect(page.getByText("Visual DNA", { exact: true }).last()).toBeVisible();
  await expect(page.getByRole("figure", { name: "Desktop preview" })).toHaveCount(1);
  await expect(page.getByRole("img", { name: "Desktop website screenshot" })).toHaveCount(1);
  await expect(page.getByText("DNA Report", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Brand maturity", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Report" })).toBeVisible();
  await expect(page.getByText("Typography system")).toBeVisible();
  await expect(page.getByText("Motion profile")).toBeVisible();
  await expect(page.getByText("Elements", { exact: true })).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    )
    .toBe(true);
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.getByText("Analysis summary")).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    )
    .toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });

  const reportPagePromise = page.context().waitForEvent("page");
  await page.getByRole("button", { name: "Export Report" }).click();
  const reportPage = await reportPagePromise;
  await expect(reportPage.getByText("Website DNA Audit")).toBeVisible();
  await expect(reportPage.getByText("Premium design intelligence report.")).toBeVisible();
  await expect(reportPage.getByText("Extracted systems")).toBeVisible();
  await expect
    .poll(async () =>
      reportPage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    )
    .toBe(true);
});
