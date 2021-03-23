import { Plural, t, Trans } from "@lingui/macro";
import { ReactNode, useRef, useState } from "react";
import { Box, Button, Flex, Text } from "theme-ui";
import { useDebounce } from "use-debounce";
import { useConfiguratorState } from "..";
import { Checkbox, MiniSelect, SearchField } from "../../components/form";
import { Loading } from "../../components/hint";
import {
  DataCubeResultOrder,
  useDataCubesQuery,
} from "../../graphql/query-hooks";
import { DataCubePublicationStatus } from "../../graphql/resolver-types";
import { useLocale } from "../../locales/use-locale";

export const DataSetList = () => {
  const locale = useLocale();
  const [includeDrafts, toggleIncludeDrafts] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery] = useDebounce(query, 150, { leading: true });
  const [order, setOrder] = useState<DataCubeResultOrder>(
    DataCubeResultOrder.TitleAsc
  );
  const previousOrderRef = useRef<DataCubeResultOrder>(
    DataCubeResultOrder.TitleAsc
  );

  // Use the debounced query value here only!
  const [{ data }] = useDataCubesQuery({
    variables: { locale, query: debouncedQuery, order, includeDrafts },
  });

  const options = [
    {
      value: DataCubeResultOrder.Score,
      label: t({ id: "dataset.order.relevance", message: `Relevance` }),
    },
    {
      value: DataCubeResultOrder.TitleAsc,
      label: t({ id: "dataset.order.title", message: `Title` }),
    },
    {
      value: DataCubeResultOrder.CreatedDesc,
      label: t({ id: "dataset.order.newest", message: `Newest` }),
    },
  ];

  const searchLabel = t({
    id: "dataset.search.label",
    message: `Search datasets`,
  });

  const isSearching = query !== "";
  console.log(data);

  return (
    <Flex
      sx={{
        bg: "monochrome100",
        flexDirection: "column",
        height: "100%",
      }}
      role="search"
    >
      <Box
        sx={{
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "monochrome300",
        }}
      >
        {/* <SectionTitle>
            <Trans id="controls.select.dataset">Select Dataset</Trans>
          </SectionTitle> */}
        <Box sx={{ px: 4, pt: 4 }}>
          <SearchField
            id="datasetSearch"
            label={searchLabel}
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
              if (query === "" && e.currentTarget.value !== "") {
                previousOrderRef.current = order;
                setOrder(DataCubeResultOrder.Score);
              }
              if (query !== "" && e.currentTarget.value === "") {
                setOrder(previousOrderRef.current);
              }
            }}
            onReset={() => {
              setQuery("");
              setOrder(previousOrderRef.current);
            }}
            placeholder={searchLabel}
          ></SearchField>
        </Box>

        {isSearching && ( // FIXME: only display on SearchField focus
          <Box sx={{ px: 4, pt: 4 }}>
            <Checkbox
              label={
                <Trans id="dataset.includeDrafts">Include draft datasets</Trans>
              }
              name={"dataset-include-drafts"}
              value={"dataset-include-drafts"}
              checked={includeDrafts}
              disabled={false}
              onChange={() => toggleIncludeDrafts(!includeDrafts)}
            />
          </Box>
        )}

        <Flex sx={{ px: 4, py: 2, justifyContent: "space-between" }}>
          <Text
            color="secondary"
            sx={{
              fontFamily: "body",
              fontSize: [2, 2, 2],
              lineHeight: "24px",
            }}
            aria-live="polite"
          >
            {data && (
              <Plural
                id="dataset.results"
                value={data.dataCubes.length}
                zero="No results"
                one="# result"
                other="# results"
              />
            )}
          </Text>

          <Flex>
            <label htmlFor="datasetSort">
              <Text
                color="secondary"
                sx={{
                  fontFamily: "body",
                  fontSize: [1, 2, 2],
                  lineHeight: "24px",
                }}
              >
                <Trans id="dataset.sortby">Sort by</Trans>
              </Text>
            </label>

            <MiniSelect
              id="datasetSort"
              value={order}
              options={isSearching ? options : options.slice(1)}
              onChange={(e) => {
                previousOrderRef.current = e.currentTarget
                  .value as DataCubeResultOrder;
                setOrder(e.currentTarget.value as DataCubeResultOrder);
              }}
            ></MiniSelect>
          </Flex>
        </Flex>
      </Box>

      <Box
        sx={{ overflowX: "hidden", overflowY: "auto", flexGrow: 1 }}
        tabIndex={-1}
      >
        {data ? (
          data.dataCubes.map(
            ({ dataCube, highlightedTitle, highlightedDescription }) => (
              <DatasetButton
                key={dataCube.iri}
                iri={dataCube.iri}
                title={dataCube.title}
                description={dataCube.description}
                highlightedTitle={highlightedTitle}
                highlightedDescription={highlightedDescription}
                isDraft={
                  dataCube.publicationStatus === DataCubePublicationStatus.Draft
                }
              />
            )
          )
        ) : (
          <Loading />
        )}
      </Box>
    </Flex>
  );
};

export const DatasetButton = ({
  iri,
  title,
  description,
  highlightedTitle,
  highlightedDescription,
  isDraft,
}: {
  iri: string;
  title: string;
  description?: string | null;
  highlightedTitle?: string | null;
  highlightedDescription?: string | null;
  isDraft: boolean;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const selected = iri === state.dataSet;

  return (
    <Button
      variant="reset"
      onClick={() => dispatch({ type: "DATASET_SELECTED", dataSet: iri })}
      sx={{
        bg: selected ? "mutedDarker" : "transparent",
        position: "relative",
        color: "monochrome700",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        py: 4,
        borderRadius: 0,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome300",

        ":hover": {
          bg: "mutedDarker",
        },
        ":active": {
          bg: "mutedDarker",
        },
      }}
    >
      {selected && (
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "calc(100% + 2px)",
            bg: "primary",
            marginTop: "-1px",
          }}
        ></Box>
      )}
      <Text variant="paragraph2" sx={{ fontWeight: "bold" }} pb={1}>
        {highlightedTitle ? (
          <Box
            as="span"
            sx={{ "& > strong": { bg: "primaryLight" } }}
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />
        ) : (
          title
        )}
      </Text>
      <Text variant="paragraph2">
        {highlightedDescription ? (
          <Box
            as="span"
            sx={{ "& > strong": { bg: "primaryLight" } }}
            dangerouslySetInnerHTML={{ __html: highlightedDescription }}
          />
        ) : (
          description
        )}
      </Text>
      {isDraft && (
        <DatasetTag>
          <Trans id="dataset.tag.draft">Draft</Trans>
        </DatasetTag>
      )}
    </Button>
  );
};

const DatasetTag = ({ children }: { children: ReactNode }) => (
  <Text
    variant="paragraph2"
    sx={{
      bg: "primaryLight",
      mt: 2,
      px: 2,
      width: "fit-content",
      borderRadius: "default",
    }}
  >
    {children}
  </Text>
);
