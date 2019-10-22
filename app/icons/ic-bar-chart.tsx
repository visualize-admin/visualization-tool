import * as React from "react";

export const IconBarChart = ({ size = 48, color = "currentColor" }) => (
         <svg
           xmlns="http://www.w3.org/2000/svg"
           width={size}
           height={size}
           viewBox="0 0 48 48"
           fill={color}
           fillRule="evenodd"
           stroke="none"
         >
           <g transform="translate(2.000000, 2.000000)">
             {/* <g opacity="1.0">
               <rect x="0" y="0" width="2" height="44"></rect>
             </g> */}
             <path d="M24,33 L24,41 L4,41 L4,33 L24,33 Z M38,23 L38,31 L4,31 L4,23 L38,23 Z M30,13 L30,21 L4,21 L4,13 L30,13 Z M18,3 L18,11 L4,11 L4,3 L18,3 Z"></path>
           </g>
         </svg>
       );