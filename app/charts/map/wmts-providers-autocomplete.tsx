// TODO rename into wmts or wms
import wmtsProviders from "@/configurator/components/wmts-providers.json";
import { Autocomplete, TextField, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

type ProviderUrl = string;

const useStyles = makeStyles<Theme>((theme) => ({
  listbox: {
    maxHeight: 300,
    "&::-webkit-scrollbar": {
      width: 4,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(65, 45, 45, 0.3)",
      borderRadius: 2,
    },
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
    fontSize: theme.typography.body2.fontSize,
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
  return (
    <Autocomplete
      options={wmtsProviders}
      value={value}
      freeSolo
      onChange={(_ev, newValue) => onChange(newValue)}
      // renderOption={(props) => {
      //   return <Typography variant="caption" component="li" {...props} />;
      // }}
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
          placeholder="WMTS Provider"
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
