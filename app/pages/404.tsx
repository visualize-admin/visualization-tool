import { Box, Text } from "theme-ui";
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
        <Text as="div" variant="heading2" sx={{ my: 3 }}>
          Diese Seite wurde nicht gefunden.
        </Text>
        <Actions>
          <HomeLink locale="de">Zurück zur Startseite</HomeLink>
        </Actions>
      </ErrorPageHint>
      <ErrorPageHint>
        <Text as="div" variant="heading2" sx={{ my: 3 }}>
          Cette page est introuvable.
        </Text>
        <Actions>
          <HomeLink locale="fr">Retour à la page d'accueil</HomeLink>
        </Actions>
      </ErrorPageHint>
      <ErrorPageHint>
        <Text as="div" variant="heading2" sx={{ my: 3 }}>
          Questa pagina non è stata trovata.
        </Text>
        <Actions>
          <HomeLink locale="it">Torna alla homepage</HomeLink>
        </Actions>
      </ErrorPageHint>
      <ErrorPageHint>
        <Text as="div" variant="heading2" sx={{ my: 3 }}>
          This page could not be found.
        </Text>
        <Actions>
          <HomeLink locale="en">Back to Homepage</HomeLink>
        </Actions>
      </ErrorPageHint>
    </Box>
  </ContentLayout>
);

export default Page;
