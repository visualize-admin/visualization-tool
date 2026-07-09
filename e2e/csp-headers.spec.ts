import { setup } from "./common";

const { test, describe, expect } = setup();

describe("CSP headers", () => {
  test("should be set on the index page", async ({ page }) => {
    const response = await page.goto("/en");
    expect(response).not.toBeNull();
    const csp =
      response!.headers()["content-security-policy"] ??
      response!.headers()["content-security-policy-report-only"];
    expect(csp).toBeTruthy();
    expect(csp).toContain("frame-ancestors");
  });

  test("should be set on the imprint page", async ({ page }) => {
    const response = await page.goto("/en/imprint");
    expect(response).not.toBeNull();
    const csp =
      response!.headers()["content-security-policy"] ??
      response!.headers()["content-security-policy-report-only"];
    expect(csp).toBeTruthy();
    expect(csp).toContain("frame-ancestors");
  });
});
