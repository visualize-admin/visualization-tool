import {
  Alert,
  AlertProps,
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Color,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Link,
  Menu,
  MenuItem,
  PaletteColor,
  Radio,
  RadioGroup,
  rgbToHex,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Meta } from "@storybook/react";
import { useSnackbar } from "notistack";
import { ComponentProps, ReactNode, useState } from "react";

import SvgIcChevronLeft from "@/icons/components/IcChevronLeft";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";

import { DialogCloseButton } from "../components/dialog-close-button";
import useDisclosure from "../components/use-disclosure";

const meta: Meta = {
  title: "Design system / Theme",
};

const StorybookBody = ({
  children,
  ...props
}: { children: ReactNode } & Omit<ComponentProps<typeof Box>, "children">) => (
  <Box {...props}>{children}</Box>
);
const StorybookSection = ({
  children,
  ...props
}: { children: ReactNode } & Omit<ComponentProps<typeof Box>, "children">) => (
  <Box {...props}>{children}</Box>
);
const StorybookSectionTitle = ({
  children,
  ...props
}: { children: ReactNode } & Omit<
  ComponentProps<typeof Typography>,
  "children"
>) => (
  <Typography variant="h2" {...props}>
    {children}
  </Typography>
);

const paletteKeysOrder = [
  "050",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "light",
  "main",
  "dark",
  "contrastText",
  "A100",
  "A200",
  "A400",
  "A700",
];
const paletteKeyComparator = (a: string, b: string) => {
  const idxA = paletteKeysOrder.indexOf(a);
  const idxB = paletteKeysOrder.indexOf(b);
  return idxA < idxB ? -1 : idxA > idxB ? 1 : 0;
};

const Palette = ({
  name,
  value,
}: {
  name: string;
  value: PaletteColor | Color;
}) => {
  if (typeof value === "object") {
    const keys = Object.keys(value).sort(paletteKeyComparator);
    console.log({ keys });
    return (
      <Box title={name} sx={{ p: 1 }}>
        <Box
          sx={{
            display: "grid",
            gap: "0.5rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(5rem, 1fr))",
          }}
        >
          {keys.map((k) => {
            const v = value[k as keyof typeof value];
            return (
              <Box
                // eslint-disable-next-line visualize-admin/no-large-sx
                sx={{
                  border: "0px solid",
                  borderColor: "grey.600",
                  overflow: "hidden",
                  borderRadius: "4px",
                  width: 80,
                  mb: 1,
                  backgroundColor: "#F2F2F2",
                }}
                key={k}
              >
                <Box
                  sx={{
                    height: 63,
                    m: "1px",
                    display: "block",
                    backgroundColor: v,
                    borderRadius: "4px",
                  }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    m: [0, 1],
                    fontSize: 8,
                    lineHeight: "12px",
                  }}
                >
                  {k}
                  <br />
                  {rgbToHex(v)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  } else {
    return <>{value}</>;
  }
};

export const TypographyStory = () => (
  <StorybookSection>
    <StorybookSectionTitle>Typography</StorybookSectionTitle>
    <StorybookBody
      sx={{
        "& > *": { outline: "1px solid", outlineColor: "#ddd", mt: 1 },
      }}
    >
      <Typography variant="h1">h1</Typography>
      <Typography variant="h2">h2</Typography>
      <Typography variant="h3">h3</Typography>
      <Typography variant="h4">h4</Typography>
      <Typography variant="h5">h5</Typography>
      <Typography variant="body1">body1</Typography>
      <Typography variant="caption" display="block">
        caption
      </Typography>
    </StorybookBody>
  </StorybookSection>
);

TypographyStory.storyName = "Typography";

export const ElevationStory = () => {
  return (
    <StorybookSection>
      <StorybookSectionTitle>Elevation</StorybookSectionTitle>
      <Box
        sx={{
          bgcolor: "grey.100",
          display: "grid",
          p: 2,
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 12].map((x) => {
          return (
            <Card key={x} elevation={x} sx={{ width: 100, height: 100, p: 2 }}>
              <Typography variant="caption">Elevation = {x} </Typography>
            </Card>
          );
        })}
      </Box>
    </StorybookSection>
  );
};

ElevationStory.storyName = "Elevations";

export const PaletteStory = () => {
  const theme = useTheme();

  return (
    <StorybookSection>
      <StorybookSectionTitle gutterBottom>Palette</StorybookSectionTitle>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
          bgcolor: "#fafafa",
        }}
      >
        <Palette name="primary" value={theme.palette.primary} />
        <div />

        <Palette name="error" value={theme.palette.error} />
        <Palette name="warning" value={theme.palette.warning} />
        <Palette name="success" value={theme.palette.success} />

        <Palette name="uclaGold" value={theme.palette.organization} />
        <Palette name="tahitiGold" value={theme.palette.brand} />
        <div />
        <div />
        {/* <Palette name="info" value={theme.palette.info} /> */}
        <Palette name="grey" value={theme.palette.grey} />
      </Box>
    </StorybookSection>
  );
};

PaletteStory.storyName = "Palette";

const ButtonsExample: React.FC = () => {
  return (
    <Stack
      spacing={2}
      sx={{
        "& button": {
          mr: 1,
        },
      }}
    >
      <div>
        <Typography variant="caption" gutterBottom>
          Contained
        </Typography>
        <Button variant="contained">Button</Button>
        <Button variant="contained" disabled>
          Disabled
        </Button>
        <Button variant="contained" size="small">
          Small
        </Button>
        <Button
          startIcon={<SvgIcChevronLeft />}
          variant="contained"
          size="small"
        >
          Small
        </Button>
        <Button
          endIcon={<SvgIcChevronRight />}
          variant="contained"
          size="small"
        >
          Small
        </Button>
      </div>
      <div>
        <Typography variant="caption" gutterBottom>
          Outlined
        </Typography>
        <Button variant="outlined">Button</Button>
        <Button variant="outlined" disabled>
          Disabled
        </Button>
        <Button variant="outlined" size="small">
          Small
        </Button>
        <Button
          startIcon={<SvgIcChevronLeft />}
          variant="outlined"
          size="small"
        >
          Small
        </Button>
        <Button endIcon={<SvgIcChevronRight />} variant="outlined" size="small">
          Small
        </Button>
      </div>
      <div>
        <Typography variant="caption" gutterBottom>
          Text
        </Typography>
        <Button variant="text">Button</Button>
        <Button variant="text" disabled>
          Disabled
        </Button>
        <Button variant="text" size="small">
          Small
        </Button>
        <Button startIcon={<SvgIcChevronLeft />} variant="text" size="small">
          Button
        </Button>
        <Button endIcon={<SvgIcChevronRight />} variant="text" size="small">
          Button
        </Button>
      </div>
    </Stack>
  );
};

export const Components: React.FC = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
  const [inverted, setInverted] = useState(true);

  return (
    <>
      <FormControlLabel
        label={"Inverted"}
        control={
          <Checkbox
            checked={inverted}
            onChange={(_ev, value) => setInverted(value)}
          />
        }
      />
      <Box>
        <StorybookSection>
          <StorybookSectionTitle>Buttons</StorybookSectionTitle>
          <ButtonsExample />
        </StorybookSection>
        <StorybookSection>
          <StorybookSectionTitle>Alerts</StorybookSectionTitle>
          {(
            ["info", "success", "warning", "error"] as AlertProps["severity"][]
          ).map((severity) => (
            <Alert key={severity} severity={severity} sx={{ mb: 1 }}>
              Here is an Alert of severity {severity}.
            </Alert>
          ))}
        </StorybookSection>
        <StorybookSection>
          <StorybookSectionTitle>Cards</StorybookSectionTitle>
          <Card
            elevation={6}
            sx={{
              p: 2,
              width: 570,
              display: "flex",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <Box
              sx={{
                width: 230,
                height: 230,
                bgcolor: "grey.300",
                flex: "0 0 auto",
              }}
            />
            <div>
              <Typography variant="h2" gutterBottom>
                Title
              </Typography>
              <Typography variant="body2" gutterBottom display="block">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Typography>
              <Link typography="body2" underline="hover" href="#">
                Text
              </Link>
            </div>
          </Card>
        </StorybookSection>
        <StorybookSection>
          <StorybookSectionTitle>Forms</StorybookSectionTitle>
          <div>
            <FormControlLabel label={"Checkbox"} control={<Checkbox />} />
            <FormControlLabel
              label={"Checkbox"}
              control={<Checkbox defaultChecked={false} />}
            />
            <FormControlLabel
              label={"Checkbox"}
              control={<Checkbox indeterminate />}
            />
          </div>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
            >
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="other"
                control={<Radio />}
                label="Other"
              />
            </RadioGroup>
          </FormControl>
          <Box my={1}>
            <Select size="small" defaultValue="Vanilla">
              <MenuItem value="Vanilla">Vanilla</MenuItem>
              <MenuItem value="Chocolate">Chocolate</MenuItem>
              <MenuItem value="Raspberry">Raspberry</MenuItem>
            </Select>
          </Box>
          <Autocomplete
            multiple
            value={["Vanilla"]}
            renderInput={(params) => <TextField {...params} />}
            options={["Chocolate", "Vanilla", "Strawberry"]}
          />
          <FormControlLabel
            label="Switch"
            control={<Switch sx={{ ml: 2, mr: 1 }} />}
          />
        </StorybookSection>
        <StorybookSection>
          <StorybookSectionTitle>Tooltips</StorybookSectionTitle>
          <Tooltip
            open
            placement="right"
            title={<Typography>Tooltip</Typography>}
          >
            <Button>Trigger</Button>
          </Tooltip>
        </StorybookSection>
        <StorybookSection>
          <StorybookSectionTitle>Menu</StorybookSectionTitle>
          <Button onClick={(ev) => setMenuAnchorEl(ev.currentTarget)}>
            Open/close menu
          </Button>
          <Menu
            open={!!menuAnchorEl}
            anchorEl={menuAnchorEl}
            onClose={() => setMenuAnchorEl(undefined)}
          >
            <MenuItem>Rename</MenuItem>
            <MenuItem>View</MenuItem>
            <MenuItem>Edit</MenuItem>
          </Menu>
        </StorybookSection>
        <StorybookSection>
          <StorybookSectionTitle>Snackbars</StorybookSectionTitle>
          <SnackbarExample />
        </StorybookSection>
      </Box>
    </>
  );
};

const SnackbarExample = () => {
  const { enqueueSnackbar } = useSnackbar();
  const renderButton = (variant: NonNullable<AlertProps["severity"]>) => {
    const formatted = `${variant[0].toUpperCase()}${variant?.substring(1)}`;
    return (
      <Button
        color={variant}
        onClick={() =>
          enqueueSnackbar({
            variant: variant,
            message: `${formatted} message`,
          })
        }
      >
        {formatted}
      </Button>
    );
  };
  return (
    <Stack gap="1rem" direction="row">
      {renderButton("success")}
      {renderButton("info")}
      {renderButton("warning")}
      {renderButton("error")}
    </Stack>
  );
};

export const DialogExample = () => {
  const { isOpen, close, setOpen } = useDisclosure(true);
  return (
    <>
      <Button onClick={() => setOpen((s) => !s)}>Toggle</Button>
      <Dialog open={isOpen}>
        <DialogCloseButton onClick={close} />
        <DialogTitle>Example Dialog</DialogTitle>
        <DialogContent>
          A Dialog is a type of modal window that appears in front of app
          content to provide critical information or ask for a decision. Dialogs
          disable all app functionality when they appear, and remain on screen
          until confirmed, dismissed, or a required action has been taken.
          Dialogs are purposefully interruptive, so they should be used
          sparingly.
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={close}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

DialogExample.storyName = "Dialog";

export default meta;
