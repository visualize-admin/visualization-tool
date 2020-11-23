import * as React from "react";

function SvgIcDatasetError(props: React.SVGProps<SVGSVGElement>) {
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
          d="M42.414 7L52 16.586v26.469c4.5.498 8 4.313 8 8.945a9.01 9.01 0 01-9 9 8.991 8.991 0 01-7.484-3.999L12 57V7h30.414zM41 9H14v46h28.512A9.001 9.001 0 0150 43.055V18h-9V9zm2 1.415V16h5.586L43 10.415zM51 54c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm1-6v5h-2v-5h2zM23 36v6h-6v-6h6zm-2 2h-2v2h2v-2zm26-6v10h-6V32h6zm-2 2h-2v6h2v-6zm-6-12v20h-6V22h6zm-2 2h-2v16h2V24zm-6 4v14h-6V28h6zm-2 2h-2v10h2V30z"
          fill="#757575"
        />
      </g>
    </svg>
  );
}

export default SvgIcDatasetError;
