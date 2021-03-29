import NextLink from "next/link";
import * as React from "react";
import { ReactNode } from "react";
import { Box, Link, Text } from "theme-ui";
import { Hint } from "../components/hint";
import { ContentLayout } from "../components/layout";

const Page = () => {
  return (
    <>
      <ContentLayout>
        <Box sx={{ bg: "muted", margin: "auto" }}>
          <Hint sx={{ border: "1px solid black" }}>
            <Text variant="heading2" sx={{ my: 3 }}>
              Diese Seite wurde nicht gefunden.{" "}
            </Text>
            <HomeLink>Zurück zur Startseite</HomeLink>

            <Text variant="heading2" sx={{ my: 3 }}>
              Cette page est introuvable.
            </Text>
            <HomeLink>Retour à la page d'accueil</HomeLink>

            <Text variant="heading2" sx={{ my: 3 }}>
              Questa pagina non è stata trovata.
            </Text>
            <HomeLink>Torna alla homepage</HomeLink>

            <Text variant="heading2" sx={{ my: 3 }}>
              This page could not be found.
            </Text>
            <HomeLink>Back to Homepage</HomeLink>
          </Hint>
        </Box>
      </ContentLayout>
    </>
  );
};

const HomeLink = ({ children }: { children: ReactNode }) => (
  <NextLink href={`/`}>
    <Link
      sx={{
        bg: "transparent",
        color: "primary",
        textDecoration: "underline",
        mb: 6,
        fontSize: [4, 5, 5],
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </Link>
  </NextLink>
);
export default Page;
