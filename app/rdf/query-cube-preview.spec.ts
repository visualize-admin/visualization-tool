import rdf from "rdf-ext";
import ParsingClient from "sparql-http-client/ParsingClient";
import { describe, expect, it, vi } from "vitest";

import * as ns from "./namespace";
import { getCubePreview } from "./query-cube-preview";

vi.mock("./extended-cube", () => ({}));

describe("dataset preview", () => {
  const dim = rdf.blankNode();
  const genericDim = rdf.blankNode();
  const measure = rdf.blankNode();
  const observation = rdf.namedNode(
    "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/observation/336>"
  );
  const quads = [
    rdf.quad(
      dim,
      ns.sh.path,
      rdf.namedNode(
        "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/region"
      )
    ),
    rdf.quad(dim, ns.schema.name, rdf.literal("Region")),
    rdf.quad(genericDim, ns.sh.path, ns.schema.name),
    rdf.quad(genericDim, ns.schema.name, rdf.literal("Name")),
    rdf.quad(
      measure,
      ns.sh.path,
      rdf.namedNode(
        "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/level"
      )
    ),
    rdf.quad(measure, ns.schema.name, rdf.literal("Danger ratings")),
    rdf.quad(measure, ns.rdf.type, ns.cube.MeasureDimension),
    rdf.quad(
      observation,
      rdf.namedNode(
        "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/region"
      ),
      rdf.namedNode(
        "https://ld.admin.ch/dimension/bgdi/biota/forestfirewarningregions/1300"
      )
    ),
    rdf.quad(
      observation,
      rdf.namedNode(
        "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/region"
      ),
      rdf.literal("Bern")
    ),
    rdf.quad(
      rdf.namedNode(
        "https://ld.admin.ch/dimension/bgdi/biota/forestfirewarningregions/1300"
      ),
      ns.schema.position,
      rdf.literal("3")
    ),
    rdf.quad(
      observation,
      rdf.namedNode(
        "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/level"
      ),
      rdf.namedNode(
        "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/level/1"
      )
    ),
    rdf.quad(
      observation,
      rdf.namedNode(
        "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/level"
      ),
      rdf.literal("considerable danger")
    ),
  ];
  const sparqlClient = {
    query: {
      construct: async () => Promise.resolve(quads),
    },
  } as any as ParsingClient;

  it("should return correct preview", async () => {
    const { dimensions, measures, observations } = await getCubePreview(
      "awesome iri",
      { sparqlClient, locale: "en", unversionedIri: "awesome iri" }
    );
    const dim = dimensions.find(
      (d) =>
        d.id ===
        "awesome iri(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/region"
    );

    expect(dim?.id).toEqual(
      "awesome iri(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/region"
    );
    expect(dim?.label).toEqual("Region");
    expect(dim?.values).toHaveLength(1);
    expect(dim?.values[0].position).toEqual(3);

    const measure = measures[0];

    expect(measure.id).toEqual(
      "awesome iri(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/level"
    );
    expect(measure.label).toEqual("Danger ratings");

    expect(observations).toHaveLength(1);
    const obs = observations[0];

    expect(obs[dim?.id ?? ""]).toEqual("Bern");
    expect(obs[measure.id]).toEqual("considerable danger");
  });
});
