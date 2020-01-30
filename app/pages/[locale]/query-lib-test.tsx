import { useDataSets, DataCubeProvider } from "../../domain";


const Cubes = () => {
  const result = useDataSets();

  if (result.data) {
    return (
      <ul>
        {result.data.map(cb => (
          <li key={cb.iri}>
            <h4>{cb.label.value}</h4>
            <p>{cb.extraMetadata.get("description")?.value}</p>
          </li>
        ))}
      </ul>
    );
  }
  return <div>Loading?</div>;
};

export default () => (
  <DataCubeProvider>
    Hello <Cubes />
  </DataCubeProvider>
);
