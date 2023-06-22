/*
 * Creator: Playwright 1.32.1
 * Browser: chromium 112.0.5615.29
 */

import { group, sleep } from "k6";
import http from "k6/http";

export const options = {
  duration: "60s",
  vus: 1,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<5000"],
  },
};

export default function main() {
  let response;

  group(
    "page@219ec0c112be1ef606ad7c47042d8a67 - - visualize.admin.ch",
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
            "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
        "https://www.googletagmanager.com/gtag/js?id=UA-152872709-3",
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            referer: "https://int.visualize.admin.ch/",
            "sec-fetch-dest": "script",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "cross-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get(
        "https://int.visualize.admin.ch/static/fonts/FrutigerNeueW02-Bd.woff2",
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7",
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
        "https://www.googletagmanager.com/gtag/js?id=G-YXLMZKQDWK&l=dataLayer&cx=c",
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            referer: "https://int.visualize.admin.ch/",
            "sec-fetch-dest": "script",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "cross-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.get("https://www.google-analytics.com/analytics.js", {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "en-US",
          referer: "https://int.visualize.admin.ch/",
          "sec-fetch-dest": "script",
          "sec-fetch-mode": "no-cors",
          "sec-fetch-site": "cross-site",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
        },
      });

      response = http.post(
        "https://region1.google-analytics.com/g/collect?v=2&tid=G-YXLMZKQDWK&gtm=45je36e2&_p=1423039587&cid=1081998507.1687422933&ul=en-us&sr=1280x720&ir=1&uaa=&uab=&uafvl=&uamb=0&uam=&uap=&uapv=&uaw=0&_eu=EA&ngs=1&_s=1&sid=1687422932&sct=1&seg=0&dl=https%3A%2F%2Fint.visualize.admin.ch%2Fen%2Fcreate%2FWtHYbmsehQKo&dt=visualize.admin.ch&en=page_view&_fv=1&_nsi=1&_ss=1&ep.anonymize_ip=true",
        null,
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            origin: "https://int.visualize.admin.ch",
            referer: "https://int.visualize.admin.ch/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "cross-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          },
        }
      );

      response = http.post(
        "https://www.google-analytics.com/j/collect?v=1&_v=j101&aip=1&a=1423039587&t=pageview&_s=1&dl=https%3A%2F%2Fint.visualize.admin.ch%2Fen%2Fcreate%2FWtHYbmsehQKo&ul=en-us&de=UTF-8&dt=visualize.admin.ch&sd=24-bit&sr=1280x720&vp=1280x720&je=0&_u=YADAAUABAAAAACAAI~&jid=1374908056&gjid=805354577&cid=1081998507.1687422933&tid=UA-152872709-3&_gid=1195118470.1687422933&_r=1&gtm=457e36e2&jsscut=1&z=1811507829",
        null,
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US",
            "content-type": "text/plain",
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
        '{"sent_at":"2023-06-22T08:35:33.116Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"4d5aee5d0639466191cba013e4742331","init":true,"started":"2023-06-22T08:35:33.115Z","timestamp":"2023-06-22T08:35:33.115Z","status":"ok","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
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
        '{"sent_at":"2023-06-22T08:35:33.197Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"4d5aee5d0639466191cba013e4742331","init":false,"started":"2023-06-22T08:35:33.115Z","timestamp":"2023-06-22T08:35:33.197Z","status":"exited","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
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
        '{"sent_at":"2023-06-22T08:35:33.198Z","sdk":{"name":"sentry.javascript.nextjs","version":"7.46.0"}}\n{"type":"session"}\n{"sid":"8a8817a7eb5644c19a20d95e051aad38","init":true,"started":"2023-06-22T08:35:33.197Z","timestamp":"2023-06-22T08:35:33.197Z","status":"ok","errors":0,"attrs":{"release":"visualization-tool@v3.20.2","environment":"production","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36"}}',
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
              "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7; _ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1",
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
            "TS017ebe1d=01911b0ff1d70ea6faa237c115268ca3407e780ca090f9ad13675635b6f5e3667f3388cbcce4689b2434af4ca99f954d39f74f40f7; _ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1",
          Host: "int.visualize.admin.ch",
          Referer:
            "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          baggage:
            "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
          "sentry-trace": "f02a7722aad14d759481bc4950734a14-9025ae4ca763dc9d-1",
        },
      });

      response = http.get("https://int.visualize.admin.ch/api/auth/providers", {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US",
          Connection: "keep-alive",
          Cookie:
            "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
          Host: "int.visualize.admin.ch",
          Referer:
            "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
          baggage:
            "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
          "sentry-trace": "f02a7722aad14d759481bc4950734a14-bdd0c7ee5fa720e1-1",
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
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            "x-visualize-cache-control": "no-cache",
            "content-type": "application/json",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-8126c87ff31987d0-1",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters, $componentIris: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            "x-visualize-cache-control": "no-cache",
            "content-type": "application/json",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-91716cb1ac8ed804-1",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query PossibleFilters($iri: String!, $sourceType: String!, $sourceUrl: String!, $filters: Filters!) {\\n  possibleFilters(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    filters: $filters\\n  ) {\\n    iri\\n    type\\n    value\\n    __typename\\n  }\\n}\\n","operationName":"PossibleFilters","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKey":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-91d7a573dda51176-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-bf1da7ad9eb6c95b-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters, $componentIris: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadata on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n}\\n","operationName":"Components","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-b102d3765e5e8236-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters, $componentIris: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadata on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n}\\n","operationName":"Components","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","componentIris":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code"]}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-81d6ce9f36db5841-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIris: [String!], $filters: Filters, $latest: Boolean, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","componentIris":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/jahr","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/in-pct","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"],"filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf07":true,"https://ld.admin.ch/cube/dimension/cofog/gf10":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-8da2ef473d4291c9-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    iri\\n    identifier\\n    title\\n    description\\n    publisher\\n    version\\n    workExamples\\n    contactName\\n    contactEmail\\n    landingPage\\n    expires\\n    datePublished\\n    dateModified\\n    publicationStatus\\n    themes {\\n      iri\\n      label\\n      __typename\\n    }\\n    creator {\\n      iri\\n      label\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeMetadata","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-b402a1a2639ba2fa-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters, $componentIris: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"}},"filterKeys":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-a675dcce7b82bf7a-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters, $componentIris: [String!]) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    dimensions(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    measures(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"ComponentsWithHierarchies","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-8bdd2c7db7befd4a-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIris: [String!], $filters: Filters, $latest: Boolean, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf07":true,"https://ld.admin.ch/cube/dimension/cofog/gf10":true}}}}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-847c85e11e6170d8-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
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
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
            Host: "int.visualize.admin.ch",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-9d899a3c7912b0f4-1",
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
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/3798-6a78e363282a56792e52.js"
      );

      response = http.get(
        "https://int.visualize.admin.ch/_next/static/chunks/pages/index-f8db2f01d0ad906ef2f1.js"
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DimensionValues($dataCubeIri: String!, $dimensionIri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters) {\\n  dataCubeByIri(\\n    iri: $dataCubeIri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    dimensionByIri(\\n      iri: $dimensionIri\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n    ) {\\n      ...dimensionMetadataWithHierarchies\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment dimensionMetadataWithHierarchies on Dimension {\\n  iri\\n  label\\n  description\\n  isNumerical\\n  isKeyDimension\\n  dataType\\n  order\\n  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)\\n  unit\\n  related {\\n    iri\\n    type\\n    __typename\\n  }\\n  ... on TemporalDimension {\\n    timeUnit\\n    timeFormat\\n    __typename\\n  }\\n  ... on NumericalMeasure {\\n    isCurrency\\n    currencyExponent\\n    resolution\\n    isDecimal\\n    __typename\\n  }\\n  ...hierarchyMetadata\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"DimensionValues","variables":{"dataCubeIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","dimensionIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-b317a42d912001d3-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DimensionHierarchy($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeIri: String!, $dimensionIri: String!) {\\n  dataCubeByIri(\\n    iri: $cubeIri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n  ) {\\n    dimensionByIri(\\n      iri: $dimensionIri\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n    ) {\\n      ...hierarchyMetadata\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyMetadata on Dimension {\\n  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {\\n    ...hierarchyValueFields\\n    children {\\n      ...hierarchyValueFields\\n      children {\\n        ...hierarchyValueFields\\n        children {\\n          ...hierarchyValueFields\\n          children {\\n            ...hierarchyValueFields\\n            children {\\n              ...hierarchyValueFields\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment hierarchyValueFields on HierarchyValue {\\n  value\\n  dimensionIri\\n  depth\\n  label\\n  alternateName\\n  hasValue\\n  position\\n  identifier\\n}\\n","operationName":"DimensionHierarchy","variables":{"cubeIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","dimensionIri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en"}}',
        {
          headers: {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            Connection: "keep-alive",
            Cookie:
              "_ga_YXLMZKQDWK=GS1.1.1687422932.1.0.1687422932.0.0.0; _ga=GA1.2.1081998507.1687422933; _gid=GA1.2.1195118470.1687422933; _gat_gtag_UA_152872709_3=1; next-auth.csrf-token=52d1912310d619f969f999b9202ca438a02efca8293a2d27f5088336be1de72f%7C0c290fb5414b08235f163e1f5c4b41855d673d7e88d1bd021ef7d85a68e0f82c; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000; TS017ebe1d=01911b0ff16bdc6b267803b304b8c4ff859d7cf8e890f9ad13675635b6f5e3667f3388cbccc7ed539cea6c9481fe10d10ee4c069affe7831be09c9e358cf0cbea7436d3bf0a1155a98ffee1b09e2250ce746f9821c",
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
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "content-type": "application/json",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-82757ce858b182db-1",
            "x-visualize-cache-control": "no-cache",
            "x-visualize-debug": "",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIris: [String!], $filters: Filters, $latest: Boolean, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf04":true}}}}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            "x-visualize-cache-control": "no-cache",
            "content-type": "application/json",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-ac1026df276bcff8-1",
          },
        }
      );

      response = http.post(
        "https://int.visualize.admin.ch/api/graphql",
        '{"query":"query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIris: [String!], $filters: Filters, $latest: Boolean, $limit: Int) {\\n  dataCubeByIri(\\n    iri: $iri\\n    sourceType: $sourceType\\n    sourceUrl: $sourceUrl\\n    locale: $locale\\n    latest: $latest\\n  ) {\\n    observations(\\n      sourceType: $sourceType\\n      sourceUrl: $sourceUrl\\n      componentIris: $componentIris\\n      filters: $filters\\n      limit: $limit\\n    ) {\\n      data\\n      sparqlEditorUrl\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n","operationName":"DataCubeObservations","variables":{"iri":"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/7","sourceType":"sparql","sourceUrl":"https://int.lindas.admin.ch/query","locale":"en","componentIris":["https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/jahr","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/in-pct","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code","https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel"],"filters":{"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/kurzel":{"type":"single","value":"Bd"},"https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/code":{"type":"multi","values":{"https://ld.admin.ch/cube/dimension/cofog/gf02":true,"https://ld.admin.ch/cube/dimension/cofog/gf04":true}}}}}',
        {
          headers: {
            "Accept-Language": "en-US",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.29 Safari/537.36",
            "x-visualize-cache-control": "no-cache",
            "content-type": "application/json",
            Referer:
              "https://int.visualize.admin.ch/en/create/WtHYbmsehQKo?dataSource=Prod",
            "x-visualize-debug": "",
            baggage:
              "sentry-environment=production,sentry-release=visualization-tool%40v3.20.2,sentry-transaction=%2Fcreate%2F%5BchartId%5D,sentry-public_key=1783a12ef4c64b678167ea8761265825,sentry-trace_id=f02a7722aad14d759481bc4950734a14",
            "sentry-trace":
              "f02a7722aad14d759481bc4950734a14-9f047ede4ffb2402-1",
          },
        }
      );
    }
  );

  // Automatically added sleep
  sleep(1);
}
