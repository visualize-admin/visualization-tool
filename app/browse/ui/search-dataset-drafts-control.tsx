import { t } from "@lingui/macro";

import { Checkbox } from "@/components/form";

export const SearchDatasetDraftsControl = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) => {
  return (
    <Checkbox
      label={t({
        id: "dataset.includeDrafts",
        message: "Include draft datasets",
      })}
      name="dataset-include-drafts"
      value="dataset-include-drafts"
      checked={checked}
      onChange={() => onChange(!checked)}
    />
  );
};
