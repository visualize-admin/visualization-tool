import { Trans } from "@lingui/macro";
import { Label, Textarea, Input } from "@rebass/forms";
import { AppLayout } from "../../components/layout";
import { Button, Box, Link } from "rebass";
import { useRef, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { LocalizedLink } from "../../components/links";

type ReturnVal = {
  key: string;
};

const save = async (values: any): Promise<ReturnVal> => {
  return fetch("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(values)
  }).then(res => res.json());
};

export default () => {
  const [savedConfig, setSavedConfig] = useState<ReturnVal>();

  return (
    <AppLayout>
      <Formik
        initialValues={{
          title: {
            de: "",
            fr: "",
            it: "",
            en: ""
          }
        }}
        onSubmit={(values, { setSubmitting }) => {
          save(values).then(value => {
            setSavedConfig(value);
            setSubmitting(false);
          });
        }}
        render={({ isSubmitting }) => {
          return (
            <Form>
              <Box width={[1 / 2]} sx={{ opacity: isSubmitting ? 0.1 : 1 }}>
                <Box p={2}>
                  <Label htmlFor="title.de">
                    <Trans id="test-form-title">Titel</Trans> (DE)
                  </Label>
                  <Input as={Field} id="title.de" name="title.de"></Input>
                </Box>
                <Box p={2}>
                  <Label htmlFor="title.fr">
                    <Trans id="test-form-title">Titel</Trans> (FR)
                  </Label>
                  <Input as={Field} id="title.fr" name="title.fr"></Input>
                </Box>
                <Box p={2}>
                  <Label htmlFor="title.it">
                    <Trans id="test-form-title">Titel</Trans> (IT)
                  </Label>
                  <Input as={Field} id="title.it" name="title.it"></Input>
                </Box>
                <Box p={2}>
                  <Label htmlFor="title.en">
                    <Trans id="test-form-title">Titel</Trans> (EN)
                  </Label>
                  <Input as={Field} id="title.en" name="title.en"></Input>
                </Box>
                <Box p={2}>
                  <Button type="submit" disabled={isSubmitting}>
                    <Trans id="test-form-save">Speichern</Trans>
                  </Button>
                </Box>
              </Box>
            </Form>
          );
        }}
      ></Formik>

      {savedConfig && (
        <Box m={2} bg="secondary" color="white" p={2}>
          <Trans id="test-form-success">Konfiguration gespeichert unter</Trans>{" "}
          <LocalizedLink href={`/[locale]/config?key=${savedConfig.key}`} passHref>
            <Link
              color="white"
              sx={{ textDecoration: "underline", cursor: "pointer" }}
            >
              {savedConfig.key}
            </Link>
          </LocalizedLink>
        </Box>
      )}
    </AppLayout>
  );
};
