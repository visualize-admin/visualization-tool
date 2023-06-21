import { sleep } from "k6";
import http from "k6/http";
var url = "https://int.visualize.admin.ch/api/graphql";
var headers = {
    "Content-Type": "application/json",
    "x-visualize-cache-control": "no-cache"
};
var query = "query Components(\n  $iri: String!\n  $sourceType: String!\n  $sourceUrl: String!\n  $locale: String!\n  $latest: Boolean\n  $filters: Filters\n  $componentIris: [String!]\n) {\n  dataCubeByIri(\n    iri: $iri\n    sourceType: $sourceType\n    sourceUrl: $sourceUrl\n    locale: $locale\n    latest: $latest\n  ) {\n    dimensions(\n      sourceType: $sourceType\n      sourceUrl: $sourceUrl\n      componentIris: $componentIris\n    ) {\n      ...dimensionMetadata\n      __typename\n    }\n\n    measures(\n      sourceType: $sourceType\n      sourceUrl: $sourceUrl\n      componentIris: $componentIris\n    ) {\n      ...dimensionMetadata\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment dimensionMetadata on Dimension {\n  iri\n  label\n  description\n  isNumerical\n  isKeyDimension\n  dataType\n  order\n  values(\n    sourceType: $sourceType\n    sourceUrl: $sourceUrl\n    filters: $filters\n  )\n  unit\n  related {\n    iri\n    type\n    __typename\n  }\n  \n  ... on TemporalDimension {\n    timeUnit\n    timeFormat\n    __typename\n  }\n  \n  ... on NumericalMeasure {\n    isCurrency\n    currencyExponent\n    resolution\n    isDecimal\n    __typename\n  }\n}";
var variables = {
    iri: "https://environment.ld.admin.ch/foen/ubd003701/2",
    sourceType: "sparql",
    sourceUrl: "https://lindas.admin.ch/query",
    locale: "en",
    componentIris: [
        "https://environment.ld.admin.ch/foen/ubd003701/beurteilung",
        "https://environment.ld.admin.ch/foen/ubd003701/gemeindetype",
        "https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteeinheit",
    ]
};
export var options = {
    duration: "30s",
    vus: 50,
    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<500"]
    }
};
export default function () {
    http.post(url, JSON.stringify({ query: query, variables: variables }), { headers: headers });
    sleep(1);
}
