import { Typography } from "@mui/material";

import { b, s, t } from "@/federal-ci/theme";

type FooterSectionTitleProps = {
  title: string;
};

export const FooterSectionTitle = (props: FooterSectionTitleProps) => {
  const { title } = props;

  return (
    <Typography
      sx={{
        mb: s(3),
        [b.up("lg")]: { mb: s(6) },
        typography: t.h2,
        [b.only("xxxl" as any)]: { fontSize: "24px", lineHeight: "36px" },
      }}
    >
      {title}
    </Typography>
  );
};
