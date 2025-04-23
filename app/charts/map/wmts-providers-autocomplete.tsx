// TODO rename into wmts or wms
import { t } from "@lingui/macro";
import { Autocomplete, TextField, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

import wmtsProviders from "@/charts/map/wmts-providers.json";

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
  },
  input: {
    "&&": {
      fontSize: theme.typography.body2.fontSize,
    },
  },
}));

const ProviderAutocomplete = ({
  value,
  onChange,
}: {
  value: ProviderUrl | null;
  onChange: (newValue: ProviderUrl | null) => void;
}) => {
  const classes = useStyles();
  const options = wmtsProviders.map((provider) => {
    const url = new URL(provider);
    return {
      url: url,
      host: url.host,
      value: provider,
    };
  });
  return (
    <Autocomplete
      options={options}
      value={value}
      freeSolo
      groupBy={(option) => option.host}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.value
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
          // TODO i18n
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
      sx={{ mb: 2 }}
    />
  );
};

export default ProviderAutocomplete;
