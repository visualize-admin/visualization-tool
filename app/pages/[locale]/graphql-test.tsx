import "isomorphic-unfetch";
import { Provider, createClient } from "urql";
import { useDataCubesWithObservationsQuery } from "../../graphql/query-hooks";

const client = createClient({
  url: "/api/graphql"
});

const Cubes = () => {
  const [result] = useDataCubesWithObservationsQuery({
    // query: getCubes,
    requestPolicy: "network-only"
  });

  if (result.data) {
    return (
      <ul>
        {result.data.dataCubes.map(cb => (
          <li key={cb.iri}>
            <h4>{cb.title}</h4>
            <p>{cb.contact}</p>
            <p>{cb.description}</p>
            <ul>
              {/* {cb.observations.map((o, i) => (
                <li key={i}>{JSON.stringify(o)}</li>
              ))} */}
            </ul>
          </li>
        ))}
      </ul>
    );
  }
  return <div>Loading?</div>;
};

export default () => (
  <Provider value={client}>
    Hello <Cubes />
  </Provider>
);
