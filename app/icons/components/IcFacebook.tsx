import * as React from "react";
function SvgIcFacebook(props: React.SVGProps<SVGSVGElement>) {
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
          d="M20 2H4a2 2 0 00-2 2v16a2 2 0 002 2h8.833v-7.6h-2.5V11h2.5V9.01c0-2.582 1.578-3.99 3.883-3.99 1.104 0 2.052.083 2.329.12v2.7h-1.598c-1.254 0-1.496.597-1.496 1.47V11h3.7l-.834 3.4h-2.866V22H20a2 2 0 002-2V4a2 2 0 00-2-2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcFacebook;
