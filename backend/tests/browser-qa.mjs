import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function verifyBrowser(origin) {
  const { chromium } = require(process.env.QA_PLAYWRIGHT_PATH || "playwright-core");
  const browser = await chromium.launch({ executablePath: process.env.QA_CHROME_PATH });
  try {
    for (const width of [360, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      for (const [route, language] of [["/", "en"], ["/bn/admissions", "bn"], ["/contact", "en"], ["/admin/login", "en"]]) {
        const response = await page.goto(origin + route);
        assert.equal(response.status(), 200, route);
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        await page.getByRole("heading", { level: 1 }).first().waitFor({ timeout: 8000 });
        const metrics = await page.evaluate(async () => {
          await document.fonts.ready;
          const navigation = performance.getEntriesByType("navigation")[0];
          return { width: document.documentElement.scrollWidth, viewport: innerWidth,
            reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
            domReadyMs: Math.round(navigation.domContentLoadedEventEnd) };
        });
        assert.ok(metrics.width <= metrics.viewport, `Horizontal overflow: ${route} at ${width}px`);
        assert.ok(metrics.reducedMotion);
        await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
        const violations = await page.evaluate(async () => (await window.axe.run({
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }
        })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target.join(" ")) })));
        console.log(JSON.stringify({ route, width, domReadyMs: metrics.domReadyMs, violations }));
        assert.deepEqual(violations, [], `Accessibility checks: ${route} at ${width}px`);
        if (route === "/bn/admissions") {
          await page.keyboard.press("Tab");
          assert.equal(await page.locator(":focus").getAttribute("href"), "#main-content");
          await page.keyboard.press("Enter");
          assert.equal(await page.locator(":focus").getAttribute("id"), "main-content");
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
