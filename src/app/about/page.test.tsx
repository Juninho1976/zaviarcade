import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AboutPage from "./page";

describe("AboutPage", () => {
  it("explains the arcade for children and parents", () => {
    const page = renderToStaticMarkup(<AboutPage />);

    expect(page).toContain("About Zavi Arcade");
    expect(page).toContain("designed by Zavi and built together with family");
    expect(page).toContain("children and parents");
  });
});
