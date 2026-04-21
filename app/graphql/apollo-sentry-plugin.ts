import * as Sentry from "@sentry/nextjs";
import { ApolloServerPlugin, GraphQLRequest } from "apollo-server-plugin-base";

const getDataCubeIri = (req: GraphQLRequest) => {
  const { variables, operationName } = req;
  if (
    operationName === "DataCubePreview" ||
    operationName === "DataCubeMetadata" ||
    operationName === "DataCubeObservations" ||
    operationName === "Components" ||
    operationName === "ComponentsWithHierarchies" ||
    operationName === "PossibleFilters"
  ) {
    return variables?.iri ?? variables?.cubeFilter?.iri;
  } else if (operationName === "DimensionHierarchy") {
    return variables?.cubeIri;
  } else {
    return variables?.dataCubeIri;
  }
};

export const SentryPlugin: ApolloServerPlugin = {
  requestDidStart({ request }) {
    const transaction = Sentry.startTransaction({
      op: "gql",
      name: "GQL - Unnamed", // this will be the default name, unless the gql query has a name
    });

    if (!!request.operationName) {
      // set the transaction Name if we have named queries
      transaction.setName(`GQL - ${request.operationName!}`);
    }

    const dataCubeIri = getDataCubeIri(request);

    if (dataCubeIri) {
      transaction.setTag("visualize.dataCubeIri", dataCubeIri);
    }

    if (request.variables?.sourceUrl) {
      transaction.setTag("visualize.sourceUrl", request.variables.sourceUrl);
    }

    return Promise.resolve({
      willSendResponse() {
        // hook for transaction finished
        transaction.finish();
        return Promise.resolve();
      },
      executionDidStart() {
        return Promise.resolve({
          willResolveField({ info }) {
            // hook for each new resolver
            const description = `${info.parentType.name}.${info.fieldName}`;
            const span = transaction.startChild({
              op: "resolver",
              description,
            });

            return span.finish();
          },
        });
      },
    });
  },
};
