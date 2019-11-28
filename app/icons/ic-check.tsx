import * as React from "react";

export const IconCheck = ({ size = 24, color = "currentColor" }) => (
         <svg
           xmlns="http://www.w3.org/2000/svg"
           width={size}
           height={size}
           viewBox="0 0 24 24"
           fill={color}
           fillRule="evenodd"
           stroke="none"
           strokeWidth="1"
           strokeLinecap="round"
           strokeLinejoin="round"
         >
           <path transform="translate(2 5)" d="M8 12.5L2.5 7 4 5.5 8 9.5 16 1.5 17.5 3z"/>
         </svg>
       );