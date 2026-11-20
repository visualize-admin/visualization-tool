import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveRegion } from "@/components/live-region";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("LiveRegion", () => {
  it("renders a polite, atomic status region", () => {
    render(<LiveRegion message="" />);
    const region = screen.getByRole("status");

    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.getAttribute("aria-atomic")).toBe("true");
  });

  it("does not announce the initial message, even in StrictMode", () => {
    render(
      <StrictMode>
        <LiveRegion message="10 results" />
      </StrictMode>
    );
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("announces a changed message only after the delay", () => {
    const { rerender } = render(
      <LiveRegion message="10 results" delay={500} />
    );
    rerender(<LiveRegion message="3 results" delay={500} />);

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(screen.getByRole("status").textContent).toBe("");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole("status").textContent).toBe("3 results");
  });

  it("only announces the last message of a quick succession", () => {
    const { rerender } = render(<LiveRegion message="10 results" />);
    rerender(<LiveRegion message="5 results" />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender(<LiveRegion message="1 result" />);
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("status").textContent).toBe("1 result");
  });

  it("announces a message that changes back to the initial one", () => {
    const { rerender } = render(<LiveRegion message="A" />);
    rerender(<LiveRegion message="B" />);
    act(() => {
      vi.runAllTimers();
    });
    rerender(<LiveRegion message="A" />);
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("status").textContent).toBe("A");
  });

  it("keeps a pending announcement when the delay changes", () => {
    const { rerender } = render(<LiveRegion message="A" delay={500} />);
    rerender(<LiveRegion message="B" delay={500} />);
    rerender(<LiveRegion message="B" delay={300} />);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole("status").textContent).toBe("B");
  });

  it("cancels a pending announcement on unmount", () => {
    const { rerender, unmount } = render(<LiveRegion message="A" />);
    rerender(<LiveRegion message="B" />);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
