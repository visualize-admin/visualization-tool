import { SvgIcon, SvgIconProps } from "@mui/material";

export const CheckboxIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 16 16" style={{ fontSize: "1rem" }}>
    <path
      d="M0.5 2C0.5 1.17157 1.17157 0.5 2 0.5H14C14.8284 0.5 15.5 1.17157 15.5 2V14C15.5 14.8284 14.8284 15.5 14 15.5H2C1.17157 15.5 0.5 14.8284 0.5 14V2Z"
      fill="white"
      stroke="#6B7280"
    />
  </SvgIcon>
);

export const CheckboxIndeterminateIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 16 16" style={{ fontSize: "1rem" }}>
    <path
      d="M0.5 2C0.5 1.17157 1.17157 0.5 2 0.5H14C14.8284 0.5 15.5 1.17157 15.5 2V14C15.5 14.8284 14.8284 15.5 14 15.5H2C1.17157 15.5 0.5 14.8284 0.5 14V2Z"
      fill="#1F2937"
    />
    <path
      d="M0.5 2C0.5 1.17157 1.17157 0.5 2 0.5H14C14.8284 0.5 15.5 1.17157 15.5 2V14C15.5 14.8284 14.8284 15.5 14 15.5H2C1.17157 15.5 0.5 14.8284 0.5 14V2Z"
      stroke="#6B7280"
    />
    <path
      d="M3 7.875C3 7.73693 3.11193 7.625 3.25 7.625H12.75C12.8881 7.625 13 7.73693 13 7.875V8.125C13 8.26307 12.8881 8.375 12.75 8.375H3.25C3.11193 8.375 3 8.26307 3 8.125V7.875Z"
      fill="white"
      stroke="white"
    />
  </SvgIcon>
);

export const CheckboxCheckedIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 16 16" style={{ fontSize: "1rem" }}>
    <path
      d="M0.5 2C0.5 1.17157 1.17157 0.5 2 0.5H14C14.8284 0.5 15.5 1.17157 15.5 2V14C15.5 14.8284 14.8284 15.5 14 15.5H2C1.17157 15.5 0.5 14.8284 0.5 14V2Z"
      fill="#1F2937"
    />
    <path
      d="M0.5 2C0.5 1.17157 1.17157 0.5 2 0.5H14C14.8284 0.5 15.5 1.17157 15.5 2V14C15.5 14.8284 14.8284 15.5 14 15.5H2C1.17157 15.5 0.5 14.8284 0.5 14V2Z"
      stroke="#6B7280"
    />
    <path
      d="M6.41797 11.7971C6.31881 11.906 6.14751 11.906 6.04834 11.7971L3.15335 8.61923C3.06644 8.52383 3.06643 8.37795 3.15332 8.28254L3.3349 8.08315C3.43408 7.97425 3.60545 7.97426 3.70461 8.08319L6.04832 10.6576C6.14748 10.7666 6.31886 10.7666 6.41803 10.6576L12.2954 4.20299C12.3946 4.09409 12.5659 4.09408 12.6651 4.20298L12.8467 4.40239C12.9336 4.4978 12.9336 4.64367 12.8467 4.73907L6.41797 11.7971Z"
      fill="white"
      stroke="white"
      stroke-linejoin="round"
    />
  </SvgIcon>
);

export const RadioIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 16 16" style={{ fontSize: "1rem" }}>
    <path
      d="M0.5 8C0.5 3.85786 3.85786 0.5 8 0.5C12.1421 0.5 15.5 3.85786 15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8Z"
      fill="white"
      stroke="#6B7280"
    />
  </SvgIcon>
);

export const RadioCheckedIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 16 16" style={{ fontSize: "1rem" }}>
    <path
      d="M0.5 8C0.5 3.85786 3.85786 0.5 8 0.5C12.1421 0.5 15.5 3.85786 15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8Z"
      fill="#1F2937"
      stroke="#6B7280"
    />
    <path
      d="M5 8C5 6.34315 6.34315 5 8 5C9.65685 5 11 6.34315 11 8C11 9.65685 9.65685 11 8 11C6.34315 11 5 9.65685 5 8Z"
      fill="white"
    />
  </SvgIcon>
);
