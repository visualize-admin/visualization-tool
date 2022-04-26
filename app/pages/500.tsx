import { Box, Typography } from "@mui/material";

import {
  Actions,
  ErrorPageHint,
  HomeLink,
  ReloadButton,
} from "@/components/error-pages-components";
import { ContentLayout } from "@/components/layout";

const Page = () => {
  return (
    <ContentLayout>
      <Box sx={{ backgroundColor: "muted.main", my: "auto" }}>
        <ErrorPageHint>
          <Typography component="div" variant="h2" sx={{ my: 3 }}>
            Ein Fehler ist aufgetreten.{" "}
          </Typography>
          <Actions>
            <ReloadButton>Seite aktualisieren</ReloadButton>&nbsp;oder&nbsp;
            <HomeLink locale="de">zur Startseite navigieren</HomeLink>.
          </Actions>
        </ErrorPageHint>

        <ErrorPageHint>
          <Typography component="div" variant="h2" sx={{ my: 3 }}>
            Une erreur est survenue.{" "}
          </Typography>
          <Actions>
            <ReloadButton>Rafraîchir</ReloadButton>&nbsp;ou&nbsp;
            <HomeLink locale="fr">aller à la page d&apos;accueil</HomeLink>.
          </Actions>
        </ErrorPageHint>

        <ErrorPageHint>
          <Typography component="div" variant="h2" sx={{ my: 3 }}>
            Si è verificato un errore.{" "}
          </Typography>
          <Actions>
            <ReloadButton>Ricarica la pagina</ReloadButton>&nbsp;o&nbsp;
            <HomeLink locale="it">torna alla homepage</HomeLink>.
          </Actions>
        </ErrorPageHint>

        <ErrorPageHint>
          <Typography component="div" variant="h2" sx={{ my: 3 }}>
            An error occurred.{" "}
          </Typography>
          <Actions>
            <ReloadButton>Reload the page</ReloadButton>&nbsp;or&nbsp;
            <HomeLink locale="en">go back to Homepage</HomeLink>.
          </Actions>
        </ErrorPageHint>
      </Box>
    </ContentLayout>
  );
};

export default Page;
