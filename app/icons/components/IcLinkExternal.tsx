import * as React from "react";
function SvgIcLinkExternal(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12 5v2H4v13h13v-8h2v10H2V5h10zm10-3v8h-2V5.414l-10 10L8.586 14l10-10H14V2h8z"
        />
      </g>
    </svg>
  );
}
export default SvgIcLinkExternal;
