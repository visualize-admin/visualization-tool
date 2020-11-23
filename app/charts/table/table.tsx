import { Trans } from "@lingui/macro";
import { Box, Flex, Text } from "@theme-ui/components";
import FlexSearch from "flexsearch";
import { useCallback, useMemo, useState, forwardRef } from "react";
import {
  useExpanded,
  useFlexLayout,
  useGroupBy,
  useSortBy,
  useTable,
} from "react-table";
import { FixedSizeList } from "react-window";
import { Input, Switch } from "../../components/form";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
import { useChartState } from "../shared/use-chart-state";
import { CellDesktop } from "./cell-desktop";
import { DDContent } from "./cell-mobile";
import { TABLE_HEIGHT } from "./constants";
import { GroupHeader } from "./group-header";
import { TableHeader } from "./table-header";
import { scrollbarWidth } from "./table-helpers";
import { TableChartState } from "./table-state";

export const Table = () => {
  const {
    bounds,
    rowHeight,
    data,
    showSearch,
    tableColumns,
    tableColumnsMeta,
    groupingIris,
    hiddenIris,
    sortingIris,
  } = useChartState() as TableChartState;

  const [useAlternativeMobileView, toggleAlternativeMobileView] = useState(
    false
  );

  // Search & filter data
  const [searchTerm, setSearchTerm] = useState("");
  const searchIndex = useMemo(() => {
    // Don't index measure columns
    const searchFields = Object.values(tableColumnsMeta).flatMap((m) =>
      m.columnComponentType === "Measure" ? [] : [m.slugifiedIri]
    );

    const index = FlexSearch.create({
      tokenize: "full",
      doc: {
        id: "id",
        field: searchFields,
      },
    });

    index.add(data);

    return index;
  }, [tableColumnsMeta, data]);

  const filteredData = useMemo(() => {
    const searchResult =
      searchTerm !== "" ? searchIndex.search({ query: `${searchTerm}` }) : data;
    return searchResult as Observation[];
  }, [data, searchTerm, searchIndex]);

  // Table Instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
    state: tableState,
  } = useTable<Observation>(
    {
      columns: tableColumns,
      data: filteredData,
      autoResetExpanded: false,
      useControlledState: (state) => {
        return useMemo(
          () => ({
            ...state,
            sortBy: [...state.sortBy, ...sortingIris],
            groupBy: groupingIris,
            hiddenColumns: hiddenIris,
          }),
          [state, groupingIris, hiddenIris, sortingIris]
        );
      },
    },
    useFlexLayout,
    useGroupBy,
    useSortBy,
    useExpanded
  );

  // If the table has a custom sort, the tableState.sortBy has these items prepended.
  const customSortCount = tableState.sortBy.length - sortingIris.length;

  // React.useEffect(() => {
  //   bounds.width > 700 && toggleAlternativeMobileView(false);
  // }, [bounds.width]);

  // Desktop row
  const renderDesktopRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <Box
          {...row.getRowProps({
            style: { ...style, minWidth: "100%" },
          })}
          sx={{ borderBottom: "1px solid", borderBottomColor: "monochrome400" }}
        >
          {row.subRows.length === 0 ? (
            row.cells.map((cell, i) => {
              return (
                <CellDesktop
                  key={i}
                  cell={cell}
                  columnMeta={tableColumnsMeta[cell.column.id]}
                />
              );
            })
          ) : (
            <GroupHeader row={row} groupingLevels={groupingIris.length} />
          )}
        </Box>
      );
    },
    [groupingIris.length, prepareRow, rows, tableColumnsMeta]
  );

  // Mobile row
  // const MOBILE_ROW_HEIGHT = 32;
  // const getMobileItemSize = (index: number) => {
  //   return rows[index].isGrouped
  //     ? MOBILE_ROW_HEIGHT
  //     : visibleColumns.length * MOBILE_ROW_HEIGHT;
  // };

  // const renderMobileRow = useCallback(
  //   ({ index, style }) => {
  //     const row = rows[index];
  //     prepareRow(row);

  //     const headingLevel =
  //       row.depth === 0 ? "h2" : row.depth === 1 ? "h3" : "p";

  //     return (
  //       <>
  //         <Box
  //           {...row.getRowProps({
  //             style: { ...style, flexDirection: "column" },
  //           })}
  //         >
  //           {row.subRows.length === 0 ? (
  //             row.cells.map((cell, i) => {
  //               return (
  //                 <Flex
  //                   key={i}
  //                   as="dl"
  //                   sx={{
  //                     color: "monochrome800",
  //                     fontSize: 2,
  //                     width: "100%",
  //                     height: MOBILE_ROW_HEIGHT,
  //                     justifyContent: "space-between",
  //                     alignItems: "center",
  //                     // my: 2,
  //                     // "&:first-of-type": {
  //                     //   pt: 2,
  //                     // },
  //                     "&:last-of-type": {
  //                       borderBottom: "1px solid",
  //                       borderBottomColor: "monochrome400",
  //                       // pb: 3,
  //                     },
  //                   }}
  //                 >
  //                   <Box
  //                     as="dt"
  //                     sx={{ flex: "1 1 100%", fontWeight: "bold", mr: 2 }}
  //                   >
  //                     {cell.column.Header}
  //                   </Box>
  //                   <Box
  //                     as="dd"
  //                     sx={{ flex: "1 1 100%", ml: 2, position: "relative" }}
  //                   >
  //                     <DDContent
  //                       cell={cell}
  //                       columnMeta={tableColumnsMeta[cell.column.id]}
  //                     />
  //                   </Box>
  //                 </Flex>
  //               );
  //             })
  //           ) : (
  //             // Group
  //             <Flex
  //               sx={{
  //                 height: MOBILE_ROW_HEIGHT,
  //                 borderTop: "1px solid",
  //                 borderTopColor: "monochrome400",
  //                 color: "monochrome600",
  //                 // py: 2,
  //                 ml: `${row.depth * 12}px`,
  //               }}
  //             >
  //               <Icon name={row.isExpanded ? "chevrondown" : "chevronright"} />
  //               <Text
  //                 as={headingLevel}
  //                 variant="paragraph1"
  //                 sx={{ color: "monochrome900" }}
  //                 {...row.getToggleRowExpandedProps()}
  //               >
  //                 {`${row.groupByVal}`}
  //               </Text>
  //             </Flex>
  //           )}
  //         </Box>
  //       </>
  //     );
  //   },
  //   [prepareRow, rows, tableColumnsMeta]
  // );

  const TableContentWrapper = useMemo(() => {
    return forwardRef<HTMLDivElement, $FixMe>(({ children, ...props }, ref) => {
      return (
        <Box
          ref={ref}
          {...props}
          style={{
            ...props.style,
            height: props.style.height + 42,
          }}
        >
          <TableHeader
            customSortCount={customSortCount}
            headerGroups={headerGroups}
            tableColumnsMeta={tableColumnsMeta}
          />
          <Box
            sx={{
              position: "relative",
              minWidth: totalColumnsWidth,
              width: "100%",
            }}
          >
            {children}
          </Box>
        </Box>
      );
    });
  }, [customSortCount, headerGroups, tableColumnsMeta, totalColumnsWidth]);

  return (
    <>
      {showSearch && (
        <Box sx={{ my: 5, width: "min(100%, 300px)" }}>
          <Input
            type="text"
            name="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
          />
        </Box>
      )}
      {/* <Box sx={{ display: ["block", "none", "none"], my: 3 }}>
        <Switch
          label={
            <Trans id="chart.published.toggle.mobile.view">
              Toggle alternative mobile view
            </Trans>
          }
          name={"Toggle alternative mobile view"}
          checked={useAlternativeMobileView}
          disabled={false}
          onChange={() =>
            toggleAlternativeMobileView(!useAlternativeMobileView)
          }
        />
      </Box> */}

      {/* Desktop */}
      {!useAlternativeMobileView && (
        <Box
          sx={{
            position: "relative",
            bg: "monochrome100",
            mb: 4,
            fontSize: 3,
          }}
          {...getTableProps({ style: { minWidth: "100%" } })}
        >
          <div {...getTableBodyProps()}>
            <FixedSizeList
              outerElementType={TableContentWrapper}
              height={Math.min(
                TABLE_HEIGHT,
                rows.length * rowHeight + scrollbarWidth()
              )}
              itemCount={rows.length}
              itemSize={rowHeight} // depends on whether a column has bars (40px or 56px)
              width="100%"
            >
              {renderDesktopRow}
            </FixedSizeList>
          </div>
        </Box>
      )}

      {/* Alternative Mobile View */}
      {/* {useAlternativeMobileView && (
        <Box
          sx={{
            width: "100%",
            height: bounds.chartHeight,
            position: "relative",
            overflowY: "hidden",
            overflowX: "scroll",
            bg: "monochrome100",
            mb: 5,
          }}
        >
          <VariableSizeList
            height={bounds.chartHeight}
            itemCount={rows.length}
            itemSize={getMobileItemSize}
            width={bounds.width}
          >
            {renderMobileRow}
          </VariableSizeList>
        </Box>
      )} */}

      {/* Number of lines */}
      <Text
        variant="paragraph2"
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 5,
          color: "monochrome600",
        }}
      >
        <Trans id="chart.table.number.of.lines">Total number of rows:</Trans>{" "}
        {filteredData.length}
      </Text>
    </>
  );
};
