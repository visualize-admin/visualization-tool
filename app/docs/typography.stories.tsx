import { Box, Typography, TypographyVariant } from "@mui/material";

const meta = {
  title: "components / Typography",
  component: Typography,
};

export default meta;

const VariantsStory = () => (
  <Box>
    {(
      [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "body1",
        "body2",
        "caption",
        "tag",
      ] as TypographyVariant[]
    ).map((variant) => (
      <div key={variant}>
        {variant}
        <br />
        <Typography variant={variant}>The quick brown fox...</Typography>
      </div>
    ))}
  </Box>
);

export { VariantsStory as Variants };
