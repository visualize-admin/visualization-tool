import { describe, expect, it } from "vitest";

import { DataCubeMetadata } from "@/domain/data";
import { makeOpenDataLink } from "@/utils/opendata";

describe("makeOpenDataLink", () => {
  it("should remove creator slug from identifier", () => {
    const orgSuffix = "exampleOrg";
    const cube = {
      identifier: `https://ld.admin.ch/data/123@${orgSuffix}`,
      creator: {
        iri: `https://register.ld.admin.ch/opendataswiss/org/${orgSuffix}`,
      },
      workExamples: ["https://ld.admin.ch/application/opendataswiss"],
    } as DataCubeMetadata;

    expect(makeOpenDataLink("de", cube)).toBe(
      `https://opendata.swiss/de/perma/${encodeURIComponent(`https://ld.admin.ch/data/123@${orgSuffix}`)}`
    );
  });
});
