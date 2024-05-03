import React from "react";

function SvgIcGeographical(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <g>
          <path
            fill="currentColor"
            d="M12,6 C14.7614237,6 17,8.19787482 17,10.9090908 C17,14.7272727 12,18 12,18 L11.9712483,17.9808455 C11.5654321,17.7080135 7,14.5575757 7,10.9090908 C7,8.19787482 9.23857628,6 12,6 Z M12,9.2727272 C11.0795254,9.2727272 10.3333333,10.0053522 10.3333333,10.9090908 C10.3333333,11.8128295 11.0795254,12.5454545 12,12.5454545 C12.9204746,12.5454545 13.6666667,11.8128295 13.6666667,10.9090908 C13.6666667,10.0053522 12.9204746,9.2727272 12,9.2727272 Z"
          />
        </g>
      </g>
    </svg>
  );
}

export default SvgIcGeographical;
