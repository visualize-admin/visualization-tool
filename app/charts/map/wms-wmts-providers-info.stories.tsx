import {
  Box,
  Checkbox,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { guessUrlType } from "@/charts/map/wms-wmts-endpoint-utils";
import wmsWmtsProvidersExtra_ from "@/charts/map/wms-wmts-providers-extra.json";
import wmsWmtsProviders from "@/charts/map/wms-wmts-providers.json";
import { FormControlLabel } from "@/components/form";

const wmsWmtsProvidersExtra = wmsWmtsProvidersExtra_ as Record<
  string,
  {
    hidden?: boolean;
    note?: string;
    canListLayers?: boolean;
    canDisplayLayers?: boolean;
    canDisplayOnMapGeoAdmin?: boolean;
    workingLayers?: string[];
  }
>;

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    width: "100%",
    overflowX: "hidden",
  },
  table: {
    width: "100%",
    tableLayout: "fixed",
  },
  providerCell: {
    width: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  typeCell: {
    width: 80,
  },
  booleanCell: {
    width: 200,
    textAlign: "center",

    '&[data-value="yes"]:before': {
      content: '" "',
      width: 6,
      height: 6,
      display: "inline-block",
      marginRight: theme.spacing(1),
      borderRadius: "50%",
      backgroundColor: theme.palette.success.main,
    },
    '&[data-value="no"]:before': {
      content: '" "',
      width: 6,
      height: 6,
      display: "inline-block",
      marginRight: theme.spacing(1),
      borderRadius: "50%",
      backgroundColor: theme.palette.error.main,
    },
  },
  workingLayerCell: {
    width: 200,
    overflow: "hidden",
    whiteSpace: "wrap",
  },
  noteCell: {
    overflow: "hidden",
    whiteSpace: "wrap",
  },
  infoCard: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

// Component that lists all providers
const ProvidersTable = () => {
  const classes = useStyles();

  const [onlyWithExtraInfo, setOnlyWithExtraInfo] = useState(true);

  const providersWithInfo = wmsWmtsProviders.map((url) => ({
    url,
    type: guessUrlType(url),
    extraInfo: wmsWmtsProvidersExtra[url],
  }));

  return (
    <Box m={4} overflow="hidden">
      <FormControlLabel
        sx={{ mb: 2 }}
        control={
          <Checkbox
            checked={onlyWithExtraInfo}
            onChange={(e) => setOnlyWithExtraInfo(e.target.checked)}
            color="primary"
          />
        }
        label="Only with extra info"
      />
      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Provider URL</TableCell>
            <TableCell className={classes.typeCell}>Type</TableCell>
            <TableCell className={classes.booleanCell}>
              Can List Layers
            </TableCell>
            <TableCell className={classes.booleanCell}>
              Can Display Layers
            </TableCell>
            <TableCell className={classes.booleanCell}>
              Can Display
              <br />
              on map.geo.admin.ch
            </TableCell>
            <TableCell className={classes.workingLayerCell}>
              Working Layers
            </TableCell>
            <TableCell className={classes.noteCell}>Note</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {providersWithInfo.map(
            (provider) =>
              (!onlyWithExtraInfo || provider.extraInfo) && (
                <TableRow key={provider.url} hover>
                  <TableCell className={classes.providerCell}>
                    <Link
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {provider.url}
                    </Link>
                  </TableCell>
                  <TableCell className={classes.typeCell}>
                    {provider.type}
                  </TableCell>
                  {(() => {
                    const renderBooleanCell = (value: boolean | undefined) => {
                      if (value === undefined) {
                        return { text: "-", dataValue: "unknown" };
                      }
                      return value
                        ? { text: "Yes", dataValue: "yes" }
                        : { text: "No", dataValue: "no" };
                    };

                    const canListLayersInfo = renderBooleanCell(
                      provider.extraInfo?.canListLayers
                    );
                    const canDisplayLayersInfo = renderBooleanCell(
                      provider.extraInfo?.canDisplayLayers
                    );
                    const canDisplayOnMapGeoAdminInfo = renderBooleanCell(
                      provider.extraInfo?.canDisplayOnMapGeoAdmin
                    );

                    return (
                      <>
                        <TableCell
                          className={classes.booleanCell}
                          data-value={canListLayersInfo.dataValue}
                        >
                          {canListLayersInfo.text}
                        </TableCell>
                        <TableCell
                          className={classes.booleanCell}
                          data-value={canDisplayLayersInfo.dataValue}
                        >
                          {canDisplayLayersInfo.text}
                        </TableCell>
                        <TableCell
                          className={classes.booleanCell}
                          data-value={canDisplayOnMapGeoAdminInfo.dataValue}
                        >
                          {canDisplayOnMapGeoAdminInfo.text}
                        </TableCell>
                      </>
                    );
                  })()}
                  <TableCell className={classes.workingLayerCell}>
                    {provider.extraInfo?.workingLayers &&
                    provider.extraInfo.workingLayers.length > 0
                      ? provider.extraInfo.workingLayers.join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell className={classes.noteCell}>
                    {provider.extraInfo?.note ? provider.extraInfo.note : "-"}
                  </TableCell>
                </TableRow>
              )
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

const meta: Meta<typeof ProvidersTable> = {
  title: "Charts/Map/WMS-WMTS Providers",
  component: ProvidersTable,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof ProvidersTable>;

export const AllProviders: Story = {
  name: "All Providers",
};
