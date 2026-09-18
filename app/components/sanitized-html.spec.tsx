import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { boldOnlySchema, inlineTextSchema } from "@/components/sanitize-schema";
import { SanitizedHtml } from "@/components/sanitized-html";

afterEach(cleanup);

describe("SanitizedHtml", () => {
  it("keeps allowed formatting", () => {
    const { container } = render(
      <SanitizedHtml
        html="A <b>bold</b> and <em>emphasized</em> abstract"
        schema={inlineTextSchema}
      />
    );

    expect(container.querySelector("b")?.textContent).toBe("bold");
    expect(container.querySelector("em")?.textContent).toBe("emphasized");
  });

  it("drops disallowed elements but keeps their text", () => {
    const { container } = render(
      <SanitizedHtml
        html={'Before <script>alert(1)</script><iframe src="x"></iframe> after'}
        schema={inlineTextSchema}
      />
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.textContent).toContain("Before");
    expect(container.textContent).toContain("after");
  });

  it("drops event handler attributes", () => {
    const { container } = render(
      <SanitizedHtml
        html={'<img src="x" onerror="alert(document.domain)">'}
        schema={inlineTextSchema}
      />
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.innerHTML).not.toContain("onerror");
  });

  it("renders links as safe external links", () => {
    render(
      <SanitizedHtml
        html={'<a href="https://example.com/?a=1&amp;b=2">FOEN &amp; BAFU</a>'}
        schema={inlineTextSchema}
      />
    );

    const link = screen.getByRole("link", { name: "FOEN & BAFU" });
    expect(link.getAttribute("href")).toBe("https://example.com/?a=1&b=2");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("does not render unsafe URLs as links", () => {
    const { container } = render(
      <SanitizedHtml
        html={'<a href="javascript:alert(1)">Publisher</a>'}
        schema={inlineTextSchema}
      />
    );

    expect(container.querySelector("a")).toBeNull();
    expect(screen.getByText("Publisher")).toBeTruthy();
  });

  it("restricts the markup to the given schema", () => {
    const { container } = render(
      <SanitizedHtml
        html={'<b>match</b> <a href="https://example.com">link</a>'}
        schema={boldOnlySchema}
      />
    );

    expect(container.querySelector("b")?.textContent).toBe("match");
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toBe("match link");
  });

  it("renders on the server", () => {
    const markup = renderToStaticMarkup(
      <SanitizedHtml
        html={'<b>ok</b><img src="x" onerror="alert(1)">'}
        schema={inlineTextSchema}
      />
    );

    expect(markup).toContain("<b>ok</b>");
    expect(markup).not.toContain("onerror");
  });
});
