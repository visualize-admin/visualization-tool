/*
 * Creator: Playwright 1.32.1
 * Browser: chromium 112.0.5615.29
 */

import { group, sleep } from "k6";
import http from "k6/http";

import { DISTRIBUTION, PROJECT_ID } from "../../../k6-utils.js";

const enableCache = __ENV.ENABLE_GQL_SERVER_SIDE_CACHE === "true";
const cache = enableCache ? "cache" : "no-cache";

/** @type {import("k6/options").Options} */
export const options = {
  duration: "60s",
  vus: 10,
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
  ext: {
    loadimpact: {
      projectId: PROJECT_ID,
      name: `HAR - Edition (TEST, GQL ${cache})`,
      distribution: DISTRIBUTION,
    },
  },
};

export default function main() {
  let response;

  group(
    "page@2b9336a07f9caa3de9cd2aad5e7a8fa8 - - visualize.admin.ch",
    function () {
      response = http.get(
        "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: "test.visualize.admin.ch",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get("https://test.visualize.admin.ch/api/client-env", {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Cookie:
            "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
          Host: "test.visualize.admin.ch",
          Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
          "Sec-Fetch-Dest": "script",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
        },
      });

      response = http.get(
        "https://test.visualize.admin.ch/static/fonts/FrutigerNeueW02-Bd.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/static/fonts/FrutigerNeueW02-Regular.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/static/fonts/FrutigerNeueW02-Light.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/static/fonts/FrutigerNeueW02-It.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/css/5b6ea94c7e1a25b088a3.css",
        {
          headers: {
            Accept: "text/css,*/*;q=0.1",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "style",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/webpack-c4546c56a009ec0d47e1.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/framework-86ce13b84bc301223da7.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/main-3511e134c844f4bfe0b8.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/pages/_app-d4da84aceba271794755.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/ebec3a01-9340d8012875bc63655a.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/1712-b21bc5322200d560b3b4.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/681-518c58cfbfaf861e55f1.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/4376-450492f8b1027ed64a1f.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/7690-6838d1ad590fa125660b.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/9394-8ef51f88ad621e5a70a6.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/1938-2816e64619a040a16f2b.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/9855-4390b15eade67104c903.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/9632-a20ca5d8d2aa88cf54f6.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/pages/create/%5BchartId%5D-d9bb99808438529f72a3.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/bIGtawu6jRSRVx3kPgnmE/_buildManifest.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/bIGtawu6jRSRVx3kPgnmE/_ssgManifest.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer: "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.post(
        "https://o65222.ingest.sentry.io/api/4504922724040704/envelope/?sentry_key=1783a12ef4c64b678167ea8761265825&sentry_version=7&sentry_client=sentry.javascript.nextjs%2F7.46.0",
        '{"sent_at":"2023-06-22T10:00:23.150Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"2ab71c738d0a453bb082d14def34ddc9","init":true,"started":"2023-06-22T10:00:23.149Z","timestamp":"2023-06-22T10:00:23.149Z","status":"ok","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain;charset=UTF-8",
            origin: "https://test.visualize.admin.ch",
            referer: "https://test.visualize.admin.ch/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.post(
        "https://o65222.ingest.sentry.io/api/4504922724040704/envelope/?sentry_key=1783a12ef4c64b678167ea8761265825&sentry_version=7&sentry_client=sentry.javascript.nextjs%2F7.46.0",
        '{"sent_at":"2023-06-22T10:00:23.240Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"2ab71c738d0a453bb082d14def34ddc9","init":false,"started":"2023-06-22T10:00:23.149Z","timestamp":"2023-06-22T10:00:23.239Z","status":"exited","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain;charset=UTF-8",
            origin: "https://test.visualize.admin.ch",
            referer: "https://test.visualize.admin.ch/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.post(
        "https://o65222.ingest.sentry.io/api/4504922724040704/envelope/?sentry_key=1783a12ef4c64b678167ea8761265825&sentry_version=7&sentry_client=sentry.javascript.nextjs%2F7.46.0",
        '{"sent_at":"2023-06-22T10:00:23.240Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"68d86331325a4dd8957559ea37db65ef","init":true,"started":"2023-06-22T10:00:23.239Z","timestamp":"2023-06-22T10:00:23.239Z","status":"ok","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain;charset=UTF-8",
            origin: "https://test.visualize.admin.ch",
            referer: "https://test.visualize.admin.ch/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/3625.9f3e46232b71eeff55d8.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc; _ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1",
            Host: "test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get("https://test.visualize.admin.ch/api/auth/session", {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Cookie:
            "TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc; _ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1",
          Host: "test.visualize.admin.ch",
          Referer:
            "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          baggage:
            "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
          "sentry-trace": "22b2019ce9e04abfbb945534ccdfa650-88695c7fceb389c7-1",
        },
      });

      response = http.get(
        "https://test.visualize.admin.ch/api/auth/providers",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-9bde6bae608631f0-1",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/4912-9d2e258e20669c132755.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/1248-76909d1682f03e355f9a.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/8814.e6ea4adf445cbb9301c5.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/9978.364bd6c10026854aba28.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            "x-visualize-cache-control": cache,
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-8ed29055416ff806-1",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            "x-visualize-cache-control": cache,
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-8635c8f0a03571cf-1",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","cubeFilter":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}}},"filterKey":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-b5f72008b4a8aad1-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-aae79653df2e8529-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadata on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n}\\n","operationName":"Components","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-86d99666f021910f-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadata on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n}\\n","operationName":"Components","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","componentIds":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code"]}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-b5eb3ebe7d7556f6-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","componentIds":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/jahr","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/in-pct","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"],"filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf07":true,"https://ld.admin.ch/cube/dimension/cofog/gf10":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-9915fb793e5daf56-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-a83b6fedc21e046f-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-a34dd8d39ceff224-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-9052c3510cf6e4b0-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf07":true,"https://ld.admin.ch/cube/dimension/cofog/gf10":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-b74faaf334ac7298-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/data/bIGtawu6jRSRVx3kPgnmE/en.json",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-954c8b3da057c7da-1",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/ebec3a01-9340d8012875bc63655a.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/1712-b21bc5322200d560b3b4.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/681-518c58cfbfaf861e55f1.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/4376-450492f8b1027ed64a1f.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/7690-6838d1ad590fa125660b.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/9394-8ef51f88ad621e5a70a6.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/1938-2816e64619a040a16f2b.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/9855-4390b15eade67104c903.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/9632-a20ca5d8d2aa88cf54f6.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/3798-d57960b5b76a544f56a6.js",
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Purpose: "prefetch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/pages/index-167ceffaaf57e7909240.js",
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Purpose: "prefetch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/pages/create/%5BchartId%5D-d9bb99808438529f72a3.js"
      );
      sleep(1.2);

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/3798-d57960b5b76a544f56a6.js"
      );

      response = http.get(
        "https://test.visualize.admin.ch/_next/static/chunks/pages/index-167ceffaaf57e7909240.js"
      );
      sleep(0.8);

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query DimensionValues($dataCubeIri: String!, $dimensionIri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters) {\\n  dataCubeByIri(\\n    iri: $dataCubeIri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensionByIri(\\n      iri: $dimensionIri\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"DimensionValues","variables":{"dataCubeIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","dimensionIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-9410e2ad78b3146b-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query DimensionHierarchy($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeIri: String!, $dimensionIri: String!) {\\n  dataCubeByIri(\\n    iri: $cubeIri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n  ) {\\n    dimensionByIri(\\n      iri: $dimensionIri\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n    ) {\\n      ...hierarchyMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"DimensionHierarchy","variables":{"cubeIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","dimensionIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_H5LKJ90ERY=GS1.1.1687428022.1.0.1687428022.0.0.0; _ga=GA1.2.724688956.1687428023; _gid=GA1.2.636054271.1687428023; _gat_gtag_UA_152872709_1=1; next-auth.csrf-token=2d780a6d62255905223b5c728fb298aa0ce1eb7020bd86e7f8535061ecdb74cb%7C3b4dac3f093c8810d591e073f2701475b27d6a66f11acdd790953ef16161aecd; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS0162c893=01911b0ff105240a1a5d46bfa0550d5caa74c706d79d2a649f5e2135788a5ee34ee2ccffe0f8b55c49b043573f930dd768961d4cbc",
            Host: "test.visualize.admin.ch",
            Origin: "https://test.visualize.admin.ch",
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-bfe3f850e56a3df7-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );
      sleep(1.7);

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf04":true}}}}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            "x-visualize-cache-control": cache,
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-a0613ca8a23cd52e-1",
          },
        }
      );

      response = http.post(
        "https://test.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","componentIds":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/jahr","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/in-pct","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"],"filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf04":true}}}}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            "x-visualize-cache-control": cache,
            Referer:
              "https://test.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Int",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=22b2019ce9e04abfbb945534ccdfa650",
            "sentry-trace":
              "22b2019ce9e04abfbb945534ccdfa650-a90e26a05fbf5db4-1",
          },
        }
      );
    }
  );
}
