import { sleep } from "k6";
import http from "k6/http";
var url = "https://test.visualize.admin.ch/api/graphql";
var headers = {
    "Content-Type": "application/json",
    "x-visualize-cache-control": "no-cache"
};
var query = "query DataCubeObservations(\n  $iri: String!\n  $sourceType: String!\n  $sourceUrl: String!\n  $locale: String!\n  $componentIris: [String!]\n  $filters: Filters\n  $latest: Boolean\n  $limit: Int\n) {\n  dataCubeByIri(\n    iri: $iri\n    sourceType: $sourceType\n    sourceUrl: $sourceUrl\n    locale: $locale\n    latest: $latest\n  ) {\n    observations(\n      sourceType: $sourceType\n      sourceUrl: $sourceUrl\n      componentIris: $componentIris\n      filters: $filters\n      limit: $limit\n    ) {\n      data\n      sparqlEditorUrl\n      __typename\n    }\n    __typename\n  }\n}";
var variables = {
    iri: "https://culture.ld.admin.ch/sfa/StateAccounts_Office/4/",
    sourceType: "sparql",
    sourceUrl: "https://lindas.admin.ch/query",
    locale: "en",
    componentIris: [
        "http://www.w3.org/2006/time#Year",
        "http://schema.org/amount",
        "https://culture.ld.admin.ch/sfa/StateAccounts_Office/operationcharacter",
        "https://culture.ld.admin.ch/sfa/StateAccounts_Office/office",
    ],
    filters: {
        "https://culture.ld.admin.ch/sfa/StateAccounts_Office/office": {
            type: "single",
            value: "https://culture.ld.admin.ch/sfa/StateAccounts_Office/Office/O7"
        }
    }
};
export var options = {
    duration: "40s",
    vus: 75,
    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<1000"]
    }
};
export default function Observations() {
    http.post(url, JSON.stringify({ query: query, variables: variables }), { headers: headers });
    sleep(1);
}
