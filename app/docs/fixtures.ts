import { ConfiguratorState } from "../domain";

export const states: ConfiguratorState[] = [
  {
    state: "SELECTING_DATASET",
    dataSet: undefined,
    chartConfig: undefined,
    meta: {
      title: {
        de: "",
        fr: "",
        it: "",
        en: ""
      },
      description: {
        de: "",
        fr: "",
        it: "",
        en: ""
      }
    },
    activeField: undefined
  },
  {
    state: "SELECTING_CHART_TYPE",
    dataSet: "foo",
    chartConfig: {
      chartType: "column",
      fields: { x: { componentIri: "foo" }, y: { componentIri: "foo" } },
      filters: {}
    },
    meta: {
      title: {
        de: "",
        fr: "",
        it: "",
        en: ""
      },
      description: {
        de: "",
        fr: "",
        it: "",
        en: ""
      }
    },
    activeField: undefined
  }
];
