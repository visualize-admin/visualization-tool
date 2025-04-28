import { RemoteWMSLayer } from "./wms-utils";
import { RemoteWMTSLayer } from "./wmts-utils";

export type RemoteLayer = RemoteWMSLayer | RemoteWMTSLayer;
