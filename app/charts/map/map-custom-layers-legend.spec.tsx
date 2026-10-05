import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CustomLayerDescription } from "@/charts/map/map-custom-layers-legend";
import { parseWMSContent } from "@/charts/map/wms-utils";

afterEach(cleanup);

// Reproduces an attacker-controlled GetCapabilities document whose <Abstract>
// carries an XSS payload next to legitimate formatting.
const CAPABILITIES = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0">
  <Service><Title>probe</Title></Service>
  <Capability>
    <Request>
      <GetMap>
        <DCPType><HTTP><Get>
          <OnlineResource xlink:href="https://attacker.example/wms?"/>
        </Get></HTTP></DCPType>
      </GetMap>
    </Request>
    <Layer>
      <Title>root</Title>
      <Layer queryable="1">
        <Name>x-probe-layer</Name>
        <Title>Probe</Title>
        <Abstract><![CDATA[<img src="x" onerror="alert(document.domain)"> Provided by <b>Swisstopo</b>, see <a href="https://example.com/info">details</a>.]]></Abstract>
        <CRS>EPSG:3857</CRS>
      </Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`;

describe("CustomLayerDescription", () => {
  it("strips dangerous markup from WMS layer descriptions", () => {
    const { container } = render(
      <CustomLayerDescription description='<img src="x" onerror="alert(document.domain)">' />
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.innerHTML).not.toContain("onerror");
  });

  it("keeps the formatting of WMS layer descriptions", () => {
    const { container } = render(
      <CustomLayerDescription description='<p>Data by <b>Swisstopo</b>, see <a href="https://example.com/info">details</a>.</p>' />
    );

    expect(container.querySelector("b")?.textContent).toBe("Swisstopo");

    const link = screen.getByRole("link", { name: "details" });
    expect(link.getAttribute("href")).toBe("https://example.com/info");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders a hostile WMS abstract without executing it", () => {
    const layers = parseWMSContent(
      CAPABILITIES,
      "https://attacker.example/wms"
    );
    const description = layers.find(
      (d) => d.id === "x-probe-layer"
    )?.description;

    expect(description).toContain("onerror");

    const { container } = render(
      <CustomLayerDescription description={description ?? ""} />
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.innerHTML).not.toContain("onerror");
    expect(container.querySelector("b")?.textContent).toBe("Swisstopo");
    expect(
      screen.getByRole("link", { name: "details" }).getAttribute("href")
    ).toBe("https://example.com/info");
  });
});
