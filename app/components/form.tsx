import { Trans } from "@lingui/macro";
import {
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import {
  Box,
  BoxProps,
  ButtonBase,
  Checkbox as MUICheckbox,
  CircularProgress,
  Divider,
  FormControlLabel as MUIFormControlLabel,
  FormControlLabelProps,
  Input as MUIInput,
  InputProps,
  ListSubheader,
  MenuItem,
  Radio as MUIRadio,
  Select as MUISelect,
  SelectProps,
  Slider as MUISlider,
  sliderClasses,
  SliderProps,
  Stack,
  Switch as MUISwitch,
  SxProps,
  Theme,
  Tooltip,
  Typography,
  TypographyProps,
  TypographyVariant,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useId } from "@reach/auto-id";
import flatten from "lodash/flatten";
import {
  ComponentProps,
  FocusEventHandler,
  KeyboardEventHandler,
  ReactNode,
  RefObject,
  SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { useBrowseContext } from "@/browser/context";
import { Flex } from "@/components/flex";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { BlockTypeMenu } from "@/components/mdx-editor/block-type-menu";
import { BoldItalicUnderlineToggles } from "@/components/mdx-editor/bold-italic-underline-toggles";
import { linkDialogPlugin } from "@/components/mdx-editor/link-dialog";
import { LinkDialogToggle } from "@/components/mdx-editor/link-dialog-toggle";
import { ListToggles } from "@/components/mdx-editor/list-toggles";
import { VisuallyHidden } from "@/components/visually-hidden";
import {
  FieldProps,
  Option,
  OptionGroupKey,
  useChartOptionSliderField,
} from "@/configurator";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { valueComparator } from "@/utils/sorting-values";
import { useEvent } from "@/utils/use-event";

import "@mdxeditor/editor/style.css";

type FormControlLabelSize = "sm" | "md" | "lg";
const sizeToVariant: Record<FormControlLabelSize, TypographyVariant> = {
  sm: "caption" as TypographyVariant,
  md: "body3" as TypographyVariant,
  lg: "h5" as TypographyVariant,
};

export const FormControlLabel = (
  props: Omit<FormControlLabelProps, "componentsProps"> & {
    size?: "sm" | "md" | "lg";
  }
) => {
  const { size = "md", ...rest } = props;

  return (
    <MUIFormControlLabel
      {...rest}
      componentsProps={{
        typography: {
          variant: sizeToVariant[size],
        },
      }}
    />
  );
};

export const Label = ({
  htmlFor,
  children,
  sx,
}: {
  htmlFor: string;
  children: ReactNode;
  sx?: TypographyProps["sx"];
}) => {
  return (
    <Typography variant="caption" component="label" htmlFor={htmlFor} sx={sx}>
      {children}
    </Typography>
  );
};

export const RadioGroup = ({ children }: { children: ReactNode }) => {
  return <Flex sx={{ gap: 6, wrap: "wrap" }}>{children}</Flex>;
};

export const Radio = ({
  label,
  size,
  name,
  value,
  checked,
  disabled,
  onChange,
  warnMessage,
}: {
  label: string;
  size?: ComponentProps<typeof FormControlLabel>["size"];
  disabled?: boolean;
  warnMessage?: string;
} & FieldProps) => {
  return (
    <MaybeTooltip title={warnMessage}>
      <FormControlLabel
        label={label}
        size={size}
        htmlFor={`${name}-${value}`}
        disabled={disabled}
        control={
          <MUIRadio
            name={name}
            id={`${name}-${value}`}
            value={value}
            onChange={onChange}
            checked={!!checked}
            disabled={disabled}
          />
        }
      />
    </MaybeTooltip>
  );
};

export const Slider = ({
  label,
  name,
  value,
  marks,
  disabled,
  renderTextInput = true,
  onChange,
  sx,
  ...rest
}: {
  label?: string;
  renderTextInput?: boolean;
} & ReturnType<typeof useChartOptionSliderField> &
  // To allow useEvent callbacks to be passed without complaining
  Omit<SliderProps, "onChange">) => {
  return (
    <Box sx={sx}>
      {label && <Label htmlFor={`${name}-${value}`}>{label}</Label>}
      <Stack
        direction="row"
        gap={4}
        justifyContent="center"
        alignItems="center"
      >
        <MUISlider
          name={name}
          id={`${name}-${value}`}
          size="small"
          value={value}
          disabled={disabled}
          // @ts-ignore
          onChange={onChange}
          marks={marks}
          {...rest}
          sx={{
            mb: 0,

            [`& .${sliderClasses.mark}`]: {
              [`&[data-index='0'], &[data-index='${Array.isArray(marks) ? marks.length - 1 : 0}']`]:
                { display: "none" },
            },
          }}
        />
        {renderTextInput && (
          <MUIInput
            size="sm"
            value={`${value}`}
            disabled={disabled}
            onChange={onChange}
            sx={{
              width: 64,
              height: 30,

              ".MuiInput-input": {
                p: 0,
                textAlign: "center",
              },
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export type CheckboxProps = {
  label: ComponentProps<typeof FormControlLabel>["label"];
  size?: ComponentProps<typeof FormControlLabel>["size"];
  disabled?: boolean;
  color?: string;
  indeterminate?: boolean;
  className?: string;
} & FieldProps;

export const Checkbox = ({
  label,
  size,
  name,
  value,
  checked,
  disabled,
  onChange,
  color,
  indeterminate,
  className,
}: CheckboxProps) => (
  <FormControlLabel
    label={label}
    size={size}
    htmlFor={name}
    disabled={disabled}
    className={className}
    control={
      <MUICheckbox
        id={name}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        indeterminate={indeterminate}
        sx={{ svg: { color } }}
      />
    }
    sx={{ whiteSpace: "nowrap" }}
  />
);

const getSelectOptions = (
  options: Option[],
  sortOptions: boolean,
  locale: string
) => {
  const noneOptions = options.filter((o) => o.isNoneValue);
  const restOptions = options.filter((o) => !o.isNoneValue);

  if (sortOptions) {
    restOptions.sort(valueComparator(locale));
  }

  return [...noneOptions, ...restOptions];
};

export type SelectOption = Option & {
  disabledMessage?: string;
};

export type SelectOptionGroup = [OptionGroupKey, SelectOption[]];

export const Select = ({
  label,
  id,
  variant,
  size = "md",
  value,
  disabled,
  options,
  optionGroups,
  onChange,
  sortOptions = true,
  sideControls,
  open,
  onClose,
  onOpen,
  loading,
  hint,
  sx,
}: {
  id: string;
  options: SelectOption[];
  optionGroups?: SelectOptionGroup[];
  label?: ReactNode;
  disabled?: boolean;
  sortOptions?: boolean;
  sideControls?: ReactNode;
  loading?: boolean;
  hint?: string;
} & SelectProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const locale = useLocale();
  const sortedOptions = useMemo(() => {
    if (optionGroups) {
      return flatten(
        optionGroups.map(
          ([group, values]) =>
            [
              { type: group ? "group" : "", ...group },
              ...getSelectOptions(values, sortOptions, locale),
            ] as const
        )
      );
    } else {
      return getSelectOptions(options, sortOptions, locale);
    }
  }, [optionGroups, sortOptions, locale, options]);
  const handleOpen = useEvent((e: SyntheticEvent) => {
    setWidth(ref.current?.getBoundingClientRect().width ?? 0);
    onOpen?.(e);
  });

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
        <MUISelect
          variant={variant}
          size={size}
          id={id}
          name={id}
          onChange={onChange}
          value={value}
          disabled={disabled}
          open={open}
          onOpen={handleOpen}
          onClose={onClose}
          renderValue={(value) => {
            const selectedOption = sortedOptions.find(
              (opt) => opt.value === value
            );

            if (!selectedOption) {
              return "";
            }

            return (
              <>
                {selectedOption.label}
                {hint && <DisabledMessageIcon message={hint} />}
              </>
            );
          }}
          MenuProps={selectMenuProps}
          sx={{ maxWidth: sideControls ? "calc(100% - 28px)" : "100%" }}
        >
          {sortedOptions.map((opt) => {
            if (!opt.value && opt.type !== "group") {
              return null;
            }

            const isSelected = value === opt.value;

            return opt.type === "group" ? (
              opt.label && (
                <ListSubheader key={opt.label}>
                  <Typography
                    variant="caption"
                    component="p"
                    style={{ maxWidth: width }}
                  >
                    {opt.label}
                  </Typography>
                </ListSubheader>
              )
            ) : (
              <MenuItem
                key={opt.value}
                disabled={opt.disabled}
                value={opt.value ?? undefined}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  typography: selectSizeToTypography[size],
                }}
              >
                {opt.label}
                <Flex
                  sx={{
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 24,
                    minHeight: 20,
                  }}
                >
                  {opt.disabledMessage ? (
                    <DisabledMessageIcon message={opt.disabledMessage} />
                  ) : null}
                  {isSelected ? <Icon name="checkmark" size={20} /> : null}
                </Flex>
              </MenuItem>
            );
          })}
        </MUISelect>
        {sideControls}
      </Box>
    </Box>
  );
};

export const selectMenuProps: SelectProps["MenuProps"] = {
  slotProps: {
    paper: {
      sx: {
        "& .MuiList-root": {
          width: "auto",
          padding: "4px 0",
          boxShadow: 3,
          cursor: "default",

          "& .MuiMenuItem-root": {
            color: "monochrome.600",

            "&:hover": {
              backgroundColor: "cobalt.50",
              color: "monochrome.800",
            },

            "&.Mui-selected": {
              backgroundColor: "transparent",
              color: "monochrome.800",

              "&:hover": {
                backgroundColor: "cobalt.50",
              },
            },
          },
        },
      },
    },
  },
};

export const selectSizeToTypography: Record<
  NonNullable<ComponentProps<typeof Select>["size"]>,
  TypographyVariant
> = {
  xs: "caption",
  sm: "h6",
  md: "h5",
  lg: "h4",
  xl: "h4",
};

type DisabledMessageIconProps = {
  message: string;
};

export const DisabledMessageIcon = (props: DisabledMessageIconProps) => {
  const { message } = props;

  return (
    <Tooltip
      arrow
      title={
        <Typography variant="caption" color="secondary">
          {message}
        </Typography>
      }
      placement="top"
      componentsProps={{
        tooltip: { sx: { width: 140, px: 2, py: 1 } },
      }}
      sx={{ opacity: 1, pointerEvents: "auto", ml: 1 }}
    >
      <Typography color="orange.main" style={{ lineHeight: 0 }}>
        <Icon name="warningCircle" size={20} />
      </Typography>
    </Tooltip>
  );
};

export const Input = ({
  type,
  label,
  name,
  value,
  defaultValue,
  endAdornment,
  placeholder,
  onBlur,
  onKeyDown,
  disabled,
  onChange,
  error,
  errorMessage,
  sx,
}: {
  label?: string | ReactNode;
  disabled?: boolean;
  defaultValue?: FieldProps["value"];
  endAdornment?: ReactNode;
  placeholder?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  error?: boolean;
  errorMessage?: string;
  sx?: SxProps;
} & FieldProps) => (
  <Box sx={{ fontSize: "1rem", pb: 2 }}>
    {label && name && <Label htmlFor={name}>{label}</Label>}
    <MUIInput
      type={type}
      id={name}
      size="sm"
      color="secondary"
      name={name}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      endAdornment={endAdornment}
      sx={error ? { ...sx, borderColor: "error.main" } : sx}
    />
    {error && errorMessage ? (
      <Typography
        variant="caption"
        color="error.main"
        sx={{ lineHeight: "1 !important" }}
      >
        {errorMessage}
      </Typography>
    ) : null}
  </Box>
);

export const MarkdownInput = ({
  label,
  name,
  value,
  onChange,
  disableToolbar,
}: {
  label?: string | ReactNode;
  disableToolbar?: {
    textStyles?: boolean;
    blockType?: boolean;
    listToggles?: boolean;
    link?: boolean;
  };
} & FieldProps) => {
  const classes = useMarkdownInputStyles();

  return (
    <MDXEditor
      className={classes.root}
      markdown={value ? `${value}` : ""}
      plugins={[
        toolbarPlugin({
          toolbarClassName: classes.toolbar,
          toolbarContents: () => (
            <div>
              <Box sx={{ display: "flex", gap: 2 }}>
                {disableToolbar?.textStyles ? null : (
                  <BoldItalicUnderlineToggles />
                )}
                {disableToolbar?.blockType ? null : <BlockTypeMenu />}
                {disableToolbar?.listToggles ? null : (
                  <>
                    <Divider flexItem orientation="vertical" />
                    <ListToggles />
                  </>
                )}
                {disableToolbar?.link ? null : (
                  <>
                    <Divider flexItem orientation="vertical" />
                    <LinkDialogToggle />
                  </>
                )}
              </Box>
              {label && name ? <Label htmlFor={name}>{label}</Label> : null}
            </div>
          ),
        }),
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
        thematicBreakPlugin(),
      ]}
      onChange={(newValue) => {
        onChange?.({
          currentTarget: {
            value: newValue
              // Remove backslashes from the string, as they are not supported in react-markdown
              .replaceAll("\\", "")
              // <u> is not supported in react-markdown we use for rendering.
              .replaceAll("<u>", "<ins>")
              .replace("</u>", "</ins>"),
          },
        } as any);
      }}
    />
  );
};

const useMarkdownInputStyles = makeStyles<Theme>((theme) => ({
  root: {
    "& [data-lexical-editor='true']": {
      padding: "0.5rem 0.75rem",
      border: `1px solid ${theme.palette.monochrome[300]}`,
      borderRadius: 3,

      "&:focus": {
        border: `1px solid ${theme.palette.monochrome[500]}`,
      },

      "& *": {
        margin: "1em 0",
        lineHeight: 1.2,
      },

      "& :first-child": {
        marginTop: 0,
      },

      "& :last-child": {
        marginBottom: 0,
      },
    },
  },
  toolbar: {
    borderRadius: 0,
    backgroundColor: theme.palette.background.paper,
  },
}));

export const SearchField = ({
  id,
  label,
  value,
  defaultValue,
  placeholder,
  sx,
  inputRef,
  InputProps,
  className,
}: {
  id: string;
  label?: string | ReactNode;
  disabled?: boolean;
  defaultValue?: string;
  placeholder?: string;
  InputProps?: InputProps;
  inputRef?: RefObject<HTMLInputElement>;
  className?: BoxProps["className"];
  sx?: BoxProps["sx"];
} & FieldProps) => {
  const { search, onSubmitSearch } = useBrowseContext();
  const onReset = InputProps?.onReset;
  const handleReset = useCallback(
    (e) => {
      if (inputRef?.current) {
        inputRef.current.value = "";
      }

      onReset?.(e);
    },
    [inputRef, onReset]
  );
  const handleSubmit = useCallback(() => {
    const newSearch = inputRef?.current?.value;

    if (!newSearch) {
      return;
    }

    onSubmitSearch(newSearch);
  }, [inputRef, onSubmitSearch]);

  return (
    <Box className={className} sx={sx}>
      {label && id && (
        <label htmlFor={id}>
          <VisuallyHidden>{label}</VisuallyHidden>
        </label>
      )}
      <MUIInput
        id={id}
        value={value}
        defaultValue={defaultValue}
        {...InputProps}
        inputRef={inputRef}
        placeholder={placeholder}
        autoComplete="off"
        size="xl"
        endAdornment={
          onReset && search && search !== "" ? (
            <ButtonBase data-testid="clearSearch" onClick={handleReset}>
              <VisuallyHidden>
                <Trans id="controls.search.clear">Clear search field</Trans>
              </VisuallyHidden>
              <Icon name="close" />
            </ButtonBase>
          ) : (
            <ButtonBase data-testid="submitSearch" onClick={handleSubmit}>
              <VisuallyHidden>
                <Trans id="dataset.search.label">Search</Trans>
              </VisuallyHidden>
              <Icon name="search" />
            </ButtonBase>
          )
        }
      />
    </Box>
  );
};

export type SearchFieldProps = ComponentProps<typeof SearchField>;

export const Switch = ({
  id,
  size,
  label,
  name,
  checked,
  disabled,
  onChange,
}: {
  id?: string;
  size?: ComponentProps<typeof FormControlLabel>["size"];
  label: ComponentProps<typeof FormControlLabel>["label"];
  disabled?: boolean;
} & FieldProps) => {
  const genId = `switch-${useId(id)}`;

  return (
    <FormControlLabel
      size={size}
      htmlFor={genId}
      label={label}
      control={
        <MUISwitch
          id={genId}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
      }
    />
  );
};
