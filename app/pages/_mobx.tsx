import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { TreeItem, TreeView } from "@mui/lab";
import {
  CircularProgress,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import keyBy from "lodash/keyBy";
import {
  observable,
  makeObservable,
  computed,
  flow,
  configure,
  ObservableMap,
} from "mobx";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { Client, OperationResult, useClient } from "urql";

import { DataSource } from "@/configurator";
import {
  DataCubeMetadataWithComponentValuesDocument,
  DataCubeMetadataWithComponentValuesQuery,
  DataCubeMetadataWithComponentValuesQueryVariables,
  Dimension,
  DimensionHierarchyDocument,
  DimensionHierarchyQuery,
  DimensionHierarchyQueryVariables,
  HierarchyValue,
  Measure,
} from "@/graphql/query-hooks";
import { visitHierarchy } from "@/rdf/tree-utils";

configure({ enforceActions: "always" });

type QueryResult<T> = {
  fetchStatus: "loaded" | "loading" | "idle";
  error: Error | undefined;
  data: T | undefined;
};

class Cube {
  client: Client;
  iri: string;
  source: DataSource;
  dimensions: undefined | Dimension[];
  measures: undefined | Measure[];
  loading: boolean;
  hierarchies: ObservableMap<string, QueryResult<HierarchyValue[]>>;

  constructor(client: Client, iri: string, source: DataSource) {
    this.client = client;
    this.iri = iri;
    this.source = source;
    this.loading = false;
    this.dimensions = undefined;
    this.measures = undefined;
    this.hierarchies = observable.map<string, QueryResult<HierarchyValue[]>>();
    makeObservable(this, {
      loading: observable,
      dimensions: observable.struct,
      measures: observable.struct,
      components: computed,
      componentsByIri: computed,
      hierarchies: observable,
      hierarchyParents: computed,
      load: flow,
      loadHierarchy: flow,
    });
  }

  *load() {
    const vars: DataCubeMetadataWithComponentValuesQueryVariables = {
      iri: this.iri,
      locale: "en",
      sourceType: this.source.type,
      sourceUrl: this.source.url,
    };

    try {
      this.loading = true;
      const res: OperationResult<DataCubeMetadataWithComponentValuesQuery> =
        yield this.client
          .query<DataCubeMetadataWithComponentValuesQuery>(
            DataCubeMetadataWithComponentValuesDocument,
            vars
          )
          .toPromise();

      this.dimensions = res.data?.dataCubeByIri?.dimensions;
      this.measures = res.data?.dataCubeByIri?.measures;
      this.loading = false;
      for (let component of this.components) {
        this.hierarchies.set(
          component.iri,
          observable.object({
            fetchStatus: "idle",
            error: undefined,
            data: undefined,
          })
        );
      }
    } finally {
      this.loading = false;
    }
  }

  *loadHierarchy(dimensionIri: string) {
    const vars: DimensionHierarchyQueryVariables = {
      cubeIri: this.iri,
      dimensionIri,
      locale: "en",
      sourceType: this.source.type,
      sourceUrl: this.source.url,
    };

    const ourHierarchy = this.hierarchies.get(dimensionIri);
    if (!ourHierarchy) {
      return;
    }
    ourHierarchy.fetchStatus = "loading";
    try {
      const res: OperationResult<DimensionHierarchyQuery> = yield this.client
        .query<DimensionHierarchyQuery>(DimensionHierarchyDocument, vars)
        .toPromise();
      const hierarchy = res.data?.dataCubeByIri?.dimensionByIri?.hierarchy;
      if (hierarchy) {
        ourHierarchy.data = hierarchy;
      }
    } finally {
      ourHierarchy.fetchStatus = "loaded";
    }
  }

  get components() {
    return [
      ...(this.dimensions?.slice() || []),
      ...(this.measures?.slice() || []),
    ];
  }

  get hierarchyParents() {
    const res: Record<
      Dimension["iri"],
      Record<HierarchyValue["value"], HierarchyValue["value"]>
    > = {};
    for (let k of this.hierarchies.keys()) {
      const parents: Record<HierarchyValue["value"], HierarchyValue["value"]> =
        {};
      res[k] = parents;
      const hierarchy = this.hierarchies.get(k)?.data!;
      visitHierarchy(hierarchy, (node) => {
        for (let c of node.children || []) {
          parents[c.value] = node.value;
        }
      });
    }
    return res;
  }

  get componentsByIri() {
    return keyBy(this.components, (x) => x.iri);
  }
}

const HierarchyTree = observer(
  ({ cube, dimensionIri }: { cube: Cube; dimensionIri: string }) => {
    const render = (node: HierarchyValue) => {
      return (
        <TreeItem key={node.value} label={node.label} nodeId={node.value}>
          {node?.children?.map((c) => render(c))}
        </TreeItem>
      );
    };
    const hierarchy = cube.hierarchies.get(dimensionIri);
    if (!hierarchy?.data) {
      return <Typography color="info">No hierarchy</Typography>;
    }

    return hierarchy?.data ? (
      <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        sx={{ flexGrow: 1, maxWidth: 400, overflowY: "auto" }}
      >
        {hierarchy.data.map((h) => render(h))}
      </TreeView>
    ) : null;
  }
);

const CubeView = observer(({ cube }: { cube: Cube }) => {
  return (
    <span>
      {cube.loading ? <CircularProgress size={10} /> : null}
      <Box
        component="ul"
        sx={{
          listStyleType: "none",
          pl: 0,
          ml: 0,
          "& > * + *": { marginTop: "1rem" },
        }}
      >
        {cube.components.map((c) => {
          const hierarchy = cube.hierarchies.get(c.iri);
          const fetchStatus = hierarchy?.fetchStatus;
          return (
            <li key={c.iri}>
              <Typography variant="h4">{c.label}</Typography>
              <Typography variant="caption">{c.description}</Typography>

              <div>
                <Typography
                  variant="h5"
                  sx={{ minHeight: 40, display: "flex", alignItems: "center" }}
                >
                  Hierarchy
                  {fetchStatus === "loaded" ? null : (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => cube.loadHierarchy(c.iri)}
                    >
                      {fetchStatus === "idle" ? "load" : null}
                      {fetchStatus === "loading" ? (
                        <CircularProgress color="secondary" />
                      ) : null}
                    </Button>
                  )}
                </Typography>
              </div>
              {cube.hierarchies.get(c.iri)?.fetchStatus === "loaded" ? (
                <HierarchyTree cube={cube} dimensionIri={c.iri} />
              ) : (
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  not loaded
                </Typography>
              )}
            </li>
          );
        })}
      </Box>
      <button onClick={() => cube.load()}>Load</button>
    </span>
  );
});

const Page = observer(() => {
  const [iri, setIri] = useState<string>(
    "https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/8"
  );
  const client = useClient();
  const cube = useMemo(() => {
    if (!iri) {
      return;
    }
    const cube = new Cube(client, iri, {
      type: "sparql",
      url: "https://int.lindas.admin.ch/query",
    });
    cube.load();
    return cube;
  }, [client, iri]);
  return (
    <Box sx={{ margin: "auto", width: 800, my: "2rem" }}>
      <TextField
        label="Cube IRI"
        type="text"
        value={iri}
        onChange={(ev) => setIri(ev.target.value)}
      />
      {cube ? <CubeView key={iri} cube={cube} /> : <div>Choose an iri</div>}
    </Box>
  );
});

export default Page;
