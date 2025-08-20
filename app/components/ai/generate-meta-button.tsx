import { t } from "@lingui/macro";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

import { useChartAIContext } from "@/ai/use-chart-ai-context";
import { Icon } from "@/icons";
import { Locale } from "@/locales/locales";
import { useEvent } from "@/utils/use-event";

export const GenerateMetaButton = ({
  locale,
  field,
  onResult,
}: {
  locale: Locale;
  field: "title" | "description";
  onResult: (value: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const context = useChartAIContext();

  const handleClick = useEvent(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai/generate-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, locale, context }),
      });
      const { data } = (await response.json()) as { data: { text: string } };

      if (data.text) {
        onResult(data.text);
      }
    } finally {
      setLoading(false);
    }
  });

  const label =
    field === "title"
      ? t({ id: "ai.generate.title", message: "Generate title" })
      : t({ id: "ai.generate.description", message: "Generate description" });

  return (
    <Tooltip title={label} placement="top">
      <IconButton size="small" onClick={handleClick} disabled={loading}>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Icon name="star" size={20} />
        )}
      </IconButton>
    </Tooltip>
  );
};
