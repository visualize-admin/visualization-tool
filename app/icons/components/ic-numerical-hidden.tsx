import * as React from "react";

function SvgIcNumericalHidden(props: React.SVGProps<SVGSVGElement>) {
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
          d="M2.052 1.586l20.534 20.533-1.467 1.467-4.916-4.916L15.87 21h-2.597l.55-3.857H8.707L8.156 21H5.559l.55-3.857H3V14.57h3.471l.708-4.926-.217-.217H4.286v-2.57l.105-.001L.586 3.052l1.466-1.466zM19.714 14.57v2.436l-2.436-2.436h2.436zm-10.26-2.65l-.379 2.65h3.029l-2.65-2.65zM10.728 3l-.55 3.857h5.116L15.844 3h2.597l-.55 3.857H21V9.43h-3.471l-.679 4.714-2.274-2.274.354-2.44-2.795-.001L7.827 5.12 8.13 3h2.597z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcNumericalHidden;
