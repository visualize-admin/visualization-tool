import { t } from "@lingui/macro";
import {
  Autocomplete,
  createFilterOptions,
  TextField,
  Theme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import sortBy from "lodash/sortBy";
import { useMemo } from "react";

import { guessUrlType } from "@/charts/map/wms-wmts-endpoint-utils";
import ProviderInfoAlert from "@/charts/map/wms-wmts-provider-info";
import wmsWmtsProvidersExtra_ from "@/charts/map/wms-wmts-providers-extra.json";
import wmsWmtsProviders from "@/charts/map/wms-wmts-providers.json";
import { useFlag } from "@/flags";

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

type ProviderUrl = string;

const useStyles = makeStyles<Theme>((theme) => ({
  listbox: {
    maxHeight: 300,
    "& li": {
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
      fontSize: theme.typography.body2.fontSize,
      display: "block",
      minWidth: 0,
    },
  },
  paper: {
    minHeight: 300,
    width: 500,
  },
  input: {
    "&&": {
      fontSize: theme.typography.body2.fontSize,
    },
  },
  chip: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(-2),
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
  },
}));

const inferUrlGroup = (host: string) => {
  return host.split(".").slice(-2).join(".");
};

const ProviderAutocomplete = ({
  value,
  onChange,
}: {
  value: ProviderUrl | null;
  onChange: (newValue: ProviderUrl | null) => void;
}) => {
  const classes = useStyles();
  const extraInfo = value ? wmsWmtsProvidersExtra[value] : undefined;
  const showExtraInfo = useFlag("wmts-show-extra-info");
  const options = useMemo(() => {
    const options = wmsWmtsProviders
      .filter((p) => {
        return !wmsWmtsProvidersExtra[p] || !wmsWmtsProvidersExtra[p].hidden;
      })
      .map((provider) => {
        const url = new URL(provider);
        const group = inferUrlGroup(url.host);
        return {
          url: url,
          host: url.host,
          label: url.href.replace(`${url.protocol}//`, ""),
          group: group,
          value: provider,
          type: guessUrlType(provider),
        };
      });

    // Need to sort by group to remove warning in the console
    return sortBy(options, (option) => option.group);
  }, []);

  const filterOptions = useMemo(() => {
    return createFilterOptions({
      stringify: (option: (typeof options)[number]) => {
        if (typeof option === "string") {
          return option;
        }
        return `${option.url}`;
      },
    });
  }, []);
  return (
    <>
      <Autocomplete
        options={options}
        value={value}
        freeSolo
        filterOptions={filterOptions}
        groupBy={(option) => option.group}
        // @ts-ignore
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label
        }
        onChange={(_ev, newValue) =>
          onChange(
            typeof newValue === "string" ? newValue : (newValue?.value ?? null)
          )
        }
        size="small"
        ListboxProps={{
          className: classes.listbox,
        }}
        slotProps={{
          paper: {
            elevation: 6,
            className: classes.paper,
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={t({
              id: "wmts-providers-autocomplete.placeholder",
              message: "Enter a WMTS provider URL",
            })}
            variant="outlined"
            margin="normal"
            fullWidth
            size="small"
            InputProps={{
              ...params.InputProps,
              slotProps: {
                input: {
                  className: classes.input,
                },
              },
            }}
          />
        )}
      />
      {extraInfo && showExtraInfo && (
        <ProviderInfoAlert extraInfo={extraInfo} />
      )}
    </>
  );
};

export default ProviderAutocomplete;
