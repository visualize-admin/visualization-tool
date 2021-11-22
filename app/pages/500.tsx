import { Box, Text } from "theme-ui";
import {
  Actions,
  ErrorPageHint,
  HomeLink,
  ReloadButton,
} from "../components/error-pages-components";
import { ContentLayout } from "../components/layout";

const Page = () => {
  return (
    <ContentLayout>
      <Box sx={{ bg: "muted", my: "auto" }}>
        <ErrorPageHint>
          <Text as="div" variant="heading2" sx={{ my: 3 }}>
            Ein Fehler ist aufgetreten.{" "}
          </Text>
          <Actions>
            <ReloadButton>Seite aktualisieren</ReloadButton>&nbsp;oder&nbsp;
            <HomeLink locale="de">zur Startseite navigieren</HomeLink>.
          </Actions>
        </ErrorPageHint>

        <ErrorPageHint>
          <Text as="div" variant="heading2" sx={{ my: 3 }}>
            Une erreur est survenue.{" "}
          </Text>
          <Actions>
            <ReloadButton>Rafraîchir</ReloadButton>&nbsp;ou&nbsp;
            <HomeLink locale="fr">aller à la page d&apos;accueil</HomeLink>.
          </Actions>
        </ErrorPageHint>

        <ErrorPageHint>
          <Text as="div" variant="heading2" sx={{ my: 3 }}>
            Si è verificato un errore.{" "}
          </Text>
          <Actions>
            <ReloadButton>Ricarica la pagina</ReloadButton>&nbsp;o&nbsp;
            <HomeLink locale="it">torna alla homepage</HomeLink>.
          </Actions>
        </ErrorPageHint>

        <ErrorPageHint>
          <Text as="div" variant="heading2" sx={{ my: 3 }}>
            An error occurred.{" "}
          </Text>
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
