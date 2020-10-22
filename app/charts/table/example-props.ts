export const ex1 = {
  fields: {
    settings: {
      showSearch: true,
      showAllRows: true,
    },
    sorting: [
      { componentIri: "one", sortingOrder: "ascending" },
      { componentIri: "two", sortingOrder: "descending" },
    ],
    columns: [
      {
        componentIri: "one",
        isGroup: true,
        isHidden: false,
        columnStyle: "text", // category, heatmap, bar
        textStyle: "regular", // bold
        textColor: "#333", // optional
        columnColor: "#fff", // optional
      },
      {
        componentIri: "two",
        columnStyle: "text", // category, heatmap, bar
        textStyle: "regular", // bold
        textColor: "#333", // optional
        columnColor: "#fff", // optional
      },
      {
        componentIri: "three",
        columnStyle: "heatmap", // category, heatmap, bar
        textStyle: "regular", // bold
        palette: "magma", // color ramp
      },
      {
        componentIri: "four",
        columnStyle: "bar", // category, heatmap, bar
        textStyle: "regular", // bold
        barColorPositive: "red", // color value
        barColorNegative: "blue", // color value
        barColorBackground: "#999", // optional?
        barShowBackground: true, // optional?
      },
      {
        componentIri: "five",
        columnStyle: "category", // category, heatmap, bar
        textStyle: "regular", // bold
        palette: "red", // categorical palette
        colorMapping: {}, // see other charts :)
      },
    ],
  },
  filters: {},
};
