import * as React from "react";

function SvgIcCategoricalHidden(props: React.SVGProps<SVGSVGElement>) {
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
          d="M2.052 1.586l20.534 20.533-1.467 1.467-5.065-5.066-2.141 2.143c-.193.192-.386.303-.65.33l-.138.007a.992.992 0 01-.69-.248l-.098-.09-9-9c-.192-.192-.303-.385-.33-.649L3 10.875v-5.41L.586 3.053l1.466-1.466zM10.875 3c.29 0 .496.083.69.248l.098.09 9 9c.417.417.447 1.03.089 1.475l-.09.1-2.022 2.02L5.706 3h5.169z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcCategoricalHidden;
