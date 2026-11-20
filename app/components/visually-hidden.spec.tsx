import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VisuallyHidden } from "@/components/visually-hidden";
import { expectNoAxeViolations } from "@/test/axe";

afterEach(cleanup);

describe("VisuallyHidden", () => {
  it("renders a div by default", () => {
    const { container } = render(<VisuallyHidden>Hidden</VisuallyHidden>);

    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("renders a span inside a button and keeps its text in the name", async () => {
    const { container } = render(
      <button type="button">
        Show more
        <VisuallyHidden component="span">: Canton</VisuallyHidden>
      </button>
    );

    expect(container.querySelector("button > span")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: /^Show more ?: Canton$/ })
    ).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
