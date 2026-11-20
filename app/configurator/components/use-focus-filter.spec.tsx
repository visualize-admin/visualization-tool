import { act, cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { useFocusFilter } from "@/configurator/components/use-focus-filter";

describe("useFocusFilter", () => {
  afterEach(cleanup);

  it("focuses the control of an added filter, not its switch or hidden input", () => {
    render(<Filters />);

    act(() => screen.getByRole("button", { name: "Add Canton" }).click());

    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Canton" })
    );
  });

  it("leaves focus alone when no filter was added", () => {
    render(<Filters />);
    const rerender = screen.getByRole("button", { name: "Rerender" });
    rerender.focus();

    act(() => rerender.click());

    expect(document.activeElement).toBe(rerender);
  });
});

const Filters = () => {
  const [ids, setIds] = useState<string[]>([]);
  const [, setTick] = useState(0);
  const focusFilter = useFocusFilter();

  return (
    <>
      {ids.map((id) => (
        <div key={id} data-rbd-draggable-id={id}>
          <input type="checkbox" aria-label="Interactive: Canton" />
          <input aria-hidden="true" tabIndex={-1} />
          <input aria-label="Canton" />
        </div>
      ))}
      <button
        onClick={() => {
          setIds(["canton"]);
          focusFilter("canton");
        }}
      >
        Add Canton
      </button>
      <button onClick={() => setTick((tick) => tick + 1)}>Rerender</button>
    </>
  );
};
