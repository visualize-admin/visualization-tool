import * as React from "react";
function SvgIcText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.465 5H19v1.75h-.875v-.875h-5.66v12.25h1.285V19h-3.5v-.875h1.281V5.875H5.875v.875h-.872v-.875H5V5h7.465z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcText;
