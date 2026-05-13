[back](../README.md)

# Domain

## Data Flow

This is how the data flows through the application:

```mermaid
flowchart TD
    sources["Data Sources<br>(RDF/SPARQL endpoints)"]
    graphql["GraphQL Layer<br>(resolvers, data transforms)"]
    configurator["Chart Configurator<br>(dataset selection and config UI)"]
    renderer["Chart Rendering<br>(D3.js)"]
    persistence["Persistence<br>(Prisma/PostgreSQL)"]

    graphql -->|SPARQL queries| sources
    sources -->|RDF results| graphql

    configurator -->|metadata queries| graphql
    graphql -->|cube metadata| configurator

    renderer -->|observation queries| graphql
    graphql -->|observation data| renderer

    configurator -->|live config preview| renderer

    configurator -->|save chart config| persistence
    persistence -->|load chart config| configurator

    persistence -->|load chart config| renderer
```

## Supported Chart Types

- Area charts (single and stacked)
- Bar charts (grouped and stacked, horizontal and vertical)
- Line charts (single and multiple)
- Combo charts (line+column, dual-axis, multi-line)
- Maps (with symbols and areas)
- Pie charts
- Scatterplots
- Tables
