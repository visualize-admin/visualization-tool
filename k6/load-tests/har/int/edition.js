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
      name: `HAR - Edition (INT, GQL ${cache})`,
      distribution: DISTRIBUTION,
    },
  },
};

export default function main () {
  let response;

  group(
    "page@b0b07daaeff22014017635ff06ef0310 - - visualize.admin.ch",
    function () {
      response = http.get(
        "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Host: "int.visualize.admin.ch",
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

      response = http.get("https://int.visualize.admin.ch/api/client-env", {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Cookie:
            "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
          Host: "int.visualize.admin.ch",
          Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
          "Sec-Fetch-Dest": "script",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
        },
      });

      response = http.get(
        "https://int.visualize.admin.ch/static/fonts/FrutigerNeueW02-Bd.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/static/fonts/FrutigerNeueW02-Regular.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/static/fonts/FrutigerNeueW02-Light.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/static/fonts/FrutigerNeueW02-It.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/css/5b6ea94c7e1a25b088a3.css",
        {
          headers: {
            Accept: "text/css,*/*;q=0.1",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "style",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/webpack-536f32e4ecf2f2b2aa30.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/framework-86ce13b84bc301223da7.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/main-3511e134c844f4bfe0b8.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/pages/_app-cc61511fc0dccb327a0c.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/ebec3a01-9340d8012875bc63655a.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/1712-b21bc5322200d560b3b4.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/6734-e4e8b72f9f4279c1314b.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/4941-da5766ac1762ebe6a22f.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/7690-6838d1ad590fa125660b.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/9394-8ef51f88ad621e5a70a6.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/202-baea0dadf5b8b86918eb.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/184-660c85ff1c4892aa22f7.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/9855-9abbc852ad8a929f7285.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/9632-9f7d9f08f1f018306b86.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/pages/create/%5BchartId%5D-2ee6c7cdecb5e61bae69.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/eKjZvBf7R35xRjw1xrUEM/_buildManifest.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/eKjZvBf7R35xRjw1xrUEM/_ssgManifest.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44",
            Host: "int.visualize.admin.ch",
            Referer: "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo",
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
        '{"sent_at":"2023-06-22T10:23:11.564Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"644bd0dc473a4a2e867a0bb90e6a78cc","init":true,"started":"2023-06-22T10:23:11.563Z","timestamp":"2023-06-22T10:23:11.563Z","status":"ok","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain;charset=UTF-8",
            origin: "https://int.visualize.admin.ch",
            referer: "https://int.visualize.admin.ch/",
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
        '{"sent_at":"2023-06-22T10:23:11.647Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"644bd0dc473a4a2e867a0bb90e6a78cc","init":false,"started":"2023-06-22T10:23:11.563Z","timestamp":"2023-06-22T10:23:11.646Z","status":"exited","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain;charset=UTF-8",
            origin: "https://int.visualize.admin.ch",
            referer: "https://int.visualize.admin.ch/",
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
        '{"sent_at":"2023-06-22T10:23:11.648Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"0221bf0a23f14878aefbafbff3444d40","init":true,"started":"2023-06-22T10:23:11.646Z","timestamp":"2023-06-22T10:23:11.646Z","status":"ok","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain;charset=UTF-8",
            origin: "https://int.visualize.admin.ch",
            referer: "https://int.visualize.admin.ch/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/3625.9f3e46232b71eeff55d8.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44; _gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392",
            Host: "int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get("https://int.visualize.admin.ch/api/auth/session", {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Cookie:
            "TS017ebe1d=01911b0ff17daddf4dcb653c71718096fe6dad4b133dcfeda23e54d99f8811f56e447a921b5426a2a65c44a5e189a30bcca759fd44; _gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392",
          Host: "int.visualize.admin.ch",
          Referer:
            "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          baggage:
            "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
          "sentry-trace": "b19d15c97f7d4e369daef63483f094cf-848ad7fb02b172b5-1",
        },
      });

      response = http.get("https://int.visualize.admin.ch/api/auth/providers", {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Cookie:
            "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
          Host: "int.visualize.admin.ch",
          Referer:
            "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          baggage:
            "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
          "sentry-trace": "b19d15c97f7d4e369daef63483f094cf-a7616fafbdf89b0e-1",
        },
      });

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/5099-acbb2c7c9905d92fb986.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/7830-9142a6eff7bd78ac5759.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/8814.e6ea4adf445cbb9301c5.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/9978.0eaa5c065b1f469ea36f.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-9ba22894b5f4316f-1",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-934391ced19af5e6-1",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","cubeFilter":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}}},"filterKey":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-aea0a10f57b1d315-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-b0761955850d9079-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadata on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n}\\n","operationName":"Components","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-be9eb10d4fe151bb-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadata on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n}\\n","operationName":"Components","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","componentIds":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code"]}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-aad707d049272296-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","componentIds":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/jahr","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/in-pct","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"],"filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf07":true,"https://ld.admin.ch/cube/dimension/cofog/gf10":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-98bc7a99d95eb058-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-9e4fc33afd25b4af-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-a1eb26268f551bb2-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-9cd615f82e56e5c1-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf07":true,"https://ld.admin.ch/cube/dimension/cofog/gf10":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-a539040a97d98c27-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/data/eKjZvBf7R35xRjw1xrUEM/en.json",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-a9102b390bd1120e-1",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/ebec3a01-9340d8012875bc63655a.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/1712-b21bc5322200d560b3b4.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/6734-e4e8b72f9f4279c1314b.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/4941-da5766ac1762ebe6a22f.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/7690-6838d1ad590fa125660b.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/9394-8ef51f88ad621e5a70a6.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/202-baea0dadf5b8b86918eb.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/184-660c85ff1c4892aa22f7.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/9855-9abbc852ad8a929f7285.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/9632-9f7d9f08f1f018306b86.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/3798-6a78e363282a56792e52.js",
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Purpose: "prefetch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/pages/index-f8db2f01d0ad906ef2f1.js",
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Purpose: "prefetch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/pages/create/%5BchartId%5D-2ee6c7cdecb5e61bae69.js"
      );
      sleep(1.2);

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/3798-6a78e363282a56792e52.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/pages/index-f8db2f01d0ad906ef2f1.js"
      );
      sleep(0.9);

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DimensionValues($dataCubeIri: String!, $dimensionIri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters) {\\n  dataCubeByIri(\\n    iri: $dataCubeIri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensionByIri(\\n      iri: $dimensionIri\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"DimensionValues","variables":{"dataCubeIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","dimensionIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-8bc796f88aae1523-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DimensionHierarchy($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeIri: String!, $dimensionIri: String!) {\\n  dataCubeByIri(\\n    iri: $cubeIri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n  ) {\\n    dimensionByIri(\\n      iri: $dimensionIri\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n    ) {\\n      ...hierarchyMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"DimensionHierarchy","variables":{"cubeIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","dimensionIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-b982260db7a6b755-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );
      sleep(1.3);

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf04":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-820073fb03acaf9b-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","componentIds":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/jahr","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/in-pct","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"],"filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf04":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_gid=GA1.2.2075033093.1687429392; _gat_gtag_UA_152872709_3=1; _ga_YXLMZKQDWK=GS1.1.1687429391.1.0.1687429391.0.0.0; _ga=GA1.1.321136358.1687429392; next-auth.csrf-token=27530503ade1d9c8b1d9f46ecfcf5df07dc5b46ba02a7e911200e31a14f88ea8%7C506289458bbc07db38725335b8dfcece6772766644bedd99193d51256f9b57d8; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1ffc854f7b3b79688e026db697fc1a9e03dcfeda23e54d99f8811f56e447a921b5ef71c0ba0ee37bd11568c8c11fab80f42a85399d0ee46e9df8ca7fb88390f9daa48955866e5387299a5f854d8db5afa",
            Host: "int.visualize.admin.ch",
            Origin: "https://int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=b19d15c97f7d4e369daef63483f094cf",
            "sentry-trace":
              "b19d15c97f7d4e369daef63483f094cf-811e67fada423463-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );
    }
  );
}
