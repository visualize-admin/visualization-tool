import * as React from "react";
function SvgIcLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      width="1em"
      height="1em"
      {...props}
    >
      <g clipPath="url(#ic_link_svg__clip0_7257_42128)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.271 9.443l.643.643c2.118 2.118 2.172 5.394.163 7.571l-.163.17-2.545 2.545c-2.174 2.173-5.567 2.173-7.74 0-2.118-2.117-2.173-5.394-.151-7.583l.164-.17L6.57 9.807l1.26 1.312-2.916 2.798c-1.463 1.464-1.463 3.706 0 5.17 1.414 1.414 3.557 1.461 5.02.14l.149-.14 2.546-2.546c1.414-1.415 1.461-3.557.141-5.02l-.141-.15-.643-.642 1.285-1.286zm-3.185-3.268l2.546-2.545c2.173-2.173 5.567-2.173 7.74 0 2.117 2.117 2.172 5.394.15 7.583l-.163.17-2.929 2.812-1.26-1.312 2.916-2.798c1.463-1.464 1.463-3.706 0-5.17-1.414-1.414-3.557-1.461-5.02-.14l-.149.14-2.545 2.546c-1.415 1.415-1.462 3.557-.142 5.02l.142.15.643.642-1.286 1.286-.643-.643c-2.117-2.118-2.172-5.394-.163-7.571l.163-.17 2.546-2.545-2.546 2.545z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="ic_link_svg__clip0_7257_42128">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
export default SvgIcLink;
