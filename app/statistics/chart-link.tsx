import { Link } from "@mui/material";

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
      {chartKey}
      <Icon name="linkExternal" size={16} />
    </Link>
  );
};
