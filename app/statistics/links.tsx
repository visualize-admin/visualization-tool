import { Link, Typography } from "@mui/material";

import { Icon } from "@/icons";
import { Locale } from "@/locales/locales";

export const ChartLink = ({
  locale,
  chartKey,
}: {
  locale: Locale;
  chartKey: string;
}) => {
  return (
    <Link
      href={`/${locale}/v/${chartKey}`}
      target="_blank"
      color="primary"
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "space-between",
      }}
    >
      <Typography
        variant="caption"
        component="p"
        sx={{
          overflow: "hidden",
          maxWidth: 200,
          cursor: "default",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {chartKey}
      </Typography>
      <Icon name="legacyLinkExternal" size={16} />
    </Link>
  );
};

export const CubeLink = ({
  locale,
  iri,
  title,
}: {
  locale: Locale;
  iri: string;
  title: string;
}) => {
  return (
    <Link
      href={`/${locale}/browse?dataset=${iri}`}
      target="_blank"
      color="primary"
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "space-between",
      }}
    >
      <Typography
        variant="caption"
        component="p"
        sx={{
          overflow: "hidden",
          maxWidth: 200,
          cursor: "default",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </Typography>
      <Icon name="legacyLinkExternal" size={16} />
    </Link>
  );
};
