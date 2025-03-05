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
  FormControlLabel,
  FormControlLabelProps,
  Input as MUIInput,
  InputLabel,
  InputProps,
  ListSubheader,
  MenuItem,
  Paper,
  PaperProps,
  Radio as MUIRadio,
  Select as MUISelect,
  SelectProps,
  Skeleton,
  Slider as MUISlider,
  SliderProps,
  Stack,
  styled,
  Switch as MUISwitch,
  SxProps,
  Theme,
  Tooltip,
  Typography,
  TypographyProps,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useId } from "@reach/auto-id";
import flatten from "lodash/flatten";
import React, {
  ComponentProps,
  createContext,
  forwardRef,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { useBrowseContext } from "@/browser/context";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { BlockTypeMenu } from "@/components/mdx-editor/block-type-menu";
import { BoldItalicUnderlineToggles } from "@/components/mdx-editor/bold-italic-underline-toggles";
import { linkDialogPlugin } from "@/components/mdx-editor/link-dialog";
import { LinkDialogToggle } from "@/components/mdx-editor/link-dialog-toggle";
import { ListToggles } from "@/components/mdx-editor/list-toggles";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import { TooltipTitle } from "@/components/tooltip-utils";
import VisuallyHidden from "@/components/visually-hidden";
import {
  FieldProps,
  Option,
  OptionGroupKey,
  useChartOptionSliderField,
} from "@/configurator";
import { Icon } from "@/icons";
import SvgIcExclamation from "@/icons/components/IcExclamation";
import { useLocale } from "@/locales/use-locale";
import { valueComparator } from "@/utils/sorting-values";
import useEvent from "@/utils/use-event";

import "@mdxeditor/editor/style.css";

export const Label = ({
  htmlFor,
  smaller = false,
  children,
  sx,
}: {
  htmlFor: string;
  smaller?: boolean;
  children: ReactNode;
  sx?: TypographyProps["sx"];
}) => {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      variant={smaller ? "caption" : "body2"}
      color="secondary.active"
      display="flex"
      sx={sx}
    >
      {children}
    </Typography>
  );
};

export const Radio = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange,
  warnMessage,
  formLabelProps,
}: {
  label: string;
  disabled?: boolean;
  warnMessage?: string;
  formLabelProps?: Partial<FormControlLabelProps>;
} & FieldProps) => {
  const color = checked
    ? disabled
      ? "primary.disabled"
      : "primary"
    : "grey.500";

  return (
    <MaybeTooltip
      title={warnMessage ? <TooltipTitle text={warnMessage} /> : undefined}
    >
      <FormControlLabel
        label={label || "-"}
        htmlFor={`${name}-${value}`}
        componentsProps={{
          typography: {
            variant: "body2",
          },
        }}
        control={
          <MUIRadio
            name={name}
            id={`${name}-${value}`}
            value={value}
            onChange={onChange}
            checked={!!checked}
            disabled={disabled}
            size="small"
            sx={{ color, "> *": { fill: color } }}
          />
        }
        disabled={disabled}
        {...formLabelProps}
      />
    </MaybeTooltip>
  );
};

export const Slider = ({
  label,
  name,
  value,
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
      {label && (
        <Label htmlFor={`${name}-${value}`} smaller sx={{ mb: 1 }}>
          {label}
        </Label>
      )}
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
          {...rest}
        />
        {renderTextInput && (
          <MUIInput
            size="small"
            value={`${value}`}
            disabled={disabled}
            onChange={onChange}
            sx={{
              width: 50,
              height: 30,
              minHeight: 0,

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
  label: FormControlLabelProps["label"];
  disabled?: boolean;
  color?: string;
  smaller?: boolean;
  indeterminate?: boolean;
  className?: string;
} & FieldProps;

export const Checkbox = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange,
  color,
  smaller,
  indeterminate,
  className,
}: CheckboxProps) => (
  <FormControlLabel
    label={label}
    htmlFor={`${name}`}
    disabled={disabled}
    className={className}
    componentsProps={{
      typography: {
        variant: smaller ? "caption" : "body2",
        color: "grey.800",
      },
    }}
    control={
      <MUICheckbox
        data-name="checkbox-component"
        size={smaller ? "small" : "medium"}
        id={name}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        indeterminate={indeterminate}
        sx={{
          alignSelf: "start",
          svg: { color },
          input: { color },
        }}
      />
    }
    sx={{ display: "flex" }}
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

// Copied over from https://github.com/mui/material-ui/blob/master/packages/mui-material/src/Menu/Menu.js
const MenuPaper = styled(Paper, {
  name: "MuiMenu",
  slot: "Paper",
  overridesResolver: (_props: PaperProps, styles) => styles.paper,
})({
  // specZ: The maximum height of a simple menu should be one or more rows less than the view
  // height. This ensures a tapable area outside of the simple menu with which to dismiss
  // the menu.
  maxHeight: `calc(100% - ${BANNER_MARGIN_TOP}px)`,
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch",
});

const LoadingMenuPaperContext = createContext(false as boolean | undefined);

/**
 * Shows a loading indicator when hierarchy is loading
 */
const LoadingMenuPaper = forwardRef<HTMLDivElement>(
  (props: PaperProps, ref) => {
    const loading = useContext(LoadingMenuPaperContext);

    return (
      <MenuPaper {...props} ref={ref}>
        {loading ? (
          <Box px={4} py={5}>
            <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
              <Trans id="hint.loading.data" />
            </Typography>
            <Skeleton sx={{ bgcolor: "grey.300" }} />
            <Skeleton sx={{ bgcolor: "grey.300" }} />
          </Box>
        ) : (
          props.children
        )}
      </MenuPaper>
    );
  }
);

export type SelectOption = Option & {
  disabledMessage?: string;
};

export type SelectOptionGroup = [OptionGroupKey, SelectOption[]];

export const Select = ({
  label,
  id,
  value,
  disabled,
  options,
  optionGroups,
  onChange,
  sortOptions = true,
  topControls,
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
  topControls?: ReactNode;
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
    <LoadingMenuPaperContext.Provider value={loading}>
      <Box ref={ref} sx={{ width: "100%", ...sx }}>
        {label && (
          <Label
            htmlFor={id}
            smaller
            sx={{ display: "flex", alignItems: "center" }}
          >
            {label}
            {topControls}
            {loading && (
              <CircularProgress
                size={12}
                sx={{
                  color: "grey.700",
                  display: "inline-block",
                  marginLeft: 2,
                }}
              />
            )}
          </Label>
        )}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: sideControls
              ? "calc(100% - 2rem) 2rem"
              : "100%",
            alignItems: "center",
            columnGap: 2,
          }}
        >
          <MUISelect
            id={id}
            name={id}
            onChange={onChange}
            value={value}
            disabled={disabled}
            open={open}
            onOpen={handleOpen}
            onClose={onClose}
            MenuProps={{
              PaperProps: {
                // @ts-ignore - It works
                component: LoadingMenuPaper,
              },
            }}
            renderValue={(value) => {
              const selectedOption = sortedOptions.find(
                (opt) => opt.value === value
              );

              if (!selectedOption) {
                return "";
              }

              return (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <InputLabel
                    sx={{
                      typography: "body2",
                      color: "secondary.active",
                      pointerEvents: "none",
                    }}
                  >
                    {selectedOption.label}
                  </InputLabel>
                  {hint && <DisabledMessageIcon message={hint} />}
                </Box>
              );
            }}
          >
            {sortedOptions.map((opt) => {
              if (!opt.value && opt.type !== "group") {
                return null;
              }

              return opt.type === "group" ? (
                opt.label && (
                  <ListSubheader key={opt.label}>
                    <Typography
                      variant="caption"
                      component="p"
                      color="secondary.hover"
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
                    alignItems: "center",
                    "&.Mui-disabled": {
                      opacity: 1,

                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    },
                  }}
                >
                  <span style={{ opacity: opt.disabled ? 0.38 : 1 }}>
                    {opt.label}
                  </span>
                  {opt.disabledMessage && (
                    <DisabledMessageIcon message={opt.disabledMessage} />
                  )}
                </MenuItem>
              );
            })}
          </MUISelect>
          {sideControls}
        </Box>
      </Box>
    </LoadingMenuPaperContext.Provider>
  );
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
        tooltip: { sx: { width: 140, px: 2, py: 1, lineHeight: 1.2 } },
      }}
      sx={{ opacity: 1, pointerEvents: "auto", ml: 1 }}
    >
      <Typography color="warning.main">
        <SvgIcExclamation width={18} height={18} />
      </Typography>
    </Tooltip>
  );
};

type MinimalisticSelectProps = {
  id: string;
  options: Option[];
  label?: ReactNode;
  disabled?: boolean;
  smaller?: boolean;
} & SelectProps;

export const MinimalisticSelect = (props: MinimalisticSelectProps) => {
  const {
    label,
    id,
    value,
    options,
    onChange,
    smaller = false,
    disabled,
    sx,
    ...rest
  } = props;

  return (
    <Box sx={{ color: "grey.800" }}>
      {label && (
        <Label htmlFor={id} smaller>
          {label}
        </Label>
      )}
      <MUISelect
        size={smaller ? "small" : "medium"}
        variant="standard"
        id={id}
        name={id}
        onChange={onChange}
        value={value}
        disabled={disabled}
        IconComponent={(props) => (
          <span
            {...props}
            style={{
              ...props.style,
              transition: "transform 0.1s",
            }}
          >
            <Icon name="chevronDown" size={16} />
          </span>
        )}
        sx={{
          borderColor: "transparent",
          fontSize: smaller ? ["0.625rem", "0.75rem", "0.75rem"] : "inherit",
          lineHeight: "normal !important",
          backgroundColor: "transparent",
          p: 0,
          pl: 1,
          ":focus": {
            outline: "none",
            borderColor: "primary.main",
          },
          "& .MuiInput-input": {
            paddingRight: "1.25rem !important",
          },
          ...sx,
        }}
        {...rest}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value || undefined}>
            {opt.label}
          </MenuItem>
        ))}
      </MUISelect>
    </Box>
  );
};

export const Input = ({
  label,
  name,
  value,
  disabled,
  onChange,
  error,
}: {
  label?: string | ReactNode;
  disabled?: boolean;
  error?: boolean;
} & FieldProps) => (
  <Box sx={{ fontSize: "1rem", pb: 2 }}>
    {label && name && (
      <Label htmlFor={name} smaller sx={{ mb: 1 }}>
        {label}
      </Label>
    )}
    <MUIInput
      id={name}
      size="small"
      color="secondary"
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      sx={{
        borderColor: error ? "error.main" : "grey.500",
        backgroundColor: "grey.100",
        padding: "10px 6px",
        width: "100%",
      }}
    />
  </Box>
);

export const MarkdownInput = ({
  label,
  name,
  value,
  onChange,
}: {
  label?: string | ReactNode;
} & FieldProps) => {
  const classes = useMarkdownInputStyles();

  return (
    <Box sx={{ fontSize: "1rem", mb: 5 }}>
      <MDXEditor
        className={classes.root}
        markdown={value ? `${value}` : ""}
        plugins={[
          toolbarPlugin({
            toolbarClassName: classes.toolbar,
            toolbarContents: () => (
              <div>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <BoldItalicUnderlineToggles />
                  <BlockTypeMenu />
                  <Divider flexItem orientation="vertical" />
                  <ListToggles />
                  <Divider flexItem orientation="vertical" />
                  <LinkDialogToggle />
                </Box>
                {label && name ? (
                  <Label htmlFor={name} smaller sx={{ my: 1 }}>
                    {label}
                  </Label>
                ) : null}
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
    </Box>
  );
};

const useMarkdownInputStyles = makeStyles<Theme>((theme) => ({
  root: {
    "& [data-lexical-editor='true']": {
      padding: "0.5rem 0.75rem",
      border: `1px solid ${theme.palette.grey[300]}`,
      borderRadius: 3,
      backgroundColor: theme.palette.grey[100],
      "&:focus": {
        border: `1px solid ${theme.palette.secondary.main}`,
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
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: BoxProps["className"];
  sx?: BoxProps["sx"];
} & FieldProps) => {
  const { search } = useBrowseContext();
  const onReset = InputProps?.onReset;
  const handleReset = useCallback(
    (ev) => {
      if (inputRef?.current) {
        inputRef.current.value = "";
      }
      onReset?.(ev);
    },
    [inputRef, onReset]
  );

  return (
    <Box
      sx={{ color: "grey.700", fontSize: "1rem", position: "relative", ...sx }}
      className={className}
    >
      {label && id && (
        <label htmlFor={id}>
          <VisuallyHidden>{label}</VisuallyHidden>
        </label>
      )}
      <MUIInput
        startAdornment={<Icon name="search" size={16} />}
        id={id}
        value={value}
        defaultValue={defaultValue}
        {...InputProps}
        placeholder={placeholder}
        autoComplete="off"
        inputRef={inputRef}
        sx={{ width: "100%", minHeight: 40, input: { borderRadius: 2 } }}
        endAdornment={
          onReset && search && search !== "" ? (
            <ButtonBase
              sx={{ p: 0, cursor: "pointer" }}
              onClick={handleReset}
              data-testid="clearSearch"
            >
              <VisuallyHidden>
                <Trans id="controls.search.clear">Clear search field</Trans>
              </VisuallyHidden>
              <Box
                aria-hidden="true"
                sx={{ borderRadius: "50%", mr: "0.25rem" }}
              >
                <Icon name="close" size={16} color="secondary" />
              </Box>
            </ButtonBase>
          ) : null
        }
      />
    </Box>
  );
};

export type SearchFieldProps = ComponentProps<typeof SearchField>;

export const FieldSetLegend = ({
  legendTitle,
  sx,
}: {
  legendTitle: string | ReactNode;
  sx?: TypographyProps["sx"];
}) => (
  <Typography
    variant="caption"
    color="secondary"
    component="legend"
    sx={{
      lineHeight: ["1rem", "1.125rem", "1.125rem"],
      fontWeight: "normal",
      fontSize: ["0.625rem", "0.75rem", "0.75rem"],
      pl: 0,
      mb: 1,
      paddingBlock: 0,
      ...sx,
    }}
  >
    {legendTitle}
  </Typography>
);

export const Switch = ({
  id,
  label,
  name,
  checked,
  disabled,
  onChange,
  smaller,
  sx,
}: {
  id?: string;
  label: React.ComponentProps<typeof FormControlLabel>["label"];
  disabled?: boolean;
  smaller?: boolean;
  sx?: SxProps;
} & FieldProps) => {
  const genId = `switch-${useId(id)}`;

  return (
    <FormControlLabel
      htmlFor={genId}
      label={label}
      componentsProps={{
        typography: {
          variant: smaller ? "caption" : "body2",
          color: "grey.800",
        },
      }}
      control={
        <MUISwitch
          id={genId}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
      }
      sx={{
        width: "fit-content",
        fontSize: "0.875rem",
        ...sx,
      }}
    />
  );
};
