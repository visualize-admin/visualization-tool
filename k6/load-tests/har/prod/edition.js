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
      name: `HAR - Edition (PROD, GQL ${cache})`,
      distribution: DISTRIBUTION,
    },
  },
};

export default function main () {
  let response;

  group(
    "page@0c4482c551a403bb64cefc4643505383 - - visualize.admin.ch",
    function () {
      response = http.get("https://visualize.admin.ch/en/create/WtHYbmsehQKo", {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Host: "visualize.admin.ch",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
        },
      });

      response = http.get("https://visualize.admin.ch/api/client-env", {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Cookie:
            "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
          Host: "visualize.admin.ch",
          Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
          "Sec-Fetch-Dest": "script",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
        },
      });

      response = http.get(
        "https://visualize.admin.ch/static/fonts/FrutigerNeueW02-Bd.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/static/fonts/FrutigerNeueW02-Regular.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/static/fonts/FrutigerNeueW02-Light.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/static/fonts/FrutigerNeueW02-It.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "font",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/css/5b6ea94c7e1a25b088a3.css",
        {
          headers: {
            Accept: "text/css,*/*;q=0.1",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "style",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/webpack-536f32e4ecf2f2b2aa30.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/framework-86ce13b84bc301223da7.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/main-3511e134c844f4bfe0b8.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/pages/_app-cc61511fc0dccb327a0c.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/ebec3a01-9340d8012875bc63655a.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/1712-b21bc5322200d560b3b4.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/6734-e4e8b72f9f4279c1314b.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/4941-da5766ac1762ebe6a22f.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/7690-6838d1ad590fa125660b.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/9394-8ef51f88ad621e5a70a6.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/202-baea0dadf5b8b86918eb.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/184-660c85ff1c4892aa22f7.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/9855-9abbc852ad8a929f7285.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/9632-9f7d9f08f1f018306b86.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/pages/create/%5BchartId%5D-2ee6c7cdecb5e61bae69.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/eKjZvBf7R35xRjw1xrUEM/_buildManifest.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/eKjZvBf7R35xRjw1xrUEM/_ssgManifest.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8",
            Host: "visualize.admin.ch",
            Referer: "https://visualize.admin.ch/en/create/WtHYbmsehQKo",
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
        '{"sent_at":"2023-06-22T10:26:05.472Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"864fb2b3575e400bbcd18be7bda9e0a0","init":true,"started":"2023-06-22T10:26:05.471Z","timestamp":"2023-06-22T10:26:05.471Z","status":"ok","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain;charset=UTF-8",
            origin: "https://visualize.admin.ch",
            referer: "https://visualize.admin.ch/",
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
        '{"sent_at":"2023-06-22T10:26:05.549Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"864fb2b3575e400bbcd18be7bda9e0a0","init":false,"started":"2023-06-22T10:26:05.471Z","timestamp":"2023-06-22T10:26:05.549Z","status":"exited","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain;charset=UTF-8",
            origin: "https://visualize.admin.ch",
            referer: "https://visualize.admin.ch/",
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
        '{"sent_at":"2023-06-22T10:26:05.549Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"1d6ba5875bd64477999f32a60dc16ad0","init":true,"started":"2023-06-22T10:26:05.549Z","timestamp":"2023-06-22T10:26:05.549Z","status":"ok","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain;charset=UTF-8",
            origin: "https://visualize.admin.ch",
            referer: "https://visualize.admin.ch/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/3625.9f3e46232b71eeff55d8.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8; _ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1",
            Host: "visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get("https://visualize.admin.ch/api/auth/session", {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Cookie:
            "TS017ebe1d=01911b0ff11829231f4fccbea6f62bc315f3f4d6f28500406b848733c04f56cbc57e776c33b95691786ef325c7cea2ec9337f9e0c8; _ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1",
          Host: "visualize.admin.ch",
          Referer:
            "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          baggage:
            "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
          "sentry-trace": "e7293e6b03c64d6d9bc1a800758c5ac5-b0541b156362ba27-1",
        },
      });

      response = http.get("https://visualize.admin.ch/api/auth/providers", {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Cookie:
            "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
          Host: "visualize.admin.ch",
          Referer:
            "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          baggage:
            "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
          "sentry-trace": "e7293e6b03c64d6d9bc1a800758c5ac5-9496e29fcd9f9ee6-1",
        },
      });

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/5099-acbb2c7c9905d92fb986.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/7830-9142a6eff7bd78ac5759.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/8814.e6ea4adf445cbb9301c5.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/9978.0eaa5c065b1f469ea36f.js",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "script",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-b9e230feab34374c-1",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-8f92d2fa9b8b3ee4-1",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query PossibleFilters($sourceType: String!, $sourceUrl: String!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {\\n  possibleFilters(\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    cubeFilter: $cubeFilter\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","cubeFilter":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}}},"filterKey":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-bef2aed6e3a6f16f-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-bdb634ebd31ae537-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadata on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n}\\n","operationName":"Components","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-b05b514d7896473c-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadata on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n}\\n","operationName":"Components","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","componentIds":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code"]}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-a8d61446ad8dc80b-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","componentIds":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/jahr","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/in-pct","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"],"filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf07":true,"https://ld.admin.ch/cube/dimension/cofog/gf10":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-b8468002cdb931e2-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-bc9e9f47fbe06d03-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-ab34545140bce6c2-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters, $componentIds: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-bbde5774bce43b54-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf07":true,"https://ld.admin.ch/cube/dimension/cofog/gf10":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-9831f48bca7ff545-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/data/eKjZvBf7R35xRjw1xrUEM/en.json",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-932f972eb1a5ef17-1",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/ebec3a01-9340d8012875bc63655a.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/1712-b21bc5322200d560b3b4.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/6734-e4e8b72f9f4279c1314b.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/4941-da5766ac1762ebe6a22f.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/7690-6838d1ad590fa125660b.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/9394-8ef51f88ad621e5a70a6.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/202-baea0dadf5b8b86918eb.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/184-660c85ff1c4892aa22f7.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/9855-9abbc852ad8a929f7285.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/9632-9f7d9f08f1f018306b86.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/3798-6a78e363282a56792e52.js",
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Purpose: "prefetch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/pages/index-f8db2f01d0ad906ef2f1.js",
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Purpose: "prefetch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/pages/create/%5BchartId%5D-2ee6c7cdecb5e61bae69.js"
      );
      sleep(1.3);

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/3798-6a78e363282a56792e52.js"
      );

      response = http.get(
        "https://visualize.admin.ch/_next/static/chunks/pages/index-f8db2f01d0ad906ef2f1.js"
      );
      sleep(0.8);

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query DimensionValues($dataCubeIri: String!, $dimensionIri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: Filters) {\\n  dataCubeByIri(\\n    iri: $dataCubeIri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    dimensionByIri(\\n      iri: $dimensionIri\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"DimensionValues","variables":{"dataCubeIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","dimensionIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-8e97dca1665001db-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query DimensionHierarchy($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeIri: String!, $dimensionIri: String!) {\\n  dataCubeByIri(\\n    iri: $cubeIri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n  ) {\\n    dimensionByIri(\\n      iri: $dimensionIri\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n    ) {\\n      ...hierarchyMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"DimensionHierarchy","variables":{"cubeIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","dimensionIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-88edde095392afa5-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );
      sleep(1.3);

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf04":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-bbe7736ad9c9c06f-1",
            "x-visualize-debug": "",
            "x-visualize-cache-control": cache,
          },
        }
      );

      response = http.post(
        "https://visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIds: [String!], $filters: Filters, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIds: $componentIds\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://lindas.int.cz-aws.net/query","locale":"en","componentIds":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/jahr","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/in-pct","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"],"filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf04":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_SCXQ4XPN65=GS1.1.1687429565.1.0.1687429565.0.0.0; _ga=GA1.2.49147509.1687429565; _gid=GA1.2.737453128.1687429565; _gat_gtag_UA_152872709_2=1; next-auth.csrf-token=493a1bd9e7e06108027a7386376825b2a246b85d8e1c367b9a8a80b9dc8dd4e5%7Cd3182854b24363ff5b51e692bb2eeec6847866d8c302978c1e8b4831a6a9a647; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff1095ef9a1133cb6cc0bcd9402e8096f0f8500406b848733c04f56cbc57e776c33fbdf4de41b18b1944e53432c2953cf7b25872a47aa3fe86d75b14e1a2bd850bd72a8f0998675501cc163493022129f6a",
            Host: "visualize.admin.ch",
            Origin: "https://visualize.admin.ch",
            Referer:
              "https://visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=e7293e6b03c64d6d9bc1a800758c5ac5",
            "sentry-trace":
              "e7293e6b03c64d6d9bc1a800758c5ac5-9cad8099e2ddc0ac-1",
            "x-visualize-cache-control": cache,
            "x-visualize-debug": "",
          },
        }
      );
    }
  );
}
