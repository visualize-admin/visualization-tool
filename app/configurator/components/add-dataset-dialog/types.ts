import { Dimension, Termset } from "@/domain/data";
import { ComponentId } from "@/graphql/make-component-id";

export type SearchOptions =
  | {
      type: "temporal";

      /** Contains for now the join by id */
      id: ComponentId;
      label: string;
      timeUnit: string;
      originalIds: Dimension["originalIds"];
    }
  | {
      type: "shared";
      /** Technically it's an iri, but we keep the id name for the sake of type consistency. */
      id: string;
      label: string;
      termsets: Termset[];
    };
