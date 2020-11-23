import * as React from "react";

function SvgIcMapBasis(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          d="M22 2.277V17.67l-6.696 3.826-6.545-3.273L2 22.087V6.692l6.696-3.826L15.24 6.14 22 2.277zM9.727 5.617v10.856l4.545 2.273V7.89L9.727 5.617zm-2 .106L4 7.852V18.64l3.727-2.13V5.723zm12.273 0l-3.728 2.13V18.64L20 16.509V5.723z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcMapBasis;
