import { DataCubeObservations, Dimension, Measure } from "@/domain/data";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { TimeUnit } from "@/graphql/query-hooks";

export const dimensions: Dimension[] = [
  {
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing",
    }),
    isNumerical: false,
    label: "Date",
    isKeyDimension: true,
    values: [
      { value: "2007-05-21", label: "2007-05-21" },
      { value: "2020-09-28", label: "2020-09-28" },
    ],
    timeUnit: TimeUnit.Day,
    timeFormat: "%Y-%m-%d",
    __typename: "TemporalDimension",
  },
  {
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype",
    }),
    isNumerical: false,
    label: "Parameter",
    isKeyDimension: true,
    values: [
      { value: "E.coli", label: "E.coli" },
      { value: "Enterokokken", label: "Enterokokken" },
    ],
    __typename: "NominalDimension",
  },
  {
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm",
    }),
    isNumerical: false,
    label: "Monitoring Programme",
    isKeyDimension: false,
    values: [
      { value: "BAQUA_AG", label: "BAQUA_AG" },
      { value: "BAQUA_BE", label: "BAQUA_BE" },
      { value: "BAQUA_FR", label: "BAQUA_FR" },
      { value: "BAQUA_GE", label: "BAQUA_GE" },
      { value: "BAQUA_LU", label: "BAQUA_LU" },
      { value: "BAQUA_NW", label: "BAQUA_NW" },
      { value: "BAQUA_OW", label: "BAQUA_OW" },
      { value: "BAQUA_SG", label: "BAQUA_SG" },
      { value: "BAQUA_SH", label: "BAQUA_SH" },
      { value: "BAQUA_SO", label: "BAQUA_SO" },
      { value: "BAQUA_SZ", label: "BAQUA_SZ" },
      { value: "BAQUA_TG", label: "BAQUA_TG" },
      { value: "BAQUA_TI", label: "BAQUA_TI" },
      { value: "BAQUA_UR", label: "BAQUA_UR" },
      { value: "BAQUA_VD", label: "BAQUA_VD" },
      { value: "BAQUA_ZG", label: "BAQUA_ZG" },
      { value: "BAQUA_ZH", label: "BAQUA_ZH" },
    ],
    __typename: "NominalDimension",
  },
  {
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "https://environment.ld.admin.ch/foen/ubd0104/station",
    }),
    isNumerical: false,
    label: "Bathing site",
    isKeyDimension: true,
    values: [
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH10001",
        label: "Plage de Gumefens",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH10004",
        label: "Gemeinde Strandbad",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH10007",
        label: "Plage de Portalban",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH10009",
        label: "Nouvelle plage",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH1013",
        label: "Strandbad Maur",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH1016",
        label: "Strandbad Uster",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH1029",
        label: "Strandbad Baumen",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH1050",
        label: "Strandbad Küsnacht",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH1058",
        label: "Seebad Lattenberg",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH1061",
        label: "Strandbad Bürger",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH1065",
        label: "Strandbad Reitliau",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH11005",
        label: "Solothurn",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH14013",
        label: "Schaffhausen Rheinbad Rhybadi",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH14015",
        label: "Stein am Rhein Strandbad Niderfeld",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH17003",
        label: "Strandbad Rorschach, Bodensee",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH17028",
        label: "Strandbad Stampf, Zürichsee",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH17041",
        label: "Badestrand Lago Mio",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH19004",
        label: "Vor Badi",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH19006",
        label: "Badi Tennwil",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH19007",
        label: "Seerose",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH20004",
        label: "Schwimmbad Arbon",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH20006",
        label: "Strandbad Güttingen",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH20009",
        label: "Schwimmbad Hörnli",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH20013",
        label: "Schwimmbad Romanshorn",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH20025",
        label: "Rodenbrunen",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH20035",
        label: "Seebad",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH20041",
        label: "Standbad Steckborn",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21001",
        label: "Laghetto di Astano",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21002",
        label: "Lido comunale Agno",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21003",
        label: "Campeggio La Palma",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21004",
        label: "Campeggio Molinazzo",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21006",
        label: "Bagno pubblico Agno",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21007",
        label: "Lido Càsoro",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21009",
        label: "Albergo Zappa",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21011",
        label: "Ristorante Lido Capolago",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21012",
        label: "Bagno Spiaggia Caslano",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21013",
        label: "Foce Magliasina",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21014",
        label: "Albergo Elvezia al Lago",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21015",
        label: "Albergo Villa Castagnola",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21016",
        label: "Bagno Pubblico Riva Caccia",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21018",
        label: "Hotel Lido Seegarten",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21019",
        label: "Lido Bagno Spiaggia Lugano",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21020",
        label: "Lido San Domenico",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21021",
        label: "Spiaggia delle Cantine",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21022",
        label: "Ostello della Gioventù",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21023",
        label: "Bagno spiaggia Magliaso",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21025",
        label: "Evangelisches Zentrum",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21026",
        label: "Stiftung Zuercher Ferienkolonien",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21027",
        label: "Lido Comunale Maroggia",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21028",
        label: "Campeggio Paradiso",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21029",
        label: "Campeggio Monte Generoso",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21031",
        label: "Lido Comunale Melano",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21033",
        label: "Albergo Battello",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21034",
        label: "Albergo Del Lago",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21035",
        label: "Albergo Riviera",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21036",
        label: "Lido Comunale Melide",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21040",
        label: "Hotel Ristorante Arbostora",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21042",
        label: "Lido Ristorante al Porto",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21043",
        label: "Campeggio Touring Club",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21046",
        label: "Lido Comunale Conca d'Oro",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21047",
        label: "Albergo Tresa Bay",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21048",
        label: "Lido Comunale Riva S. Vitale",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21049",
        label: "Swiss Diamond Hotel",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21050",
        label: "Albergo Ascolago",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21051",
        label: "Albergo Castello del Sole",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21052",
        label: "Albergo Collinetta",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21053",
        label: "Albergo Eden Roc",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21054",
        label: "Bagno pubblico Ascona",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21055",
        label: "Casa Moscia",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21056",
        label: "Lido Patriziale Ascona",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21058",
        label: "Hotel Yachtsport Resort",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21059",
        label: "Lido comunale Brissago",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21060",
        label: "Villa Caesar",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21061",
        label: "Bagno Pubblico Caviano",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21062",
        label: "Bagno Pubblico Riale di Gerra",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21063",
        label: "Bagno Pubblico Scimiana",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21064",
        label: "Bagno Pubblico Locarno",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21065",
        label: "Campeggio Delta",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21066",
        label: "Lido comunale Locarno",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21067",
        label: "Bagno pubblico Magadino",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21069",
        label: "Albergo La Rocca",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21070",
        label: "Bagno Spiaggia Crodolo",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21072",
        label: "Bagno pubblico San Nazzaro",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21073",
        label: "Spiaggia pubblica Ranzo",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21074",
        label: "Campeggio Campofelice",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21075",
        label: "Campeggio Lago Maggiore",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21076",
        label: "Campeggio Lido Mappo",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21077",
        label: "Campeggio Miralago",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21078",
        label: "Campeggio Rivabella",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21079",
        label: "Campeggio Tamaro",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21080",
        label: "Bagno pubblico Tenero",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21081",
        label: "Centro Sportivo Tenero",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21082",
        label: "Lido comunale Tenero",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21083",
        label: "Albergo Viralago",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21084",
        label: "Bagno pubblico Vira Gambarogno",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21085",
        label: "Casa Vignascia",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21086",
        label: "Lido comunale Bissone",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21087",
        label: "Villa Patria",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21088",
        label: "Spiaggetta di Arbedo",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21090",
        label: "Sotto il ponte",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21092",
        label: "Zona dighetta",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21093",
        label: "Pozzo Tegna",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21094",
        label: "Meriggio",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21095",
        label: "Spiaggia libera-Foce Cassarate",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21096",
        label: "Spiaggia libera-Osteria la Riva",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21097",
        label: "Spiaggia libera-Ristorante Giardino Lago",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21098",
        label: "Zona Visletto",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21099",
        label: "Zona Coop",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21100",
        label: "Zona Loderio Grotti",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21101",
        label: "Zona cascata Piumogna",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH21102",
        label: "Pozzo Osogna",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22006",
        label: "La Pichette",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22008",
        label: "Corseaux",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22009",
        label: "La Crottaz",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22011",
        label: "Bain des Dames",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22016",
        label: "Gland/La Falaise",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22022",
        label: "La Maladaire",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22023",
        label: "Bellerive",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22024",
        label: "Le Flon",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22025",
        label: "Le Parc Bourget",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22026",
        label: "La Vaudaire",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22029",
        label: "Curtinaux",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22034",
        label: "Le Pierrier",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22035",
        label: "Le Basset",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22038",
        label: "Camping",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22040",
        label: "Les Trois Jetées",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22045",
        label: "Centre",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22051",
        label: "A.B.C.",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22054",
        label: "Coulet",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22056",
        label: "Le Laviau",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22058",
        label: "Dorigny",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22061",
        label: "Centre nautique et balnéaire",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22062",
        label: "Parc de l'Arabie",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22063",
        label: "Chillon",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22064",
        label: "Les Marines",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22065",
        label: "Chaufour",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22067",
        label: "Le Pont",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22071",
        label: "Bellevue",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22075",
        label: "Camping VD 8",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22076",
        label: "Chevroux",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22080",
        label: "Cudrefin",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22082",
        label: "Corcelettes - les Pins",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22088",
        label: "Clendy",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22092",
        label: "Le Port",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH22093",
        label: "Avenches",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH24001",
        label: "Aare Marzili",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH24002",
        label: "Aare Lorraine",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25001",
        label: "Hermance plage côté embouchure",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25002",
        label: "Hermance plage",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25003",
        label: "Anière plage",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25004",
        label: "Anière aval débarcadère",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25005",
        label: "Corsier port",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25007",
        label: "Savonnière aval",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25008",
        label: "Parc de la Nymphe",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25009",
        label: "Port-Bleu",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25010",
        label: "Bellerive débarcadère",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25011",
        label: "Pointe à la Bise",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25012",
        label: "Belotte",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25014",
        label: "Aval Tour Carrée",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25015",
        label: "Port-Tunnel",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25016",
        label: "Genève-plage",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25017",
        label: "Baby-plage",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25018",
        label: "Bains des Pâquis",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25019",
        label: "ONU plage",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25020",
        label: "Reposoir",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25021",
        label: "Chambésy plage",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25022",
        label: "Vengeron (aval)",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25023",
        label: "Vengeron (centre)",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25024",
        label: "Bellevue Port Gitana",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25025",
        label: "Bains de Saugy",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25026",
        label: "Creux-de-Genthod",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25027",
        label: "La Bécassine",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25029",
        label: "Versoix plage",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25030",
        label: "Céligny plage",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25031",
        label: "Rhône pont Sous-Terre RG",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25033",
        label: "Perle du lac",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25034",
        label: "Rhône Pont-sous-Terre RD",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25035",
        label: "Etang de la Plaine",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH25036",
        label: "Plage des Eaux-Vives",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH3001",
        label: "Strandbad-Lido, Weggis",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH3004",
        label: "Ufschötti, Luzern",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH4010",
        label: "Badeplatz Mississippi (Ufer 1)",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH5002",
        label: "Lido Brunnen, SZ/02",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH6001",
        label: "Badeplatz Alpnachstad",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH7005",
        label: "Buochs Strandbad",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH9001",
        label: "Strandbad Seeliken",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH9002",
        label: "Strandbad Brüggli",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH9003",
        label: "Camping Unterägeri",
      },
      {
        value: "https://environment.ld.admin.ch/foen/ubd0104/Station/CH9004",
        label: "Strandbad Lido",
      },
    ],
    __typename: "NominalDimension",
  },
];

export const measures: Measure[] = [
  {
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "https://environment.ld.admin.ch/foen/ubd0104/value",
    }),
    isNumerical: false,
    label: "Concentration",
    isKeyDimension: false,
    values: [
      { value: 0, label: "0" },
      { value: 7700, label: "7700" },
    ],
    unit: "CFU/100mL",
    __typename: "NumericalMeasure",
    limits: [],
  },
];

export const observations: DataCubeObservations = {
  data: [
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "89",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-05-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "250",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "36",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "80",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "921",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "28",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "39",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "170",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "28",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-08-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1000",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "108",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "27",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "150",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "33",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-29",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-02",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "31",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "320",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "42",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "340",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "90",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "87",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2011-06-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-31",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "89",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "260",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "28",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "120",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "270",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "56",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "186",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "315",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2010-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-30",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "82",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "78",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "410",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "98",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "0",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "460",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "60",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-31",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "34",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "140",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "39",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "46",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-09-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-05-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "70",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "74",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-09-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "230",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "34",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "350",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "57",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "75",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "250",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "220",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "35",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "98",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "49",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2009-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "62",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2009-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "60",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "70",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2009-06-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "25",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "73",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "54",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-08-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "240",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "58",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "230",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-09-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "137",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "61",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "290",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "57",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-09-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-28",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "845",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "230",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "102",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "54",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "400",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2010-06-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "200",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "53",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "52",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-08-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "37",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-05-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "31",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "50",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2011-06-29",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "63",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-08-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "0",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-09-07",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "50",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-05-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "96",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "80",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "140",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "32",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "110",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "49",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "41",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "69",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-05-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "25",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "27",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "43",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "620",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "105",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "90",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "140",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "380",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-09-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "52",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "38",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "70",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-31",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "66",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-30",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "105",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-07-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "115",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "29",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "39",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-06-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "49",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2009-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "50",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "33",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-05-30",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "28",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "120",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-05-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "48",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "51",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "150",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "51",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "150",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "100",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1046",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "61",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "55",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-29",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "610",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-08-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-05-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-01",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "49",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "490",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "67",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1300",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-09-07",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "60",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "65",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "53",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-07",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "122",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "49",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "35",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "104",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "400",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "96",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "150",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "85",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-02",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "29",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "33",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-09-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "108",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "95",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "35",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "900",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "70",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "90",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "72",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2010-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "165",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "88",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-05-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-09-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "64",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "130",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "133",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "400",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-29",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "93",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "97",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "110",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-07-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "45",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "52",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "36",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-05-30",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "58",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "28",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "58",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "83",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "27",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "72",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-07-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "27",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "400",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "31",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2009-08-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "160",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-08-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "47",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "89",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "25",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-28",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "46",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "170",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "340",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "210",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-05-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "32",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "70",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "0",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-07-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "575",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "38",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "59",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "46",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "270",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "29",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "38",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-06-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "80",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "82",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "78",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "32",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "67",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-05-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-09-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "72",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "120",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "36",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-09-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-05-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "80",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "90",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "91",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "62",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "78",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "80",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "46",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "52",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "83",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "230",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "100",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "34",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-02",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "80",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "41",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "97",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "31",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "150",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "87",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "350",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-05-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "33",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "29",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "36",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-05-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "68",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "52",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-02",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "420",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "46",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "270",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-05-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-05-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "170",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-10-01",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-07-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "89",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "105",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "104",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-05-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "66",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "265",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2011-06-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-09-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2009-08-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "41",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-05-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "111",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1250",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "78",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "115",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "160",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-31",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-09-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "34",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "290",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "42",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "130",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-05-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-02",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "166",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "250",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "37",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "44",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "95",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "160",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "440",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-05-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "70",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-29",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-02",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-10-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "61",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "71",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "36",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "60",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "48",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-31",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "250",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2011-06-28",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-05-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "47",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "46",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-05-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "42",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-05-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "32",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "46",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "0",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "120",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-05-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "80",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-09-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "290",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "455",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-05-28",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "49",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2010-06-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "250",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "52",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-26",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1100",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "69",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "101",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "36",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-09-07",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "50",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-07-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "190",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "50",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "72",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "59",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "59",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "28",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "71",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "87",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "230",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "55",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "37",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-07",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "132",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "130",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "47",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "49",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "110",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "75",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-05-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "66",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "57",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "51",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "160",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "25",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "140",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "210",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "120",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "31",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "130",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "62",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "42",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-05-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "210",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-29",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "60",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "200",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-28",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "67",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "280",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "98",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "470",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "240",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "130",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-05-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "33",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "34",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2009-08-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "63",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "140",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "29",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "43",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-29",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "81",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "210",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "42",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "80",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "85",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "108",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-01",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "78",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "100",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "36",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "36",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "43",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "35",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "35",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "32",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "59",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-05-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "73",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "39",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2011-06-28",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-06-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "32",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "665",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "29",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1733",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "31",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-10-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "51",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-06-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "66",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "120",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-05-30",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-06-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "47",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-29",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "89",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "355",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "46",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-30",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "89",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "38",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "27",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "58",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "29",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "46",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "204",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "190",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "35",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "59",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-10-01",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "160",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "570",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "675",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "25",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-01",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "90",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "112",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "98",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "52",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "160",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "80",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "64",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "48",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "31",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "150",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "39",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-06-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1260",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "27",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2010-06-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-05-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "0",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "180",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-05-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-05-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "28",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "36",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2009-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "320",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-10-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "120",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "16",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-29",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "70",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "19",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-05-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "0",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "43",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-05-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-10-01",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "70",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "34",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "530",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "120",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "150",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "190",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-05-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "51",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "575",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "25",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "50",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-05",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "28",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-06-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "90",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "58",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-10-01",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2009-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "92",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "62",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4000",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "72",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-05-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "27",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "345",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "96",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "21",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "42",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2013-05-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "41",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-01",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "35",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "70",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "170",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "51",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "127",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "63",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "11",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "60",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "0",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "560",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "5",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "53",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "55",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "La Bécassine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "170",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-05-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "42",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "325",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "13",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-05-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "47",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "38",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-21",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "64",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "47",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "61",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-09-18",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "210",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "180",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "69",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-11",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "2",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2011-06-28",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "120",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-10-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "118",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Etang de la Plaine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "56",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "75",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "26",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "33",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "260",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "63",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "27",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "20",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "150",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-06-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "38",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "52",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Versoix plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-05-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "22",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "7",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Parc de la Nymphe",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "350",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "71",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Bleu",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "51",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "140",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2010-06-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "240",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "47",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "140",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Portalban",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-08-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "28",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Creux-de-Genthod",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "87",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Vengeron (centre)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-09-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "12",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Badi Tennwil",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-04-25",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Savonnière aval",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-07-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "320",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Chambésy plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-14",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "9",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "200",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Pointe à la Bise",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-07-20",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "78",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Belotte",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-06-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "53",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Corsier port",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "23",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-06-22",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Hermance plage côté embouchure",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-05-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "40",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-09-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "27",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-07-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "17",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "200",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "ONU plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "250",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Nouvelle plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-08-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Perle du lac",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-10",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Bains de Saugy",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-05-08",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "60",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "41",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bains des Pâquis",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "4",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-04-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage des Eaux-Vives",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-09-09",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellerive débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-08-12",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Port-Tunnel",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-10-01",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "43",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-07-15",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vor Badi",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2016-09-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "43",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône Pont-sous-Terre RD",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-06-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "30",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Baby-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-09-30",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "88",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Lorraine",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-16",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Plage de Gumefens",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2015-08-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "8",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_AG",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Seerose",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2019-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Genève-plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-06",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "47",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Bellevue Port Gitana",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "10",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Hermance plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-06-02",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "550",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-08-19",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "6",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Vengeron (aval)",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-06-24",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "42",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Anière aval débarcadère",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2017-07-03",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "24",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Céligny plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "170",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Aval Tour Carrée",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-04-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "1",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Anière plage",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-07-17",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "18",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2012-07-04",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "14",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_FR",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Gemeinde Strandbad",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2014-07-23",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "3",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station":
        "Rhône pont Sous-Terre RG",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2020-08-27",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "220",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_BE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Aare Marzili",
    },
    {
      "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing":
        "2018-08-13",
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": "E.coli",
      "https://environment.ld.admin.ch/foen/ubd0104/value": "15",
      "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
        "BAQUA_GE",
      "https://environment.ld.admin.ch/foen/ubd0104/station": "Reposoir",
    },
  ],
  sparqlEditorUrl:
    "https://lindas.admin.ch/sparql/#query=SELECT%20DISTINCT%20%3Fdimension0%20%3Fdimension1%20%3Fdimension2%20%3Fdimension3%20%3Fdimension4%20%3Fdimension5%20WHERE%20%7B%0A%20%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2F4%2F%3E%20%3Chttps%3A%2F%2Fcube.link%2FobservationSet%3E%20%3FobservationSet0%20.%0A%20%20%3FobservationSet0%20%3Chttps%3A%2F%2Fcube.link%2Fobservation%3E%20%3Fsource0%20.%0A%20%20%3Fsource0%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2Fdateofprobing%3E%20%3Fdimension0%20.%0A%20%20%3Fsource0%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2Fparametertype%3E%20%3Fdimension1%20.%0A%20%20%3Fsource0%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2Fvalue%3E%20%3Fdimension2%20.%0A%20%20%3Fsource0%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2Fmonitoringprogramm%3E%20%3Fdimension3%20.%0A%20%20%3Fsource0%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2Fstation%3E%20%3Fdimension4%20.%0A%20%20%3Fdimension4%20%3Chttp%3A%2F%2Fschema.org%2FsameAs%3E%20%3Fdimension6%20.%0A%20%20FILTER%20(%0A%20%20%20%20(%3Fdimension1%20%3D%20%22E.coli%22)%0A%20%20)%0A%20%20FILTER%20(%0A%20%20%20%20(%3Fdimension6%20IN%20(%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH19006%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH19004%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH24002%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH24001%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH10004%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH10009%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH10001%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH10007%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH19007%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25004%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25003%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25014%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25017%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25025%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25018%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25010%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25024%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25012%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25021%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25005%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25026%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25030%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25035%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25016%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25002%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25001%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25027%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25019%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25008%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25033%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25036%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25011%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25009%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25015%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25020%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25034%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25031%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25007%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25022%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25023%3E%2C%20%3Chttps%3A%2F%2Fenvironment.ld.admin.ch%2Ffoen%2Fubd0104%2FStation%2FCH25029%3E))%0A%20%20)%0A%20%20OPTIONAL%20%7B%0A%20%20%20%20%3Fdimension4%20%3Chttp%3A%2F%2Fschema.org%2Fname%3E%20%3Fdimension5_0%20.%0A%20%20%20%20FILTER%20(%0A%20%20%20%20%20%20LANGMATCHES(LANG(%3Fdimension5_0)%2C%20%22en%22)%0A%20%20%20%20)%0A%20%20%7D%0A%20%20OPTIONAL%20%7B%0A%20%20%20%20%3Fdimension4%20%3Chttp%3A%2F%2Fschema.org%2Fname%3E%20%3Fdimension5_1%20.%0A%20%20%20%20FILTER%20(%0A%20%20%20%20%20%20LANGMATCHES(LANG(%3Fdimension5_1)%2C%20%22de%22)%0A%20%20%20%20)%0A%20%20%7D%0A%20%20OPTIONAL%20%7B%0A%20%20%20%20%3Fdimension4%20%3Chttp%3A%2F%2Fschema.org%2Fname%3E%20%3Fdimension5_2%20.%0A%20%20%20%20FILTER%20(%0A%20%20%20%20%20%20LANGMATCHES(LANG(%3Fdimension5_2)%2C%20%22fr%22)%0A%20%20%20%20)%0A%20%20%7D%0A%20%20OPTIONAL%20%7B%0A%20%20%20%20%3Fdimension4%20%3Chttp%3A%2F%2Fschema.org%2Fname%3E%20%3Fdimension5_3%20.%0A%20%20%20%20FILTER%20(%0A%20%20%20%20%20%20LANGMATCHES(LANG(%3Fdimension5_3)%2C%20%22it%22)%0A%20%20%20%20)%0A%20%20%7D%0A%20%20OPTIONAL%20%7B%0A%20%20%20%20%3Fdimension4%20%3Chttp%3A%2F%2Fschema.org%2Fname%3E%20%3Fdimension5_4%20.%0A%20%20%20%20FILTER%20(%0A%20%20%20%20%20%20(LANG(%3Fdimension5_4)%20%3D%20%22%22)%0A%20%20%20%20)%0A%20%20%7D%0A%20%20BIND(COALESCE(%3Fdimension5_0%2C%20%3Fdimension5_1%2C%20%3Fdimension5_2%2C%20%3Fdimension5_3%2C%20%3Fdimension5_4)%20AS%20%3Fdimension5)%0A%7D%0AGROUP%20BY%20%3Fdimension0%20%3Fdimension1%20%3Fdimension2%20%3Fdimension3%20%3Fdimension4%20%3Fdimension5&requestMethod=POST",
};
