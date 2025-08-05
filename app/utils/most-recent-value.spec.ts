import { describe, expect, it } from "vitest";

import { VISUALIZE_MOST_RECENT_VALUE } from "@/domain/most-recent-value";
import { resolveMostRecentValue } from "@/utils/most-recent-value";

describe("resolveMostRecentValue", () => {
  it("should return the value when not VISUALIZE_MOST_RECENT_VALUE", () => {
    const result = resolveMostRecentValue("test-value", undefined);
    expect(result).toBe("test-value");
  });

  it("should return VISUALIZE_MOST_RECENT_VALUE when dimension is undefined", () => {
    const result = resolveMostRecentValue(
      VISUALIZE_MOST_RECENT_VALUE,
      undefined
    );
    expect(result).toBe(VISUALIZE_MOST_RECENT_VALUE);
  });

  it("should return VISUALIZE_MOST_RECENT_VALUE when dimension has no values", () => {
    const dimension = { values: [] };
    const result = resolveMostRecentValue(
      VISUALIZE_MOST_RECENT_VALUE,
      dimension as any
    );
    expect(result).toBe(VISUALIZE_MOST_RECENT_VALUE);
  });

  it("should return the last sorted value when dimension has values", () => {
    const dimension = {
      values: [
        { value: "2020", label: "2020" },
        { value: "2022", label: "2022" },
        { value: "2021", label: "2021" },
      ],
    };
    const result = resolveMostRecentValue(
      VISUALIZE_MOST_RECENT_VALUE,
      dimension as any
    );
    expect(result).toBe("2022");
  });
});
