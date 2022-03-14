import { Box, Text } from "@mui/material";
import {
  Actions,
  ErrorPageHint,
  HomeLink,
} from "../components/error-pages-components";
import { ContentLayout } from "../components/layout";

const Page = () => (
  <ContentLayout>
    <Box sx={{ bg: "muted", my: "auto" }}>
      <ErrorPageHint>
        <Typography as="div" variant="heading2" sx={{ my: 3 }}>
          Diese Seite wurde nicht gefunden.
        </Typography>
        <Actions>
          <HomeLink locale="de">Zurück zur Startseite</HomeLink>
        </Actions>
      </ErrorPageHint>
      <ErrorPageHint>
        <Typography as="div" variant="heading2" sx={{ my: 3 }}>
          Cette page est introuvable.
        </Typography>
        <Actions>
          <HomeLink locale="fr">Retour à la page d&apos;accueil</HomeLink>
        </Actions>
      </ErrorPageHint>
      <ErrorPageHint>
        <Typography as="div" variant="heading2" sx={{ my: 3 }}>
          Questa pagina non è stata trovata.
        </Typography>
        <Actions>
          <HomeLink locale="it">Torna alla homepage</HomeLink>
        </Actions>
      </ErrorPageHint>
      <ErrorPageHint>
        <Typography as="div" variant="heading2" sx={{ my: 3 }}>
          This page could not be found.
        </Typography>
        <Actions>
          <HomeLink locale="en">Back to Homepage</HomeLink>
        </Actions>
      </ErrorPageHint>
    </Box>
  </ContentLayout>
);

export default Page;
