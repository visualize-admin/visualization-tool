import {
  Autocomplete,
  Box,
  CircularProgress,
  SxProps,
  Typography,
} from "@mui/material";
import { PopperProps } from "@mui/material/Popper";
import flatten from "lodash/flatten";
import { ReactNode, useCallback, useMemo, useRef, useState } from "react";

import {
  getSelectOptions,
  Label,
  SelectOption,
  SelectOptionGroup,
  selectSizeToTypography,
} from "@/components/form";
import { MultiSelectInput } from "@/components/multi-select/input";
import { MultiSelectOption } from "@/components/multi-select/option";
import { MultiSelectTags } from "@/components/multi-select/tags";
import { TransitionPopper } from "@/components/multi-select/transition-popper";
import { truthy } from "@/domain/types";
import { useLocale } from "@/locales/use-locale";
import { useEvent } from "@/utils/use-event";

export const MultiSelect = ({
  id,
  label,
  options,
  optionGroups,
  value,
  onChange,
  disabled,
  loading,
  hint,
  placeholder,
  size = "md",
  variant = "outlined",
  sort = true,
  sideControls,
  sx,
}: {
  id: string;
  options: SelectOption[];
  optionGroups?: SelectOptionGroup[];
  value: string[];
  onChange: (values: string[]) => void;
  label?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
  placeholder?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "outlined" | "filled" | "standard";
  sort?: boolean;
  sideControls?: ReactNode;
  sx?: SxProps;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const locale = useLocale();
  const [anchorX, setAnchorX] = useState(0);
  const [anchorY, setAnchorY] = useState(0);
  const handleOpen = useEvent(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const rect = el.getBoundingClientRect();
    setWidth(rect.width);
    setAnchorX(rect.left + rect.width / 2);
    setAnchorY(rect.bottom);
  });

  const normalizedOptions = useMemo<SelectOption[]>(() => {
    if (optionGroups && optionGroups.length > 0) {
      return flatten(
        optionGroups.map(([group, values]) => {
          const normalized = getSelectOptions(values, { sort, locale }).map(
            (o) => ({
              ...o,
              group: group?.label,
            })
          );

          return normalized;
        })
      );
    }

    return getSelectOptions(options, { sort, locale });
  }, [optionGroups, sort, locale, options]);

  const valueOptions = useMemo(() => {
    const map = new Map(normalizedOptions.map((o) => [o.value, o]));
    return value.map((v) => map.get(v)).filter(truthy);
  }, [value, normalizedOptions]);

  const StableTransitionPopper = useCallback(
    (props: PopperProps) => {
      return (
        <TransitionPopper {...props} anchorX={anchorX} anchorY={anchorY} />
      );
    },
    [anchorX, anchorY]
  );

  return (
    <Box ref={ref} sx={{ width: "100%", ...sx }}>
      {label && (
        <Label
          htmlFor={id}
          sx={{ display: "flex", alignItems: "center", mb: 1 }}
        >
          {label}
          {loading && (
            <CircularProgress
              size={12}
              sx={{ display: "inline-block", marginLeft: 2 }}
            />
          )}
        </Label>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Autocomplete
          id={id}
          onOpen={handleOpen}
          openOnFocus
          options={normalizedOptions}
          value={valueOptions}
          onChange={(_, newValue) => onChange(newValue.map((o) => o.value))}
          disabled={disabled}
          multiple
          disableCloseOnSelect
          disableClearable
          groupBy={
            optionGroups && optionGroups.length > 0
              ? (o) => o.group ?? ""
              : undefined
          }
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(o, v) => o.value === v.value}
          getOptionDisabled={(o) => !!o.disabled}
          PopperComponent={StableTransitionPopper}
          sx={{
            "& .MuiInputBase-root > .MuiInputBase-input": {
              pl: value.length === 0 ? 5 : 1,
              typography: selectSizeToTypography[size],
            },
          }}
          renderOption={(props, option, state) => {
            return (
              <MultiSelectOption
                props={props}
                option={option}
                state={state}
                size={size}
                width={width}
              />
            );
          }}
          renderTags={(options, getTagProps) => {
            return (
              <MultiSelectTags
                options={options}
                getTagProps={getTagProps}
                size={size}
              />
            );
          }}
          renderInput={(params) => {
            return (
              <MultiSelectInput
                params={params}
                value={value}
                placeholder={placeholder}
                variant={variant}
                size={size}
              />
            );
          }}
        />
        {sideControls}
      </Box>
      {hint ? (
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
};
