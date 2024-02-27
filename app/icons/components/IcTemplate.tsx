import * as React from "react";
function SvgIcTemplate(props: React.SVGProps<SVGSVGElement>) {
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
          d="M23 23H7V7h16v16zM21 9H9v12h12V9zm-8 7v3h-2v-3h2zm3-4v7h-2v-7h2zm3 2v5h-2v-5h2zM17 1v6h-2V3H3v12h4v2H1V1h16z"
        />
      </g>
    </svg>
  );
}
export default SvgIcTemplate;
