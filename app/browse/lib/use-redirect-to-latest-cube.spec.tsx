import { renderHook } from "@testing-library/react";
import { NextRouter, useRouter } from "next/router";
import { describe, expect, it, Mock, vi } from "vitest";

import { useRedirectToLatestCube } from "@/browse/lib/use-redirect-to-latest-cube";
import { useLocale } from "@/locales/use-locale";
import { queryLatestCubeIri } from "@/rdf/query-latest-cube-iri";
import { sleep } from "@/utils/sleep";

vi.mock("@/rdf/query-latest-cube-iri", () => ({
  queryLatestCubeIri: vi.fn(),
}));

vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/locales/use-locale", () => ({
  useLocale: vi.fn(),
}));

describe("use redirect to versioned cube", () => {
  const setup = async ({
    versionedCube,
    datasetIri,
  }: {
    datasetIri: string;
    versionedCube: undefined | string;
  }) => {
    const router = {
      route: "",
      pathname: "",
      query: {},
      asPath: "",
      basePath: "",
      isLocaleDomain: true,
      isReady: true,
      replace: vi.fn(async () => true),
    } as unknown as NextRouter;
    (useRouter as Mock<typeof useRouter>).mockReturnValue(router);
    (useLocale as Mock<typeof useLocale>).mockReturnValue("de");
    (queryLatestCubeIri as Mock<typeof queryLatestCubeIri>).mockImplementation(
      async () => versionedCube
    );

    renderHook(() =>
      useRedirectToLatestCube({
        datasetIri,
        dataSource: {
          type: "sparql",
          url: "https://int.lindas.admin.ch/query",
        },
      })
    );

    // Wait for effects to have finished
    await sleep(1);

    return { router };
  };

  it("should redirect to versioned IRI if initial cube IRI does not seem to be versioned", async () => {
    const { router } = await setup({
      datasetIri:
        "https://environment.ld.admin.ch/foen/nfi/49-19-None-None-44/cube",
      versionedCube: "https://versioned-cube",
    });
    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/browse",
      query: {
        dataset: "https://versioned-cube",
      },
    });
  });

  it("should redirect to versioned IRI if initial cube IRI does not seem to be versioned 2", async () => {
    const { router } = await setup({
      datasetIri: "https://environment.ld.admin.ch/foen/ubd000501",
      versionedCube: "https://versioned-cube2",
    });
    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/browse",
      query: {
        dataset: "https://versioned-cube2",
      },
    });
  });
});
