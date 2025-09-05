import {
  AutocompleteRenderGetTagProps,
  Box,
  Chip,
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

export const MultiSelectTags = ({
  options,
  getTagProps,
  size,
}: {
  options: SelectOption[];
  getTagProps: AutocompleteRenderGetTagProps;
  size: NonNullable<ComponentProps<typeof MultiSelect>["size"]>;
}) => {
  return (
    <Flex
      sx={{
        flexWrap: "nowrap",
        overflowX: "auto",
        maxWidth: "100%",
        pl: 4,
        pr: 14,
        py: 1,
      }}
    >
      {options.map((option, index) => (
        <Chip
          {...getTagProps({ index })}
          key={option.value}
          label={
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              <Typography
                variant={selectSizeToTypography[size]}
                sx={{
                  lineHeight: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {option.label}
              </Typography>
              {option.disabledMessage ? (
                <DisabledMessageIcon message={option.disabledMessage} />
              ) : null}
            </Box>
          }
          deleteIcon={<Icon name="close" size={16} />}
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          sx={{
            maxWidth: "100% !important",
            height: "fit-content",
            mr: 0.5,
            px: 1,
            py: 0.25,
            backgroundColor: "#F0F4F7",

            "&:hover": {
              backgroundColor: "cobalt.100",
            },

            "& .MuiChip-deleteIcon": {
              color: "text.primary",
              transition: "color 0.2s ease",
            },
          }}
        />
      ))}
    </Flex>
  );
};
