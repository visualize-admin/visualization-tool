import * as React from "react";
function SvgIcText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M8 20v-2h3V7H6v2H4V5h16v4h-2V7h-5v11h3v2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcText;
