import { ApolloServerPlugin, GraphQLRequest } from "apollo-server-plugin-base";

import { Sentry } from "@/sentry.server.config";

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
    return variables?.iri;
  } else if (operationName === "DimensionHierarchy") {
    return variables?.cubeIri;
  } else {
    return variables?.dataCubeIri;
  }
};

const plugin: ApolloServerPlugin = {
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

    return {
      willSendResponse() {
        // hook for transaction finished
        transaction.finish();
      },
      executionDidStart() {
        return {
          willResolveField({ info }) {
            // hook for each new resolver
            const description = `${info.parentType.name}.${info.fieldName}`;
            const span = transaction.startChild({
              op: "resolver",
              description: `${description}`,
            });
            return () => {
              // this will execute once the resolver is finished
              span.finish();
            };
          },
        };
      },
    };
  },
};

export default plugin;
