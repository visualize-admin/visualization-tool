import { Checkbox, Input, Label, Radio } from "@rebass/forms";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button } from "rebass";
import { AppLayout } from "../../../components/layout";
import { LocalizedLink } from "../../../components/links";
import { useField } from "../../../domain/config-form";
import { ConfiguratorStateProvider, useConfiguratorState } from "../../../domain/configurator-state";

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
            <Field chartId={chartId} path={"chartConfig.foo"} label="Foo" />
            <Field chartId={chartId} path={"chartConfig.bar"} label="Bar" />
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
            <Button onClick={() => dispatch({ type: "PUBLISHED" })}>
              Publish
            </Button>
          </>
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
