import * as React from "react";
function SvgIcCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.793 16.453a.924.924 0 111.027 1.536.924.924 0 01-1.027-1.536zm.39.643a.174.174 0 00-.052.122c0 .19.348.192.348 0a.174.174 0 00-.297-.122zM15.957 16.453a.924.924 0 111.027 1.536.924.924 0 01-1.027-1.536zm.389.642a.174.174 0 00-.051.123c0 .19.348.193.348 0a.174.174 0 00-.297-.123zM16.65 13.463a.376.376 0 01-.18.046H7.738v1.822h10.66v.75H7.363a.376.376 0 01-.375-.375V5.75H4V5h3.363a.375.375 0 01.375.375v2.197h12.094a.375.375 0 01.314.58l-3.361 5.186a.375.375 0 01-.136.125zm-.387-.706l2.875-4.437H7.734v4.437h8.53z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcCart;
