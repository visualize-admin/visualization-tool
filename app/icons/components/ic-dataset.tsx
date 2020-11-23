import * as React from "react";

function SvgIcDataset(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h64v64H0z" />
        <path
          d="M44.414 1L57 13.586V63H7V1h37.414zM43 3H9v58h46V15H43V3zm2 1.415V13h8.586L45 4.415zM51 32v12h-8V32h8zM41 20v24h-8V20h8zm-10 8v16h-8V28h8zm-10 8v8h-8v-8h8zm28-2h-4v8h4v-8zM39 22h-4v20h4V22zm-10 8h-4v12h4V30zm-10 8h-4v4h4v-4z"
          fill="#757575"
        />
      </g>
    </svg>
  );
}

export default SvgIcDataset;
