import { ParsedWMSLayer, parseWMSContent } from "@/charts/map/wms-utils";
import { parseWMTSContent } from "@/charts/map/wmts-utils";
import { readFile } from "fs/promises";
import { join } from "path";

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
    "children": Array [
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 1,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=1",
        "title": "J - Constructed, industrial and other artificial habitats",
        "type": "wms",
      },
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 2,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=2",
        "title": "I - Regularly or recently cultivated agricultural horticultural and domestic habitats",
        "type": "wms",
      },
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 3,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=3",
        "title": "H - Inland unvegetated or sparsely vegetated habitats",
        "type": "wms",
      },
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 4,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=4",
        "title": "G - Woodland, forest and other wooded land",
        "type": "wms",
      },
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 5,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=5",
        "title": "F - Heathland, scrub and tundra",
        "type": "wms",
      },
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 6,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=6",
        "title": "E - Grasslands and land dominated by forbs, mosses or lichens",
        "type": "wms",
      },
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 7,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=7",
        "title": "D - Mires, bogs and fens",
        "type": "wms",
      },
    ],
    "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
    "description": "",
    "endpoint": "http://example.com/wms",
    "id": undefined,
    "legendUrl": undefined,
    "title": "Terrestrial ecosystems",
    "type": "wms",
  },
  Object {
    "children": Array [
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 9,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=9",
        "title": "C - Inland surface waters",
        "type": "wms",
      },
    ],
    "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
    "description": "",
    "endpoint": "http://example.com/wms",
    "id": undefined,
    "legendUrl": undefined,
    "title": "Fresh water ecosystems",
    "type": "wms",
  },
  Object {
    "children": Array [
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 11,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=11",
        "title": "B - Coastal habitats",
        "type": "wms",
      },
      Object {
        "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
        "description": "",
        "endpoint": "http://example.com/wms",
        "id": 12,
        "legendUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=12",
        "title": "A - Marine habitats",
        "type": "wms",
      },
    ],
    "dataUrl": "https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?",
    "description": "",
    "endpoint": "http://example.com/wms",
    "id": undefined,
    "legendUrl": undefined,
    "title": "Marine ecosystems ",
    "type": "wms",
  },
]
`);
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
  });
});
