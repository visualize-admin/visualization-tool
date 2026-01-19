import { migrateConfiguratorState } from "@/utils/chart-config/versioning";

export const getExampleState1 = async () => {
  return await migrateConfiguratorState({
    state: "PUBLISHED",
    dataSet: "https://environment.ld.admin.ch/foen/ubd003701/2",
    dataSource: {
      type: "sparql",
      url: "https://lindas-cached.int.cz-aws.net/query",
    },
    meta: {
      title: {
        de: "Lärmbelastung durch Verkehr",
        en: "Traffic noise pollution",
        fr: "Exposition au bruit du trafic",
        it: "Esposizione al rumore del traffico",
      },
      description: {
        de: "",
        en: "",
        fr: "",
        it: "",
      },
    },
    chartConfig: {
      version: "1.2.1",
      fields: {
        x: {
          sorting: {
            sortingType: "byMeasure",
            sortingOrder: "desc",
          },
          componentIri:
            "https://environment.ld.admin.ch/foen/ubd003701/verkehrsart",
        },
        y: {
          componentIri: "https://environment.ld.admin.ch/foen/ubd003701/wert",
        },
        segment: {
          type: "grouped",
          palette: "category10",
          sorting: {
            sortingType: "byTotalSize",
            sortingOrder: "asc",
          },
          colorMapping: {
            "https://environment.ld.admin.ch/foen/ubd003701/periode/D":
              "#ff7f0e",
            "https://environment.ld.admin.ch/foen/ubd003701/periode/N":
              "#1f77b4",
          },
          componentIri:
            "https://environment.ld.admin.ch/foen/ubd003701/periode",
        },
      },
      filters: {
        "https://environment.ld.admin.ch/foen/ubd003701/beurteilung": {
          type: "single",
          value:
            "https://environment.ld.admin.ch/foen/ubd003701/beurteilung/%3EIGWLSV",
        },
        "https://environment.ld.admin.ch/foen/ubd003701/gemeindetype": {
          type: "single",
          value:
            "https://environment.ld.admin.ch/foen/ubd003701/gemeindeTyp/CH",
        },
        "https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteeinheit":
          {
            type: "single",
            value:
              "https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteEinheit/Pers",
          },
      },
      chartType: "column",
      interactiveFiltersConfig: {
        timeRange: {
          active: false,
          presets: {
            to: "",
            from: "",
            type: "range",
          },
          componentIri: "",
        },
        legend: {
          active: false,
          componentIri: "",
        },
        dataFilters: {
          active: true,
          componentIris: [
            "https://environment.ld.admin.ch/foen/ubd003701/gemeindetype",
            "https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteeinheit",
          ],
        },
      },
    },
    activeField: undefined,
  });
};

export const getExampleState2 = async () => {
  return await migrateConfiguratorState({
    state: "PUBLISHED",
    dataSet: "https://culture.ld.admin.ch/sfa/StateAccounts_Office/4/",
    dataSource: {
      type: "sparql",
      url: "https://lindas-cached.int.cz-aws.net/query",
    },
    meta: {
      title: {
        de: "Verteilung der Ausgaben und Einnahmen nach Ämtern",
        en: "Distribution of expenses and income by office",
        fr: "Répartition des dépenses et recettes par office",
        it: "Ripartizione delle spese e delle entrate per ufficio",
      },
      description: {
        de: "",
        en: "",
        fr: "",
        it: "",
      },
    },
    chartConfig: {
      version: "1.2.1",
      fields: {
        x: {
          componentIri: "http://www.w3.org/2006/time#Year",
        },
        y: {
          componentIri: "http://schema.org/amount",
        },
        segment: {
          palette: "category10",
          sorting: {
            sortingType: "byDimensionLabel",
            sortingOrder: "asc",
          },
          colorMapping: {
            "https://culture.ld.admin.ch/sfa/StateAccounts_Office/OperationCharacter/OC1":
              "#1f77b4",
            "https://culture.ld.admin.ch/sfa/StateAccounts_Office/OperationCharacter/OC2":
              "#ff7f0e",
          },
          componentIri:
            "https://culture.ld.admin.ch/sfa/StateAccounts_Office/operationcharacter",
        },
      },
      filters: {
        "https://culture.ld.admin.ch/sfa/StateAccounts_Office/office": {
          type: "single",
          value:
            "https://culture.ld.admin.ch/sfa/StateAccounts_Office/Office/O7",
        },
      },
      chartType: "area",
      interactiveFiltersConfig: {
        timeRange: {
          active: true,
          presets: {
            to: "2013-12-31T23:00:00.000Z",
            from: "1950-12-31T23:00:00.000Z",
            type: "range",
          },
          componentIri: "",
        },
        legend: {
          active: true,
          componentIri: "",
        },
        dataFilters: {
          active: true,
          componentIris: [
            "https://culture.ld.admin.ch/sfa/StateAccounts_Office/office",
          ],
        },
      },
    },
  });
};
