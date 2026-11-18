import { t } from "@lingui/macro";
import { AutocompleteRenderInputParams, TextField } from "@mui/material";
import { ComponentProps, MouseEvent } from "react";

import { MultiSelect } from "@/components/multi-select";

export const MultiSelectInput = ({
  params,
  value,
  placeholder,
  variant,
  size,
  readOnly,
  onClick,
}: {
  params: AutocompleteRenderInputParams;
  value: string[];
  placeholder?: string;
  variant: ComponentProps<typeof MultiSelect>["variant"];
  size: ComponentProps<typeof MultiSelect>["size"];
  readOnly?: boolean;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}) => {
  const noneLabel = t({ id: "controls.none", message: "None" });

  return (
    <TextField
      {...params}
      placeholder={value.length === 0 ? (placeholder ?? noneLabel) : undefined}
      variant={variant}
      onClick={onClick}
      inputProps={{
        ...params.inputProps,
        onClick: undefined,
        readOnly: true,
        "aria-disabled": readOnly || undefined,
        size,
        sx: {
          width: 0,
          minWidth: "0px !important",
          p: 0,

          "&::placeholder": {
            opacity: 1,
          },
        },
      }}
      sx={{ p: 0 }}
    />
  );
};
