import { styled } from "@mui/material";
import {
  MaterialDesignContent,
  SnackbarProvider as NotistackSnackbarProvider,
} from "notistack";

import SvgIcCheckmarkCircle from "@/icons/components/IcCheckmarkCircle";
import SvgIcClear from "@/icons/components/IcClear";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";

const StyledMaterialDesignContent = styled(MaterialDesignContent)(
  ({ theme }) => ({
    "&.notistack-MuiContent-success": {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.success.light,
      "--icon-color": theme.palette.success.main,
    },
    "&.notistack-MuiContent-error": {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.error.light,
      "--icon-color": theme.palette.error.main,
    },
    "&.notistack-MuiContent-warning": {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.warning.light,
      "--icon-color": theme.palette.warning.main,
    },
    "&.notistack-MuiContent-info": {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.info.light,
      "--icon-color": theme.palette.info.main,
    },
    "& .icon": {
      marginRight: "0.75rem",
      color: "var(--icon-color)",
    },
  })
);

const iconVariants = {
  success: <SvgIcCheckmarkCircle width={24} height={24} className="icon" />,
  warning: <SvgIcCheckmarkCircle width={24} height={24} className="icon" />,
  info: <SvgIcInfoCircle width={24} height={24} className="icon" />,
  error: <SvgIcClear width={24} height={24} className="icon" />,
};

export const SnackbarProvider = (props: React.PropsWithChildren<{}>) => {
  return (
    <NotistackSnackbarProvider
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      iconVariant={iconVariants}
      Components={{
        info: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
      }}
      {...props}
    />
  );
};
