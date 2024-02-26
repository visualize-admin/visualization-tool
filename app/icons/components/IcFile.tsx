import * as React from "react";
function SvgIcFile(props: React.SVGProps<SVGSVGElement>) {
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
          d="M21.174 4.674l-3.348-3.348C17.097.597 15.656 0 14.625 0H3.375A1.88 1.88 0 001.5 1.875v20.25A1.88 1.88 0 003.375 24h17.25a1.88 1.88 0 001.875-1.875V7.875c0-1.031-.597-2.472-1.326-3.201zm-1.06 1.061c.073.073.146.163.217.265H16.5V2.169c.102.071.192.144.265.217l3.348 3.348.001.001zM21 22.125a.38.38 0 01-.375.375H3.375A.38.38 0 013 22.125V1.875a.38.38 0 01.375-.375h11.25c.113 0 .24.014.375.04V7.5h5.96c.026.135.04.262.04.375v14.25z"
        />
      </g>
    </svg>
  );
}
export default SvgIcFile;
