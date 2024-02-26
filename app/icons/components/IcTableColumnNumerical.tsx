import * as React from "react";
function SvgIcTableColumnNumerical(props: React.SVGProps<SVGSVGElement>) {
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
          d="M16.151 9l-.366 2.571h3.41L19.563 9h1.731l-.367 2.571H23v1.715h-2.314l-.493 3.428h1.95v1.715h-2.195L19.58 21h-1.731l.366-2.571h-3.41L14.437 21h-1.731l.367-2.571H11v-1.715h2.314l.493-3.428h-1.95V11.57h2.195L14.42 9h1.731zM9 17v3H2v-3h7zm9.953-3.714h-3.41l-.493 3.428h3.407l.496-3.428zM9 13v3H2v-3h7zm0-4v3H2V9h7zm13-5v4H2V4h20z"
        />
      </g>
    </svg>
  );
}
export default SvgIcTableColumnNumerical;
