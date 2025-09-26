import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";

export const FirstTenRowsCaption = () => {
  return (
    <Typography variant="h6" component="span" color="monochrome.500">
      <Trans id="datatable.showing.first.rows">Showing first 10 rows</Trans>
    </Typography>
  );
};
