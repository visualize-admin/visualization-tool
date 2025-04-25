import { ParsedWMSLayer } from "./wms-utils";
import { ParsedWMTSLayer } from "./wmts-utils";

export type CustomLayer = ParsedWMSLayer | ParsedWMTSLayer;
