import * as React from "react";
function SvgIcHintWarning(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12 1L0 22h24L12 1zm1 16v2h-2v-2h2zm0-8v6h-2V9h2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcHintWarning;
