import { readFile } from "fs/promises";
import { join } from "path";

import { ParsedWMSLayer, parseWMSContent } from "@/charts/map/wms-utils";
import { parseWMTSContent } from "@/charts/map/wmts-utils";

const formatTree = <TNode extends { children?: TNode[] }>(
  node: TNode,
  getLabel: (node: TNode) => string,
  depth = 0
): string => {
  return `${Array.from({ length: depth })
    .map((x) => "     ")
    .join("")}${getLabel(node)}${
    node.children
      ? `
${node.children.map((c) => formatTree(c, getLabel, depth + 1)).join("\n")}`
      : ""
  }`;
};

const formatLayerTree = (layer: ParsedWMSLayer) =>
  formatTree(layer, (layer) => layer.title);

describe("parseWMSContent", () => {
  it("should parse WMS capabilities XML content", async () => {
    const xmlContent = (
      await readFile(join(__dirname, "./mocks/bio-discomap.wms.xml"))
    ).toString();

    const endpoint = "http://example.com/wms";
    const parsedLayers = await parseWMSContent(xmlContent, endpoint);

    expect(parsedLayers).toHaveLength(3);
    expect(formatLayerTree(parsedLayers[0])).toMatchInlineSnapshot(`
"Terrestrial ecosystems
     J - Constructed, industrial and other artificial habitats
     I - Regularly or recently cultivated agricultural horticultural and domestic habitats
     H - Inland unvegetated or sparsely vegetated habitats
     G - Woodland, forest and other wooded land
     F - Heathland, scrub and tundra
     E - Grasslands and land dominated by forbs, mosses or lichens
     D - Mires, bogs and fens"
`);

    expect(formatLayerTree(parsedLayers[1])).toMatchInlineSnapshot(`
"Fresh water ecosystems
     C - Inland surface waters"
`);

    expect(formatLayerTree(parsedLayers[2])).toMatchInlineSnapshot(`
"Marine ecosystems 
     B - Coastal habitats
     A - Marine habitats"
`);
    expect(parsedLayers).toMatchInlineSnapshot(`
Array [
  Object {
    "attribution": "EUNIS Ecosystems",
    "children": Array [
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 1,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=1",
        "path": "/Terrestrial ecosystems/1",
        "title": "J - Constructed, industrial and other artificial habitats",
        "type": "wms",
      },
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 2,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=2",
        "path": "/Terrestrial ecosystems/2",
        "title": "I - Regularly or recently cultivated agricultural horticultural and domestic habitats",
        "type": "wms",
      },
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 3,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=3",
        "path": "/Terrestrial ecosystems/3",
        "title": "H - Inland unvegetated or sparsely vegetated habitats",
        "type": "wms",
      },
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 4,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=4",
        "path": "/Terrestrial ecosystems/4",
        "title": "G - Woodland, forest and other wooded land",
        "type": "wms",
      },
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 5,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=5",
        "path": "/Terrestrial ecosystems/5",
        "title": "F - Heathland, scrub and tundra",
        "type": "wms",
      },
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 6,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=6",
        "path": "/Terrestrial ecosystems/6",
        "title": "E - Grasslands and land dominated by forbs, mosses or lichens",
        "type": "wms",
      },
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 7,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=7",
        "path": "/Terrestrial ecosystems/7",
        "title": "D - Mires, bogs and fens",
        "type": "wms",
      },
    ],
    "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
    "description": "",
    "endpoint": "http://example.com/wms",
    "id": undefined,
    "legendUrl": undefined,
    "path": "/Terrestrial ecosystems",
    "title": "Terrestrial ecosystems",
    "type": "wms",
  },
  Object {
    "attribution": "EUNIS Ecosystems",
    "children": Array [
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 9,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=9",
        "path": "/Fresh water ecosystems/9",
        "title": "C - Inland surface waters",
        "type": "wms",
      },
    ],
    "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
    "description": "",
    "endpoint": "http://example.com/wms",
    "id": undefined,
    "legendUrl": undefined,
    "path": "/Fresh water ecosystems",
    "title": "Fresh water ecosystems",
    "type": "wms",
  },
  Object {
    "attribution": "EUNIS Ecosystems",
    "children": Array [
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 11,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=11",
        "path": "/Marine ecosystems /11",
        "title": "B - Coastal habitats",
        "type": "wms",
      },
      Object {
        "attribution": "EUNIS Ecosystems",
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 12,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=12",
        "path": "/Marine ecosystems /12",
        "title": "A - Marine habitats",
        "type": "wms",
      },
    ],
    "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
    "description": "",
    "endpoint": "http://example.com/wms",
    "id": undefined,
    "legendUrl": undefined,
    "path": "/Marine ecosystems ",
    "title": "Marine ecosystems ",
    "type": "wms",
  },
]
`);
  });

  it("should parse WMTS capabilities XML content  (geo-admin)", async () => {
    const xmlContent = (
      await readFile(join(__dirname, "./mocks/geo-admin.wms.xml"))
    ).toString();

    const endpoint = "http://example.com/wms";
    const parsedLayers = await parseWMSContent(xmlContent, endpoint);
    expect(parsedLayers.length).toBe(830);

    const ccsLayer = parsedLayers.find((x) => x.title === "CCS military");
    expect(ccsLayer).not.toBeUndefined();
    // Check if the layer only child has be correctly hoisted
    expect(ccsLayer?.children).toBeUndefined();
  });
});

describe("parseWMTSContent", () => {
  it("should parse WMTS capabilities XML content (zh)", async () => {
    const xmlContent = (
      await readFile(join(__dirname, "./mocks/zh.wmts.xml"))
    ).toString();

    const endpoint = "http://example.com/wms";
    const parsedLayers = await parseWMTSContent(xmlContent, endpoint);
    expect(parsedLayers.length).toBe(274);
  });

  it("should parse WMTS capabilities XML content  (geo-admin)", async () => {
    const xmlContent = (
      await readFile(join(__dirname, "./mocks/geo-admin.wmts.xml"))
    ).toString();

    const endpoint = "http://example.com/wms";
    const parsedLayers = await parseWMTSContent(xmlContent, endpoint);
    expect(parsedLayers.length).toBe(652);
    expect(parsedLayers.every((l) => l.dimensionIdentifier)).toBe(true);
    expect(parsedLayers[0]).toMatchInlineSnapshot(`
Object {
  "attribution": "Federal Office of Topography swisstopo",
  "availableDimensionValues": Array [
    "current",
  ],
  "defaultDimensionValue": "current",
  "description": "-",
  "dimensionIdentifier": "Time",
  "endpoint": "http://example.com/wms",
  "id": "ch.agroscope.feuchtflaechenpotential-kulturlandschaft",
  "legendUrl": "https://api3.geo.admin.ch/static/images/legends/ch.agroscope.feuchtflaechenpotential-kulturlandschaft_en.png",
  "path": "ch.agroscope.feuchtflaechenpotential-kulturlandschaft",
  "title": "Wetness potential agricultural land",
  "type": "wmts",
  "url": "https://wmts.geo.admin.ch/1.0.0/ch.agroscope.feuchtflaechenpotential-kulturlandschaft/default/{Time}/3857/{TileMatrix}/{TileCol}/{TileRow}.png",
}
`);
  });
});
