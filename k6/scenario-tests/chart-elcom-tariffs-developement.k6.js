/*
 * Creator: Playwright 1.44.1
 * Browser: chromium 125.0.6422.26
 */

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { group } from "k6";
import http from "k6/http";

export const options = {
  vus: 20,
  duration: "5m",
  ext: {
    loadimpact: {
      distribution: {
        "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
      },
    },
  },
};

const BASE_URL = `https://visualization-tool-lutpgivlt-ixt1.vercel.app`;
const HOST = BASE_URL.replace(/^https?:\/\//, "");

export default function main() {
  let response;

  group(
    "page@bcf0cb492a3e543bdda97a3e8902e704 - visualize.admin.ch",
    function () {
      response = http.get(`${BASE_URL}/api/auth/session`, {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          "Content-Type": "application/json",
          Host: HOST,
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          baggage:
            "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=14ee0c67baf24e229764bf29b5f72dbf,sentry-sample_rate=0.1,sentry-transaction=%2Fv%2F%5BchartId%5D,sentry-sampled=false",
          "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sentry-trace": "14ee0c67baf24e229764bf29b5f72dbf-a5b39efa34383d48-0",
        },
      });

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H4"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=14ee0c67baf24e229764bf29b5f72dbf,sentry-sample_rate=0.1,sentry-transaction=%2Fv%2F%5BchartId%5D,sentry-sampled=false",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace":
              "14ee0c67baf24e229764bf29b5f72dbf-a4e66ebda95f4037-0",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H4"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=14ee0c67baf24e229764bf29b5f72dbf,sentry-sample_rate=0.1,sentry-transaction=%2Fv%2F%5BchartId%5D,sentry-sampled=false",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace":
              "14ee0c67baf24e229764bf29b5f72dbf-997ac37cf45fe5bb-0",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H4"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category, https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator, https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=14ee0c67baf24e229764bf29b5f72dbf,sentry-sample_rate=0.1,sentry-transaction=%2Fv%2F%5BchartId%5D,sentry-sampled=false",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace":
              "14ee0c67baf24e229764bf29b5f72dbf-b7aebe7250fcf47e-0",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "PossibleFilters",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeMetadata($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeMetadataFilter!) {\\n  dataCubeMetadata(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeMetadata","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice"}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=14ee0c67baf24e229764bf29b5f72dbf,sentry-sample_rate=0.1,sentry-transaction=%2Fv%2F%5BchartId%5D,sentry-sampled=false",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace":
              "14ee0c67baf24e229764bf29b5f72dbf-b5ea83e35924bec6-0",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeMetadata",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"]}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=14ee0c67baf24e229764bf29b5f72dbf,sentry-sample_rate=0.1,sentry-transaction=%2Fv%2F%5BchartId%5D,sentry-sampled=false",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace":
              "14ee0c67baf24e229764bf29b5f72dbf-87d4c0cac1d73cfc-0",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H4"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeObservations",
          },
        }
      );

      http.response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H4"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C5"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C5"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C5"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category, https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator, https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "PossibleFilters",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C5"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeObservations",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C5"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category, https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator, https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "PossibleFilters",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeObservations",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H5"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H5"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H5"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category, https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator, https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "PossibleFilters",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H5"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeObservations",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H5"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C3"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C3"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C3"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category, https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator, https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "PossibleFilters",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C3"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeObservations",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C3"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}},"loadValues":true}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: HOST,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"}},"loadValues":true}}}',
        {
          headers: {
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "content-type": "application/json",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "sec-ch-ua-platform": '"Windows"',
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"}},"loadValues":true}}}',
        {
          headers: {
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "content-type": "application/json",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "sec-ch-ua-platform": '"Windows"',
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category, https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator, https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality"}}',
        {
          headers: {
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "content-type": "application/json",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "sec-ch-ua-platform": '"Windows"',
          },

          tags: {
            graphqlQuery: "PossibleFilters",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}}}}}',
        {
          headers: {
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "content-type": "application/json",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "sec-ch-ua-platform": '"Windows"',
          },

          tags: {
            graphqlQuery: "DataCubeObservations",
          },
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"de","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality","https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/standard"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/operator/486"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":{"type":"single","value":"https://ld.admin.ch/municipality/1"}},"loadValues":true}}}',
        {
          headers: {
            "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "content-type": "application/json",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=332dd46783ce4a73b25fbb806c2c18da",
            "sentry-trace": "332dd46783ce4a73b25fbb806c2c18da-a6c1191c2079f2a2",
            "sec-ch-ua-platform": '"Windows"',
          },

          tags: {
            graphqlQuery: "DataCubeComponents",
          },
        }
      );
    }
  );
}

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}
