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
  async requestDidStart({ request }) {
    const rootSpan = Sentry.startSpanManual(
      {
        op: "gql",
        name: request.operationName
          ? `GQL - ${request.operationName}`
          : "GQL - Unnamed",
      },
      (span) => span
    );

    const dataCubeIri = getDataCubeIri(request);

    if (dataCubeIri) {
      Sentry.setTag("visualize.dataCubeIri", dataCubeIri);
    }

    if (request.variables?.sourceUrl) {
      Sentry.setTag("visualize.sourceUrl", request.variables.sourceUrl);
    }

    return {
      async willSendResponse() {
        rootSpan.end();
      },

      async executionDidStart() {
        return {
          willResolveField({ info }) {
            const description = `${info.parentType.name}.${info.fieldName}`;

            const span = Sentry.startSpanManual(
              {
                op: "resolver",
                name: description,
                parentSpan: rootSpan,
              },
              (span) => span
            );

            return () => {
              span.end();
            };
          },
        };
      },
    };
  },
};
