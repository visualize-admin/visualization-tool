import * as React from "react";
function SvgIcExcel(props: React.SVGProps<SVGSVGElement>) {
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
          d="M17.415 9h-3.171L12 12.305 9.756 9H6.585l3.801 5.683L6.098 21h6.146v-2.147h-1.419L12 17.096 14.611 21h3.292l-4.289-6.317L17.415 9zm3.759-4.326l-3.349-3.348C17.097.596 15.656 0 14.625 0H3.375A1.88 1.88 0 001.5 1.875v20.25A1.88 1.88 0 003.375 24h17.25a1.88 1.88 0 001.875-1.875V7.875c0-1.031-.597-2.472-1.326-3.201zm-1.06 1.06c.073.074.146.163.217.266H16.5V2.169c.102.071.192.144.265.217l3.348 3.348h.001zM21 22.125a.38.38 0 01-.375.375H3.375A.38.38 0 013 22.125V1.875a.38.38 0 01.375-.375h11.25c.113 0 .24.014.375.04V7.5h5.96c.026.135.04.262.04.375v14.25z"
        />
      </g>
    </svg>
  );
}
export default SvgIcExcel;
