import { Typography } from "@mui/material";

import { FooterSectionLink } from "@/federal-ci/components/footer-section-link";
import {
  EnvelopeIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/federal-ci/icons";
import { t } from "@/federal-ci/theme";

type FooterSectionSocialMediaButtonProps = {
  type: "instagram" | "linkedin" | "facebook" | "twitter" | "youtube" | "news";
  href: string;
};

export const FooterSectionSocialMediaButton = (
  props: FooterSectionSocialMediaButtonProps
) => {
  const { type, href } = props;

  return (
    <FooterSectionLink href={href}>
      <SocialMediaIcon name={type} />
      <Typography sx={{ typography: t.h5, fontWeight: "bold !important" }}>
        {type === "linkedin"
          ? "LinkedIn"
          : type.slice(0, 1).toUpperCase() + type.slice(1)}
      </Typography>
    </FooterSectionLink>
  );
};

const SocialMediaIcon = (props: {
  name: FooterSectionSocialMediaButtonProps["type"];
}) => {
  const { name } = props;

  switch (name) {
    case "instagram":
      return <InstagramIcon />;
    case "linkedin":
      return <LinkedinIcon />;
    case "facebook":
      return <FacebookIcon />;
    case "twitter":
      return <TwitterIcon />;
    case "youtube":
      return <YoutubeIcon />;
    case "news":
      return <EnvelopeIcon />;
    default:
      const _exhaustiveCheck: never = name;
      return _exhaustiveCheck;
  }
};
