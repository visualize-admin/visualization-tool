import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useStableIds } from "@/utils/use-stable-ids";

describe("useStableIds", () => {
  it("keeps the same array while the ids stay the same", () => {
    const { result, rerender } = renderHook(
      (props: { ids: string[] }) => useStableIds(props.ids),
      { initialProps: { ids: ["a", "b"] } }
    );
    const first = result.current;
    rerender({ ids: ["a", "b"] });

    expect(result.current).toBe(first);

    rerender({ ids: ["a", "c"] });

    expect(result.current).toEqual(["a", "c"]);
  });

  it("returns an empty array without ids", () => {
    const { result } = renderHook(() => useStableIds([]));

    expect(result.current).toEqual([]);
  });
});
