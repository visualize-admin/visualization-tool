import { sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

export const options: Options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  http.get("https://test.k6.io");
  sleep(1);
}
