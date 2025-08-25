import {
  AutocompleteRenderOptionState,
  ListSubheader,
  MenuItem,
  MenuItemProps,
  Typography,
} from "@mui/material";
import { ComponentProps } from "react";

import { Flex } from "@/components/flex";
import {
  DisabledMessageIcon,
  SelectOption,
  selectSizeToTypography,
} from "@/components/form";
import { MultiSelect } from "@/components/multi-select";
import { Icon } from "@/icons";

export const MultiSelectOption = ({
  props,
  option: { isGroupHeader, value, label, disabled, disabledMessage },
  state,
  size,
  width,
}: {
  props: MenuItemProps;
  option: SelectOption;
  state: AutocompleteRenderOptionState;
  size: NonNullable<ComponentProps<typeof MultiSelect>["size"]>;
  width: number;
}) => {
  if (!value && !isGroupHeader) {
    return null;
  }

  return isGroupHeader ? (
    label && (
      <ListSubheader key={label}>
        <Typography variant="caption" component="p" style={{ maxWidth: width }}>
          {label}
        </Typography>
      </ListSubheader>
    )
  ) : (
    <MenuItem
      {...props}
      key={value}
      disabled={disabled}
      value={value ?? undefined}
      sx={{
        display: "flex",
        justifyContent: "space-between !important",
        alignItems: "center",
        gap: 1,
        typography: selectSizeToTypography[size],
      }}
    >
      {label}
      <Flex
        sx={{
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
          minWidth: 24,
          minHeight: 20,
        }}
      >
        {disabledMessage ? (
          <DisabledMessageIcon message={disabledMessage} />
        ) : null}
        {state.selected ? <Icon name="checkmark" size={20} /> : null}
      </Flex>
    </MenuItem>
  );
};
