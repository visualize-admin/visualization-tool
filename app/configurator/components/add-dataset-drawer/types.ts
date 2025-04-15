import { Termset } from "@/domain/data";
import { ComponentId } from "@/graphql/make-component-id";
import { TimeUnit } from "@/graphql/query-hooks";

type OriginalId = {
  /** Versioned cube IRI */
  cubeIri: string;
  dimensionId: ComponentId;
};
export type SearchOptions =
  | {
      type: "temporal";

      /** Contains for now the join by id */
      id: ComponentId;
      label: string;
      timeUnit: TimeUnit;
      originalIds: OriginalId[];
    }
  | {
      type: "shared";
      /** Technically it's an iri, but we keep the id name for the sake of type consistency. */
      id: string;
      label: string;
      termsets: Termset[];
      originalIds: OriginalId[];
    };
