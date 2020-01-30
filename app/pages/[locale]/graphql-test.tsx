import "isomorphic-unfetch";
import { Provider, createClient } from "urql";
import { useDataCubesQuery } from "../../graphql/query-hooks";

const client = createClient({
  url: "/api/graphql"
});

// const getCubes = gql`
//   query GetDataCubes {
//     dataCubes {
//       iri
//       title
//       contact
//       description
//     }
//   }
// `;

const Cubes = () => {
  const [result] = useDataCubesQuery({
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
