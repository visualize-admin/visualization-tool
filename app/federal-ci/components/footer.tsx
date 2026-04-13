import { Box, Breakpoint, SxProps, Typography } from "@mui/material";
import { Children, PropsWithChildren } from "react";

import { ContentWrapper } from "@/federal-ci/components/content-wrapper";
import { FooterSectionLink } from "@/federal-ci/components/footer-section-link";
import { b, c, t } from "@/federal-ci/theme";
import { makeStyles } from "@/federal-ci/utils/make-styles";

const useStyles = makeStyles<{ nCols: number | "auto" }>()(
  ({ breakpoints: b, spacing: s }, { nCols }) => ({
    top: {
      paddingTop: s(10),
      paddingBottom: s(10),
      [b.between("lg", "xxxl" as Breakpoint)]: {
        paddingTop: s(16),
        paddingBottom: s(16),
      },
      [b.only("xxxl" as Breakpoint)]: {
        paddingBottom: s(33),
        paddingTop: s(20),
      },
      backgroundColor: c.cobalt[600],
    },

    topColumns: {
      display: "flex",
      flexDirection: "column",
      [b.up("xl")]: {
        display: "grid",
        gridTemplateColumns: `repeat(min(3, ${nCols}), 1fr)`,
      },
      gap: s(8),
      [b.up("xxl" as Breakpoint)]: {
        gap: s(16),
        gridTemplateColumns: `repeat(${nCols}, 1fr)`,
      },
      width: "100%",
    },

    bottomContentWrapper: {
      flexWrap: "wrap",
      justifyContent: "flex-start",
      rowGap: s(2),
      columnGap: s(3),
      [b.between("lg", "xxl" as Breakpoint)]: {
        rowGap: s(6),
        columnGap: s(12),
      },
      [b.up("xxl" as Breakpoint)]: { rowGap: s(8), columnGap: s(16) },

      paddingTop: s(4),
      paddingBottom: s(4),
      [b.up("lg")]: { paddingTop: s(6), paddingBottom: s(6) },
    },
  })
);

type FooterProps = PropsWithChildren<{
  bottomLinks?: {
    title: string;
    href: string;
    external?: boolean;
  }[];
  nCols?: number | "auto";
  ContentWrapperProps?: {
    sx?: SxProps;
  };
}>;

export const Footer = (props: FooterProps) => {
  const { bottomLinks, nCols: _nCols, ContentWrapperProps, children } = props;
  const nCols = _nCols === "auto" ? Children.count(children) : (_nCols ?? 4);
  const { classes } = useStyles({ nCols });

  return (
    <Box component="footer">
      <Box className={classes.top}>
        <ContentWrapper sx={ContentWrapperProps?.sx}>
          <Box className={classes.topColumns}>{children}</Box>
        </ContentWrapper>
      </Box>

      {bottomLinks && (
        <Box sx={{ backgroundColor: c.cobalt[700] }}>
          <ContentWrapper
            className={classes.bottomContentWrapper}
            sx={ContentWrapperProps?.sx}
          >
            {bottomLinks.map((d) => {
              return (
                <FooterSectionLink
                  key={d.title + d.href}
                  href={d.href}
                  external={d.external}
                >
                  <Typography
                    sx={{
                      [b.between("xs", "md")]: { typography: t.caption },
                      [b.up("md")]: { typography: t.body2 },
                    }}
                  >
                    {d.title}
                  </Typography>
                </FooterSectionLink>
              );
            })}
          </ContentWrapper>
        </Box>
      )}
    </Box>
  );
};
