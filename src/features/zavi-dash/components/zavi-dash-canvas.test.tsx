import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ZaviDashCanvas } from "./zavi-dash-canvas";

describe("ZaviDashCanvas", () => {
  it("renders an accessible Canvas, visible controls, and a live status alternative", () => {
    const markup = renderToStaticMarkup(<ZaviDashCanvas debug />);

    expect(markup).toContain("Zavi Dash game canvas");
    expect(markup).toContain("Jump");
    expect(markup).toContain("Restart");
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('data-debug-enabled="true"');
  });
});
