import { describe, expect, it, vi } from "vitest";

import { getCubeMetadata } from "@/rdf/query-cube-metadata";
import { GROUP_SEPARATOR } from "@/rdf/query-utils";

const term = (value: string) => ({ value }) as any;

const buildRow = (overrides: Record<string, any> = {}) => ({
  iri: term("https://example.com/cube"),
  unversionedIri: term("https://example.com/cube"),
  identifier: term("id"),
  title: term("Title"),
  description: term("Description"),
  version: term("1.0"),
  datePublished: term("2024-01-01"),
  dateModified: term("2024-01-02"),
  status: term("http://publishers.schema.org/Published"),
  themeIris: term(""),
  themeLabels: term(""),
  creatorIri: undefined,
  creatorLabel: undefined,
  creatorAlternateNames: term(""),
  contactPointEmails: term(""),
  contactPointNames: term(""),
  publisher: term("https://example.com/publisher"),
  landingPage: term("https://example.com"),
  expires: term(""),
  workExamples: term(""),
  ...overrides,
});

const mockClient = (row: any, onQuery?: (q: string) => void) =>
  ({
    query: {
      select: vi.fn(async (q: string) => {
        onQuery?.(q);
        return [row];
      }),
    },
  }) as any;

describe("getCubeMetadata creator", () => {
  it("should combine creator name and alternate name", async () => {
    const metadata = await getCubeMetadata("https://example.com/cube", {
      locale: "de",
      sparqlClient: mockClient(
        buildRow({
          creatorIri: term("https://ld.admin.ch/FCh"),
          creatorLabel: term("Bundeskanzlei"),
          creatorAlternateNames: term("BK"),
        })
      ),
    });

    expect(metadata.creator).toEqual({
      iri: "https://ld.admin.ch/FCh",
      label: "Bundeskanzlei BK",
    });
  });

  it("should sort multiple alternate names", async () => {
    const metadata = await getCubeMetadata("https://example.com/cube", {
      locale: "de",
      sparqlClient: mockClient(
        buildRow({
          creatorIri: term("https://ld.admin.ch/office/VI.1.4"),
          creatorLabel: term(
            "Staatssekretariat für Bildung, Forschung und Innovation"
          ),
          creatorAlternateNames: term(["SBFI", "BFI"].join(GROUP_SEPARATOR)),
        })
      ),
    });

    expect(metadata.creator?.label).toBe(
      "Staatssekretariat für Bildung, Forschung und Innovation BFI SBFI"
    );
  });

  it("should keep legacy creator label without alternate names", async () => {
    const metadata = await getCubeMetadata("https://example.com/cube", {
      locale: "de",
      sparqlClient: mockClient(
        buildRow({
          creatorIri: term(
            "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe"
          ),
          creatorLabel: term("Swiss Federal Office of Energy SFOE"),
          creatorAlternateNames: term(""),
        })
      ),
    });

    expect(metadata.creator).toEqual({
      iri: "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-energie-bfe",
      label: "Swiss Federal Office of Energy SFOE",
    });
  });

  it("should return no creator when creator is missing", async () => {
    const metadata = await getCubeMetadata("https://example.com/cube", {
      locale: "de",
      sparqlClient: mockClient(buildRow()),
    });

    expect(metadata.creator).toBeUndefined();
  });

  it("should query both creator graphs", async () => {
    let query = "";
    await getCubeMetadata("https://example.com/cube", {
      locale: "de",
      sparqlClient: mockClient(buildRow(), (q) => (query = q)),
    });

    expect(query).toContain("https://lindas.admin.ch/fch/rvov");
    expect(query).toContain("https://lindas.admin.ch/sfa/opendataswiss");
    expect(query).toContain("schema:alternateName");
    expect(query).toContain("schema:creator");
    expect(query).toContain("dcterms:creator");
  });
});
