export const IconDescription = ({ size = 24, color = "currentColor" }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 26 24">
      <g
        transform="translate(-22 -120) translate(20 120)"
        fill="none"
        fillRule="evenodd"
      >
        <path d="M0 0H24V24H0z" />
        <path
          fill={color}
          d="M14 17v2H4v-2h10zm6-4v2H4v-2h16zm0-4v2H4V9h16zm0-4v2H4V5h16z"
        />
      </g>
    </svg>
  );
};
