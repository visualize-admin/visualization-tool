import * as React from "react";

export const IconChevronDown = ({ size = 24, color = "currentColor" }) => (
         <svg
           xmlns="http://www.w3.org/2000/svg"
           width={size}
           height={size}
           viewBox="0 0 24 24"
           fill="none"
           fillRule="evenodd"
           stroke={color}
           strokeWidth="2"
           strokeLinecap="butt"
           strokeLinejoin="inherit"
         >
           <polyline points="6 9 12 15 18 9"></polyline>
         </svg>
       );