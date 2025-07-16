import { IconButton, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useCallback } from "react";

import { RenderAnnotation } from "@/charts/shared/annotations";
import { MarkdownInheritFonts } from "@/components/markdown";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";

export const AnnotationTooltip = ({
  renderAnnotation: { annotation, x, y },
}: {
  renderAnnotation: RenderAnnotation;
}) => {
  const classes = useStyles();
  const annotations = useChartInteractiveFilters((d) => d.annotations);
  const setAnnotations = useChartInteractiveFilters((d) => d.setAnnotations);
  const open = annotations[annotation.key];
  const locale = useLocale();
  const text = annotation.text[locale];

  const handleClose = useCallback(() => {
    setAnnotations({ ...annotations, [annotation.key]: false });
  }, [annotation.key, annotations, setAnnotations]);

  return open && text ? (
    <div className={classes.root} style={{ left: x, top: y + 28 }}>
      {/* TODO: There should be a distinction between the title and the text */}
      <Typography variant="caption">
        <MarkdownInheritFonts>{annotation.text[locale]}</MarkdownInheritFonts>
      </Typography>
      <IconButton className={classes.closeButton} onClick={handleClose}>
        <Icon name="close" />
      </IconButton>
    </div>
  ) : null;
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    transform: "translate(0%, -100%)",
    position: "absolute",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    width: "100%",
    maxWidth: 240,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[4],
  },
  closeButton: {
    padding: 0,
  },
}));
