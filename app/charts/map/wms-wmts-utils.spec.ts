import { readFile } from "fs/promises";
import { join } from "path";

import { parseWMSContent, RemoteWMSLayer } from "@/charts/map/wms-utils";
import { parseWMTSContent } from "@/charts/map/wmts-utils";

const formatTree = <TNode extends { children?: TNode[] }>(
  node: TNode,
  getLabel: (node: TNode) => string,
  depth = 0
): string => {
  return `${Array.from({ length: depth })
    .map(() => "     ")
    .join("")}${getLabel(node)}${
    node.children
      ? `
${node.children.map((c) => formatTree(c, getLabel, depth + 1)).join("\n")}`
      : ""
  }`;
};

const formatLayerTree = (layer: RemoteWMSLayer) =>
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

    expect(parsedLayers[0]).toMatchInlineSnapshot(`
Object {
  "attribution": "GIS-Zentrum Stadt Zuerich",
  "availableDimensionValues": undefined,
  "defaultDimensionValue": undefined,
  "description": "",
  "dimensionIdentifier": undefined,
  "endpoint": "http://example.com/wms",
  "id": "_GDP__Inventar_der_schuetzenswerten_Gaerten_und_Anlagen_von_kommunaler_Bedeutung_der_Stadt_Zuerich",
  "legendUrl": undefined,
  "path": "_GDP__Inventar_der_schuetzenswerten_Gaerten_und_Anlagen_von_kommunaler_Bedeutung_der_Stadt_Zuerich",
  "tileMatrixSet": Object {
    "id": "ktzh",
    "supportedCRS": Array [
      "EPSG:2056",
    ],
    "tileMatrixes": Array [
      Object {
        "id": 0,
        "matrixHeight": 8,
        "matrixWidth": 11,
        "scaleDenominator": 241904.76190464283,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 1,
        "matrixHeight": 15,
        "matrixWidth": 22,
        "scaleDenominator": 120952.38095249998,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 2,
        "matrixHeight": 30,
        "matrixWidth": 43,
        "scaleDenominator": 60476.19047607142,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 3,
        "matrixHeight": 59,
        "matrixWidth": 85,
        "scaleDenominator": 30238.095238214282,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 4,
        "matrixHeight": 118,
        "matrixWidth": 170,
        "scaleDenominator": 15119.04761892857,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 5,
        "matrixHeight": 235,
        "matrixWidth": 339,
        "scaleDenominator": 7559.523809642857,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 6,
        "matrixHeight": 469,
        "matrixWidth": 677,
        "scaleDenominator": 3779.7619046428567,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 7,
        "matrixHeight": 937,
        "matrixWidth": 1354,
        "scaleDenominator": 1889.8809525,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 8,
        "matrixHeight": 1874,
        "matrixWidth": 2707,
        "scaleDenominator": 944.9404760714285,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 9,
        "matrixHeight": 3748,
        "matrixWidth": 5413,
        "scaleDenominator": 472.4702382142857,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
      Object {
        "id": 10,
        "matrixHeight": 7495,
        "matrixWidth": 10825,
        "scaleDenominator": 236.2351189285714,
        "tileHeight": 512,
        "tileWidth": 512,
        "topLeftCorner": Array [
          2480237,
          1315832,
        ],
      },
    ],
  },
  "title": "_GDP__Inventar_der_schuetzenswerten_Gaerten_und_Anlagen_von_kommunaler_Bedeutung_der_Stadt_Zuerich",
  "type": "wmts",
  "url": "https://www.ogd.stadt-zuerich.ch/mapproxy/wmts/1.0.0/_GDP__Inventar_der_schuetzenswerten_Gaerten_und_Anlagen_von_kommunaler_Bedeutung_der_Stadt_Zuerich/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
}
`);
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
  "tileMatrixSet": Object {
    "id": "3857_16",
    "supportedCRS": Array [
      "urn:ogc:def:crs:EPSG:3857",
    ],
    "tileMatrixes": Array [
      Object {
        "id": 0,
        "matrixHeight": 1,
        "matrixWidth": 1,
        "scaleDenominator": 559082264.0287178,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 1,
        "matrixHeight": 2,
        "matrixWidth": 2,
        "scaleDenominator": 279541132.0143589,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 2,
        "matrixHeight": 4,
        "matrixWidth": 4,
        "scaleDenominator": 139770566.00717944,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 3,
        "matrixHeight": 8,
        "matrixWidth": 8,
        "scaleDenominator": 69885283.00358972,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 4,
        "matrixHeight": 16,
        "matrixWidth": 16,
        "scaleDenominator": 34942641.50179486,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 5,
        "matrixHeight": 32,
        "matrixWidth": 32,
        "scaleDenominator": 17471320.75089743,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 6,
        "matrixHeight": 64,
        "matrixWidth": 64,
        "scaleDenominator": 8735660.375448715,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 7,
        "matrixHeight": 128,
        "matrixWidth": 128,
        "scaleDenominator": 4367830.1877243575,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 8,
        "matrixHeight": 256,
        "matrixWidth": 256,
        "scaleDenominator": 2183915.0938621787,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 9,
        "matrixHeight": 512,
        "matrixWidth": 512,
        "scaleDenominator": 1091957.5469310894,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 10,
        "matrixHeight": 1024,
        "matrixWidth": 1024,
        "scaleDenominator": 545978.7734655447,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 11,
        "matrixHeight": 2048,
        "matrixWidth": 2048,
        "scaleDenominator": 272989.38673277234,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 12,
        "matrixHeight": 4096,
        "matrixWidth": 4096,
        "scaleDenominator": 136494.69336638617,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 13,
        "matrixHeight": 8192,
        "matrixWidth": 8192,
        "scaleDenominator": 68247.34668319309,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 14,
        "matrixHeight": 16384,
        "matrixWidth": 16384,
        "scaleDenominator": 34123.67334159654,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 15,
        "matrixHeight": 32768,
        "matrixWidth": 32768,
        "scaleDenominator": 17061.83667079827,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
      Object {
        "id": 16,
        "matrixHeight": 65536,
        "matrixWidth": 65536,
        "scaleDenominator": 8530.918335399136,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          -20037508.342789244,
          20037508.342789244,
        ],
      },
    ],
  },
  "title": "Wetness potential agricultural land",
  "type": "wmts",
  "url": "https://wmts.geo.admin.ch/1.0.0/ch.agroscope.feuchtflaechenpotential-kulturlandschaft/default/{Time}/3857/{TileMatrix}/{TileCol}/{TileRow}.png",
}
`);
  });

  it("should parse WMTS capabilities XML content  (Topographic_Map_Switzerland)", async () => {
    const xmlContent = (
      await readFile(
        join(__dirname, "./mocks/Topographic_Map_Switzerland.wmts.xml")
      )
    ).toString();

    const endpoint = "http://example.com/wms";
    const parsedLayers = await parseWMTSContent(xmlContent, endpoint);
    expect(parsedLayers.length).toBe(1);
    expect(parsedLayers[0]).toMatchInlineSnapshot(`
Object {
  "attribution": undefined,
  "availableDimensionValues": undefined,
  "defaultDimensionValue": undefined,
  "description": undefined,
  "dimensionIdentifier": undefined,
  "endpoint": "http://example.com/wms",
  "id": "Topographic_Map_Switzerland",
  "legendUrl": undefined,
  "path": "Topographic_Map_Switzerland",
  "tileMatrixSet": Object {
    "id": "default028mm",
    "supportedCRS": Array [
      "urn:ogc:def:crs:EPSG::2056",
    ],
    "tileMatrixes": Array [
      Object {
        "id": 0,
        "matrixHeight": 2,
        "matrixWidth": 3,
        "scaleDenominator": 2321434.240717188,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 1,
        "matrixHeight": 3,
        "matrixWidth": 4,
        "scaleDenominator": 1785719.0101449008,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 2,
        "matrixHeight": 5,
        "matrixWidth": 7,
        "scaleDenominator": 892859.0326012673,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 3,
        "matrixHeight": 11,
        "matrixWidth": 17,
        "scaleDenominator": 357143.8020289801,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 4,
        "matrixHeight": 22,
        "matrixWidth": 33,
        "scaleDenominator": 178571.4285433071,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 5,
        "matrixHeight": 54,
        "matrixWidth": 81,
        "scaleDenominator": 71429.1383827424,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 6,
        "matrixHeight": 108,
        "matrixWidth": 162,
        "scaleDenominator": 35714.09672018824,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 7,
        "matrixHeight": 215,
        "matrixWidth": 324,
        "scaleDenominator": 17857.52083127708,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 8,
        "matrixHeight": 430,
        "matrixWidth": 647,
        "scaleDenominator": 8928.76041563854,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 9,
        "matrixHeight": 537,
        "matrixWidth": 809,
        "scaleDenominator": 7142.819344037647,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 10,
        "matrixHeight": 1074,
        "matrixWidth": 1617,
        "scaleDenominator": 3571.8821432017867,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 11,
        "matrixHeight": 2147,
        "matrixWidth": 3233,
        "scaleDenominator": 1785.9410716008933,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
      Object {
        "id": 12,
        "matrixHeight": 4293,
        "matrixWidth": 6466,
        "scaleDenominator": 892.9705358004467,
        "tileHeight": 256,
        "tileWidth": 256,
        "topLeftCorner": Array [
          2420000,
          1350000,
        ],
      },
    ],
  },
  "title": "Topographic_Map_Switzerland",
  "type": "wmts",
  "url": "https://tiles.arcgis.com/tiles/oPre3pOfRfefL8y0/arcgis/rest/services/Topographic_Map_Switzerland/MapServer/WMTS/tile/1.0.0/Topographic_Map_Switzerland/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
}
`);
  });
});
