export const IconDragndrop = ({ size = 24, color = "currentColor" }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
        <path d="M0 0H24V24H0z" />
        <path
          d="M11 18v3H8v-3h3zm5 0v3h-3v-3h3zm-5-5v3H8v-3h3zm5 0v3h-3v-3h3zm-5-5v3H8V8h3zm5 0v3h-3V8h3zm-5-5v3H8V3h3zm5 0v3h-3V3h3z"
          fill={color}
        />
      </g>
    </svg>
  );
};
