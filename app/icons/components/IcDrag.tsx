import * as React from "react";
function SvgIcDrag(props: React.SVGProps<SVGSVGElement>) {
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
          d="M13 13l11 3-4 2 4 4-2 2-4-4-2 4-3-11zM2 15v3h3v2H0v-5h2zm10 3v2H8v-2h4zm8-10v4h-2V8h2zM2 8v4H0V8h2zm3-8v2H2v3H0V0h5zm15 0v5h-2V2h-3V0h5zm-8 0v2H8V0h4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcDrag;
