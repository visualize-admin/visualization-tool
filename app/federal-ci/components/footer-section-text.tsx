import { Typography } from "@mui/material";

import { b, t } from "@/federal-ci/theme";

type FooterSectionTextProps = {
  text: string;
};

export const FooterSectionText = (props: FooterSectionTextProps) => {
  const { text } = props;

  return (
    <Typography
      component="span"
      sx={{
        textAlign: "left",
        typography: t.body2,
        [b.only("xxxl" as any)]: { fontSize: "18px", lineHeight: "28px" },
      }}
    >
      {text}
    </Typography>
  );
};
