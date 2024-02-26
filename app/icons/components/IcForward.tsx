import * as React from "react";
function SvgIcForward(props: React.SVGProps<SVGSVGElement>) {
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
          d="M4 20.256V3.744l7.512 7.512V3.744L19.744 12l-8.232 8.256v-7.512z"
        />
      </g>
    </svg>
  );
}
export default SvgIcForward;
