import { SELECT } from "@tpluscode/sparql-builder";
import * as React from "react";
import { useEffect, useState } from "react";
import WKT from "terraformer-wkt-parser";
import { Box } from "theme-ui";
import { getInitialConfig } from "../../charts";
import { ChartMapVisualization } from "../../charts/map/chart-map-prototype";
import { AppLayout } from "../../components/layout";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import * as ns from "../../rdf/namespace";
import { sparqlClient } from "../../rdf/sparql-client";
import { useLocale } from "../../src";

function Map() {
  const locale = useLocale();
  const dataSetIri =
    "https://environment.ld.admin.ch/foen/nfi/49-20-None-None/cube/1";

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { locale, iri: dataSetIri },
  });

  const [productionRegions, setProductionRegions] =
    useState<GeoJSON.FeatureCollection>();

  useEffect(() => {
    const productionRegionsQuery = SELECT.ALL.WHERE`
      SERVICE <https://int.lindas.admin.ch/query> {
        ?productionRegion
          ${ns.rdf.type} <https://environment.ld.admin.ch/foen/nfi/UnitOfReference/Prodreg> ;
          ${ns.geo.hasGeometry} ?productionRegionGeometry
      }

      SERVICE <https://ld.geo.admin.ch/query> {
        ?productionRegionGeometry ${ns.geo.asWKT} ?WKTcoords
      }
    `;

    const fetchData = async () => {
      const fetchedProductionRegions = await productionRegionsQuery.execute(
        sparqlClient.query,
        {
          operation: "postUrlencoded",
        }
      );

      const features: Array<GeoJSON.Feature> = fetchedProductionRegions.map(
        (d, i) => {
          const rgb = Math.round((i / fetchedProductionRegions.length) * 200);

          return {
            type: "Feature",
            id: +d.productionRegionGeometry.value.slice(-1),
            properties: {
              color: [rgb, rgb, rgb, 255 / 2],
            },
            geometry: WKT.parse(d.WKTcoords.value),
          };
        }
      );

      setProductionRegions({ type: "FeatureCollection", features });
    };

    fetchData();
  }, []);

  if (data?.dataCubeByIri && productionRegions) {
    const chartConfig = getInitialConfig({
      chartType: "map",
      dimensions: data.dataCubeByIri.dimensions,
      measures: data.dataCubeByIri.measures,
    });

    return (
      <AppLayout>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "minmax(12rem, 20rem) minmax(22rem, 1fr) minmax(12rem, 20rem)",

            width: "100%",
            position: "fixed",
            // FIXME replace 96px with actual header size
            top: "96px",
            height: "calc(100vh - 96px)",
          }}
        >
          <ChartMapVisualization
            dataSetIri={dataSetIri}
            chartConfig={chartConfig}
            queryFilters={chartConfig.filters}
            customShapes={productionRegions}
          />
        </Box>
      </AppLayout>
    );
  } else {
    return null;
  }
}

export default Map;
