import React from "react";

export const IconArrowRight = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <g
      transform="translate(-649 -708) translate(0 176) translate(0 368) translate(58 80) translate(283 84) translate(308)"
      stroke="none"
      strokeWidth={1}
      fill="none"
      fillRule="evenodd"
    >
      <circle fill={color} cx={16} cy={16} r={16} />
      <path
        d="M9.341 1.99l.07-.08c.3-.3.773-.323 1.1-.069l.078.07 7.5 7.5.035.036.046.057.06.093.044.094.03.087.02.098.006.05.003.09-.003.058-.014.093-.024.093-.037.093-.043.08-.062.088-.06.068-7.5 7.5a.833.833 0 01-1.249-1.1l.07-.078 6.077-6.078H2.5a.833.833 0 01-.828-.736L1.667 10c0-.427.321-.78.736-.828l.097-.005h12.988L9.41 3.089a.833.833 0 01-.07-1.1l.07-.078-.07.078z"
        transform="translate(6 6)"
        fill="#FFF"
      />
    </g>
  </svg>
);
