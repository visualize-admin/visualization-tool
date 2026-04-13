import { FooterSectionText } from "@/federal-ci/components/footer-section-text";
import { Button } from "@/federal-ci/foundations";
import { ArrowRightIcon, DownloadIcon, ExternalIcon } from "@/federal-ci/icons";
import { c, s } from "@/federal-ci/theme";

type FooterSectionButtonProps = {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  iconName?: "arrow-right" | "download" | "external";
};

export const FooterSectionButton = (props: FooterSectionButtonProps) => {
  const { label, disabled, onClick, iconName = "arrow-right" } = props;

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      sx={{
        justifyContent: "space-between",
        width: "100%",
        minHeight: "64px",
        px: s(3),
        py: s(2),
        borderBottom: `1px solid ${c.monochrome[50]}`,
        color: c.monochrome[50],

        ":hover": {
          backgroundColor: c.cobalt[700],
        },

        "& *": {
          color: disabled ? c.cobalt[300] : c.monochrome[50],
        },
      }}
    >
      <FooterSectionText text={label} />
      <FooterButtonIcon name={iconName} />
    </Button>
  );
};

const FooterButtonIcon = (props: {
  name: NonNullable<FooterSectionButtonProps["iconName"]>;
}) => {
  const { name } = props;

  switch (name) {
    case "arrow-right":
      return <ArrowRightIcon />;
    case "download":
      return <DownloadIcon />;
    case "external":
      return <ExternalIcon />;
    default:
      const _exhaustiveCheck: never = name;
      return _exhaustiveCheck;
  }
};
