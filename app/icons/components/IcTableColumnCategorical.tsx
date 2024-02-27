import * as React from "react";
function SvgIcTableColumnCategorical(props: React.SVGProps<SVGSVGElement>) {
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
          d="M16.25 9a.68.68 0 01.525.225l6 6c.3.3.3.75 0 1.05l-4.5 4.5a.68.68 0 01-.525.225.68.68 0 01-.525-.225l-6-6A.68.68 0 0111 14.25v-4.5c0-.45.3-.75.75-.75zM9 17v3H2v-3h7zm0-4v3H2v-3h7zm5-2c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1zM9 9v3H2V9h7zm13-5v4H2V4h20z"
        />
      </g>
    </svg>
  );
}
export default SvgIcTableColumnCategorical;
