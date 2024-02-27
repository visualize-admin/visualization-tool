import * as React from "react";
function SvgIcChartBar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M13 17.5v4H3v-4h10zm7-5v4H3v-4h17zm-4-5v4H3v-4h13zm-6-5v4H3v-4h7z"
      />
    </svg>
  );
}
export default SvgIcChartBar;
