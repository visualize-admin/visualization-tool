import { Checkbox, Input, Label, Radio } from "@rebass/forms";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button, Link } from "rebass";
import { AppLayout } from "../../../components/layout";
import { LocalizedLink } from "../../../components/links";
import { useField } from "../../../domain/config-form";
import {
  ConfiguratorStateProvider,
  useConfiguratorState
} from "../../../domain/configurator-state";
import { Trans } from "@lingui/macro";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const Field = ({
  chartId,
  label,
  path,
  type,
  value,
  ...props
}: {
  chartId: string;
  label: string;
  path: string;
  type?: "text" | "checkbox" | "radio";
  value?: string;
}) => {
  const field = useField({
    chartId,
    path,
    type,
    value
  });

  return type === "radio" ? (
    <Label>
      <Radio {...field}></Radio>
      {label}
    </Label>
  ) : type === "checkbox" ? (
    <Label>
      <Checkbox {...field}></Checkbox>
      {label}
    </Label>
  ) : (
    <>
      {" "}
      <Label>{label}</Label>
      <Input {...field}></Input>
    </>
  );
};

const Form = ({ chartId }: { chartId: string }) => {
  const [state, dispatch] = useConfiguratorState({ chartId });

  return (
    <>
      <Box my={3} p={2}>
        {state.state === "IN_PROGRESS" && (
          <>
            Input something:
            <Field chartId={chartId} path={"dataSet"} label="Dataset" />
            <Field
              chartId={chartId}
              path={"chartConfig.title.de"}
              label="Title de"
            />
            <Field
              chartId={chartId}
              path={"chartConfig.title.fr"}
              label="Title fr"
            />
            <Field
              chartId={chartId}
              path={"chartConfig.title.it"}
              label="Title it"
            />
            <Field
              chartId={chartId}
              path={"chartConfig.title.en"}
              label="Title en"
            />
            <Field
              type="radio"
              chartId={chartId}
              path={"chartConfig.radio"}
              label="One"
              value="one"
            />
            <Field
              type="radio"
              chartId={chartId}
              path={"chartConfig.radio"}
              label="Two"
              value="two"
            />
            <Field
              type="checkbox"
              chartId={chartId}
              path={"chartConfig.fruit.bananas"}
              label="Bananas"
            />
            <Field
              type="checkbox"
              chartId={chartId}
              path={"chartConfig.fruit.apples"}
              label="Apples"
            />
            <Button onClick={() => dispatch({ type: "PUBLISH" })}>
              Publish
            </Button>
          </>
        )}

        {state.state === "PUBLISHED" && (
          <Box m={2} bg="secondary" color="white" p={2}>
            <Trans id="test-form-success">
              Konfiguration gespeichert unter
            </Trans>{" "}
            <LocalizedLink
              href={`/[locale]/config?key=${state.configKey}`}
              passHref
            >
              <Link
                color="white"
                sx={{ textDecoration: "underline", cursor: "pointer" }}
              >
                {state.configKey}
              </Link>
            </LocalizedLink>
          </Box>
        )}
      </Box>
      <Box my={3} p={2} bg="muted">
        <pre>{chartId}</pre>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </Box>
    </>
  );
};

const Page: NextPage = () => {
  const chartId = useChartId();

  return (
    <AppLayout>
      <ConfiguratorStateProvider key={chartId}>
        <div>
          <LocalizedLink href={"/[locale]/chart/new"} passHref>
            <a>New chart!</a>
          </LocalizedLink>
          <Form chartId={chartId} />
        </div>
      </ConfiguratorStateProvider>
    </AppLayout>
  );
};

export default Page;
