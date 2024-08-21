/*
 * Creator: Playwright 1.44.1
 * Browser: chromium 125.0.6422.26
 */

import { group, sleep } from "k6";
import http from "k6/http";

export const options = {};

export default function main() {
  let response;

  const BASE_URL = `https://visualization-tool-lutpgivlt-ixt1.vercel.app`;

  group(
    "page@f36fd84b9eafb3bfd240ae775b3bbfb7 - visualize.admin.ch",
    function () {
      response = http.get(`${BASE_URL}/en/v/Dp4wxjJwE4bz`, {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "en-US",
          priority: "u=0, i",
          "sec-ch-ua":
            '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
        },
      });

      response = http.get(
        "https://visualization-tool-lutpgivlt-ixt1.vercel.app/api/client-env",
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            priority: "u=1",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "script",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "same-origin",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
          },
        }
      );

      response = http.get(`${BASE_URL}/api/auth/session`, {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "en-US",
          baggage:
            "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
          "content-type": "application/json",
          priority: "u=1, i",
          referer:
            "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
          "sec-ch-ua":
            '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
        },
      });

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H1"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H1"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H1"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "PossibleFilters"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeMetadata($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeMetadataFilter!) {\\n  dataCubeMetadata(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeMetadata","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton"}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeMetadata"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"]}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H1"}}}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeObservations"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H1"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C4"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C4"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C4"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "PossibleFilters"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C4"}}}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeObservations"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C4"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H6"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H6"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H6"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "PossibleFilters"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H6"}}}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeObservations"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H6"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "PossibleFilters"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"}}}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeObservations"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/C2"}},"loadValues":true}}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "content-type": "application/json",
            cookie:
              "__Host-next-auth.csrf-token=bd3f4cdcc069f3b204e7c62847d4ebd635e38a1bcfaba57c1dd5366caeb617da%7C02f9a5dd9de49804f2328c0b6d939a289afc2cb7ea4994c16d8180b679797f71; __Secure-next-auth.callback-url=https%3A%2F%2Fvisualization-tool-lutpgivlt-ixt1.vercel.app",
            priority: "u=1, i",
            referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "x-visualize-cache-control": "",
            "x-visualize-debug": "",
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/product"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"}},"loadValues":true}}}',
        {
          headers: {
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "content-type": "application/json",
            Referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "sec-ch-ua-platform": '"Windows"',
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"}},"loadValues":true}}}',
        {
          headers: {
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "content-type": "application/json",
            Referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "sec-ch-ua-platform": '"Windows"',
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"}}},"filterKey":"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product, https://energy.ld.admin.ch/elcom/electricityprice/dimension/category"}}',
        {
          headers: {
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "content-type": "application/json",
            Referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "sec-ch-ua-platform": '"Windows"',
          },

          "tags": {
            "graphqlQuery": "PossibleFilters"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {\\n  dataCubeObservations(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeObservations","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"}}}}}',
        {
          headers: {
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "content-type": "application/json",
            Referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "sec-ch-ua-platform": '"Windows"',
          },

          "tags": {
            "graphqlQuery": "DataCubeObservations"
          }
        }
      );

      response = http.post(
        `${BASE_URL}/api/graphql`,
        '{"query":"query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {\\n  dataCubeComponents(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    cubeFilter: $cubeFilter\\n  )\\n}\\n","operationName":"DataCubeComponents","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas-cached.cluster.ldbar.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/elcom/electricityprice-canton","componentIris":["https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton","https://energy.ld.admin.ch/elcom/electricityprice/dimension/category","https://energy.ld.admin.ch/elcom/electricityprice/dimension/period","https://energy.ld.admin.ch/elcom/electricityprice/dimension/product","https://energy.ld.admin.ch/elcom/electricityprice/dimension/total"],"filters":{"https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton":{"type":"multi","values":{"https://ld.admin.ch/canton/1":true,"https://ld.admin.ch/canton/2":true,"https://ld.admin.ch/canton/3":true,"https://ld.admin.ch/canton/4":true,"https://ld.admin.ch/canton/5":true,"https://ld.admin.ch/canton/6":true,"https://ld.admin.ch/canton/7":true,"https://ld.admin.ch/canton/8":true,"https://ld.admin.ch/canton/9":true,"https://ld.admin.ch/canton/10":true,"https://ld.admin.ch/canton/11":true,"https://ld.admin.ch/canton/12":true,"https://ld.admin.ch/canton/13":true,"https://ld.admin.ch/canton/14":true,"https://ld.admin.ch/canton/15":true,"https://ld.admin.ch/canton/16":true,"https://ld.admin.ch/canton/17":true,"https://ld.admin.ch/canton/18":true,"https://ld.admin.ch/canton/19":true,"https://ld.admin.ch/canton/20":true,"https://ld.admin.ch/canton/21":true,"https://ld.admin.ch/canton/22":true,"https://ld.admin.ch/canton/23":true,"https://ld.admin.ch/canton/24":true,"https://ld.admin.ch/canton/25":true,"https://ld.admin.ch/canton/26":true}},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":{"to":"2023","from":"2018","type":"range"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest"},"https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":{"type":"single","value":"https://energy.ld.admin.ch/elcom/electricityprice/category/H8"}},"loadValues":true}}}',
        {
          headers: {
            "sec-ch-ua":
              '"HeadlessChrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            "Accept-Language": "en-US",
            "sec-ch-ua-mobile": "?0",
            "x-visualize-cache-control": "",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.26 Safari/537.36",
            "content-type": "application/json",
            Referer:
              "https://visualization-tool-lutpgivlt-ixt1.vercel.app/en/v/Dp4wxjJwE4bz",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=vercel,sentry-release=visualization-tool%40v4.7.4,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=ee802d00094e4c389ee936d24bd5cc5f",
            "sentry-trace": "ee802d00094e4c389ee936d24bd5cc5f-85907776c59f1b52",
            "sec-ch-ua-platform": '"Windows"',
          },

          "tags": {
            "graphqlQuery": "DataCubeComponents"
          }
        }
      );
    }
  );

  // Automatically added sleep
  sleep(1);
}
