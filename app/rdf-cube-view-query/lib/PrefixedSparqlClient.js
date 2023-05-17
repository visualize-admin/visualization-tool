function createPrefixedSparqlClient({ client, queryPrefix }) {
  const prefix = queryPrefix;
  return {
    query: {
      construct: (query, ...args) =>
        client.query.construct(`${prefix}\n${query}`, ...args),
      select: (query, ...args) =>
        client.query.select(`${prefix}\n${query}`, ...args),
    },
  };
}
module.exports = createPrefixedSparqlClient;
