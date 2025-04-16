import {
  dialogActionsClasses,
  dialogClasses,
  dialogContentClasses,
  dialogTitleClasses,
  paperClasses,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  addButton: {
    transition: "opacity 0.25s ease",
  },
  dialog: {
    "--dialog-padding": "60px",
    [`& .${dialogTitleClasses.root}`]: {
      padding: "var(--dialog-padding)",
      paddingBottom: 0,
    },
    [`& .${dialogContentClasses.root}`]: {
      padding: "var(--dialog-padding)",
      paddingTop: "2rem",
    },
    [`& .${dialogActionsClasses.root}`]: {
      padding: "var(--dialog-padding)",
      paddingTop: 0,
    },
    [`& .${dialogClasses.paper}`]: {
      minHeight: "calc(100vh - calc(30px * 2))",
    },
  },
  dialogCloseArea: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  newAnnotation: {
    color: theme.palette.success.main,
  },
  listTag: {
    whiteSpace: "break-spaces",
  },
  listItemSecondary: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 1,
    paddingTop: theme.spacing(1),
  },
  previewSelect: {
    width: 302,
  },
  previewSelectPaper: {
    [`& .${paperClasses.root}`]: {
      marginTop: "0.25rem",
    },
  },
}));

export default useStyles;
