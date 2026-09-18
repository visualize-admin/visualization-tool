import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DatasetPublisher } from "@/components/dataset-metadata";

afterEach(cleanup);

describe("DatasetPublisher", () => {
  it("renders publisher anchor markup as a safe link", () => {
    render(
      <DatasetPublisher
        publisher={
          '<a href="https://example.com/?a=1&amp;b=2">FOEN &amp; BAFU</a>'
        }
      />
    );

    const link = screen.getByRole("link", { name: "FOEN & BAFU" });
    expect(link.getAttribute("href")).toBe("https://example.com/?a=1&b=2");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("does not render unsafe publisher URLs as links", () => {
    const { container } = render(
      <DatasetPublisher
        publisher={'<a href="javascript:alert(1)">Publisher</a>'}
      />
    );

    expect(screen.getByText("Publisher")).toBeTruthy();
    expect(container.querySelector("a")).toBeNull();
  });

  it("renders plain text and strips unexpected markup", () => {
    const { container } = render(
      <DatasetPublisher
        publisher={'Publisher <img src="x" onerror="alert(1)"> &amp; Office'}
      />
    );

    expect(container.textContent).toBe("Publisher  & Office");
    expect(container.querySelector("img")).toBeNull();
  });
});
