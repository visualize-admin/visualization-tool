import { t, Trans } from "@lingui/macro";
import {
  Alert,
  alertClasses,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Theme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import { Icon } from "@/icons";

const useStyles = makeStyles<Theme>((theme) => ({
  alert: {
    marginBottom: theme.spacing(2),
    boxShadow: "none",
    padding: theme.spacing(1),
    flexShrink: 1,
  },
  table: {
    marginBottom: theme.spacing(1),
    "& .MuiTableCell-root": {
      padding: theme.spacing(0.5, 1),
      borderBottom: "none",
    },
  },
  attributeName: {
    fontWeight: 500,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
  },
  chip: {
    fontSize: "0.7rem",
  },
  booleanIcon: {
    fontSize: "1rem",
  },
}));

interface ProviderExtraInfo {
  canListLayers?: boolean;
  canDisplayLayers?: boolean;
  canDisplayOnMapGeoAdmin?: boolean;
  workingLayers?: string[];
  note?: string;
}

const ProviderInfoAlert = ({ extraInfo }: { extraInfo: ProviderExtraInfo }) => {
  const classes = useStyles();

  const booleanAttributes = [
    {
      key: "canListLayers",
      label: t({
        id: "provider-info.can-list-layers",
        message: "Can list layers",
      }),
    },
    {
      key: "canDisplayLayers",
      label: t({
        id: "provider-info.can-display-layers",
        message: "Can display layers",
      }),
    },
    {
      key: "canDisplayOnMapGeoAdmin",
      label: t({
        id: "provider-info.can-display-on-map-geo-admin",
        message: "Can display on map.geo.admin.ch",
      }),
    },
  ];

  const hasAttributes = Object.keys(extraInfo).some(
    (key) =>
      key !== "note" && extraInfo[key as keyof ProviderExtraInfo] !== undefined
  );

  return (
    <Alert
      severity="info"
      className={classes.alert}
      elevation={0}
      sx={{
        py: 1,
        px: 2,
        [`& .${alertClasses.message}`]: {
          flexDirection: "column",
          display: "flex",
          gap: 1,
          width: "100%",
        },
      }}
      slotProps={{}}
    >
      <div>
        <Trans id="provider-info.title">
          The WMS / WMTS support is currently in beta and there are some
          limitations with this provider, please see the following information.
        </Trans>
      </div>
      {hasAttributes && (
        <Table size="small" className={classes.table}>
          <TableBody>
            {booleanAttributes.map((attr) => {
              const value = extraInfo[attr.key as keyof ProviderExtraInfo];
              if (value === undefined) return null;

              return (
                <TableRow key={attr.key}>
                  <TableCell className={classes.attributeName}>
                    {attr.label}
                  </TableCell>
                  <TableCell>
                    {value ? (
                      <Icon
                        name="checkmark"
                        color="success"
                        className={classes.booleanIcon}
                      />
                    ) : (
                      <Icon
                        name="close"
                        color="error"
                        className={classes.booleanIcon}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {extraInfo.workingLayers?.length ? (
              <TableRow>
                <TableCell className={classes.attributeName}>
                  {t({
                    id: "provider-info.working-layers",
                    message: "Working layers",
                  })}
                </TableCell>
                <TableCell>
                  <Box className={classes.chips}>
                    {extraInfo.workingLayers.map((layer) => (
                      <Chip
                        key={layer}
                        label={layer}
                        size="small"
                        className={classes.chip}
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      )}

      {extraInfo.note && <div>{extraInfo.note}</div>}
    </Alert>
  );
};

export default ProviderInfoAlert;
