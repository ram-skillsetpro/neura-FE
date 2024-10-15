import React from "react";

interface Types {
  color?: string;
  width?: string;
  height?: string;
}

const WarningIcon: React.FC<Types> = ({ color = "#000000", width = "26px", height = "26px" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 26 26"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>app-icons/calendar copy</title>
      <g id="app-icons/calendar-copy" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
        <path
          d="M14.1617165,0.000733922618 C15.2003523,0.00243541611 15.8265654,0.00737560308 16.4314673,0.0197181656 L16.4867454,0.0208678177 C16.5327794,0.0218432583 16.5787588,0.0228624366 16.624857,0.0239271884 L16.6802427,0.0252268833 C16.7172193,0.0261080866 16.7543162,0.027018927 16.791622,0.0279603441 C17.9988058,0.0584238051 18.9413713,0.120003467 19.7555081,0.229461259 C21.6416719,0.483049258 22.946705,1.01996223 23.9633096,2.03661629 C24.6563928,2.72965731 25.1290666,3.56610515 25.4363875,4.61143789 C25.709376,5.53999137 25.858808,6.64394228 25.9322435,8.11765882 C25.957173,8.61794793 25.5718182,9.04372174 25.0715295,9.06865124 C24.5712408,9.09358073 24.1454674,8.70822562 24.1205379,8.2079365 C23.9891604,5.57143049 23.5961874,4.23475709 22.6806553,3.31928063 C21.9817386,2.62032997 21.0383753,2.23221414 19.5138035,2.0272409 C18.7749401,1.92790335 17.8930457,1.87028745 16.7458612,1.84133808 L16.691298,1.83998012 L16.6369518,1.83866617 L16.4920609,1.83536071 L16.2005127,1.82962854 C15.6592448,1.82014549 15.0639021,1.81612886 14.1359687,1.81467075 L13.595165,1.81411167 C13.4989757,1.81405496 13.3996192,1.81401501 13.2968862,1.81398966 L12.7031112,1.81398966 L12.3921639,1.81411925 L11.8307924,1.8147243 C10.6084067,1.81674371 9.96727897,1.82334137 9.25411783,1.84133808 C8.10693439,1.87028741 7.22504375,1.92790324 6.48618345,2.02724083 C4.96162117,2.23221373 4.01825385,2.62032987 3.31929094,3.31929815 C2.62032763,4.01825727 2.23221183,4.9616254 2.0272391,6.48618899 C1.92790159,7.22504992 1.87028581,8.10694131 1.84133651,9.25412573 C1.82333981,9.96728748 1.81674216,10.6084157 1.81472275,11.8308025 L1.8141177,12.3921744 C1.81405695,12.4923025 1.81401458,12.5958724 1.81398812,12.7031221 L1.81398812,13.2968976 L1.81411012,13.5951766 L1.8146692,14.1359808 C1.81652498,15.3169879 1.82252512,15.9592527 1.8386646,16.636966 L1.83997855,16.6913122 L1.84133651,16.7458755 C1.87028586,17.893061 1.9279017,18.7749561 2.02723917,19.5138201 C2.23221224,21.0383932 2.62032773,21.9817574 3.31930189,22.6806987 C4.01826061,23.3796771 4.96162585,23.7678003 6.48618588,23.9727771 C7.22504544,24.0721167 8.10693547,24.1297336 9.2541183,24.1586835 L9.40766693,24.162405 L9.71390516,24.1688406 C10.2796969,24.1794642 10.8892588,24.1838326 11.8695881,24.1853601 L12.4430489,24.1859321 L12.5992868,24.1860014 L13.2389557,24.1860452 L13.5569464,24.1859321 L14.1304026,24.1853601 C15.1107245,24.1838326 15.7202839,24.1794642 16.2860745,24.1688406 L16.5923122,24.162405 C16.6432836,24.1612222 16.6943845,24.1599826 16.7458607,24.1586835 C17.8930446,24.1297336 18.7749384,24.0721166 19.5138011,23.9727771 C21.0383706,23.7677999 21.9817318,23.379677 22.6806925,22.680668 C23.3796571,21.9817506 23.7677797,21.0383886 23.9727566,19.5138177 C24.072096,18.7749544 24.129713,17.8930599 24.1586629,16.745875 L24.1623844,16.5923264 L24.16882,16.2860884 C24.1794435,15.7202973 24.183812,15.1107374 24.1853395,14.1304147 L24.1859114,13.5569579 C24.1859666,13.4545984 24.1860035,13.3486833 24.1860246,13.238967 L24.1860465,13.0000111 C24.1860465,12.4991012 24.5921138,12.0930336 25.0930233,12.0930336 C25.5939327,12.0930336 26,12.4991012 26,13.0000111 L26,13.2409068 L25.9998948,13.5362472 L25.9993939,14.0734706 C25.9978355,15.1652674 25.99297,15.8096354 25.9802814,16.4314817 L25.9791318,16.4867599 C25.9789367,16.4959667 25.9787398,16.5051713 25.9785412,16.5143751 L25.9760723,16.6248716 L25.9747726,16.6802574 C25.9738914,16.717234 25.9729805,16.7543309 25.9720391,16.7916367 C25.941575,17.9988222 25.8799941,18.9413892 25.7705341,19.7555274 C25.5169408,21.6416951 24.9800164,22.9467314 23.9633513,23.963328 C22.9467118,24.9800377 21.6416766,25.5169626 19.7555106,25.7705561 C18.941373,25.8800162 17.9988069,25.9415972 16.7916224,25.9720613 C16.7543166,25.9730027 16.7172198,25.9739136 16.6802432,25.9747948 L16.6248574,25.9760945 L16.514361,25.9785634 C16.5051572,25.978762 16.4959526,25.9789588 16.4867458,25.9791539 L16.4314677,25.9803036 C15.809622,25.9929922 15.1652544,25.9978577 14.0734586,25.9994042 L13.5362356,25.9998987 C13.4408877,25.9999473 13.3425054,25.9999804 13.2408955,26 L12.7591024,26 L12.4637599,25.9998987 L11.9265326,25.9994042 C10.8347285,25.9978577 10.1903585,25.9929922 9.56851176,25.9803036 L9.51323361,25.9791539 C9.5040268,25.9789588 9.49482216,25.978762 9.48561833,25.9785634 L9.37512183,25.9760945 L9.31973599,25.9747948 C9.28275935,25.9739136 9.24566245,25.9730027 9.20835661,25.9720613 C8.00117291,25.9415972 7.05861016,25.8800163 6.24447528,25.770556 C4.35832886,25.516964 3.05329901,24.9800432 2.03664964,23.9633652 C1.01996136,22.9467246 0.483048846,21.6416904 0.229461063,19.755525 C0.120003365,18.9413875 0.0584237553,17.9988212 0.0279603203,16.7916363 C0.0270189039,16.7543305 0.0261080644,16.7172336 0.0252268617,16.6802569 L0.023927168,16.6248711 C0.0228624171,16.578773 0.0218432397,16.5327935 0.0208677999,16.4867595 L0.0197181488,16.4314814 C0.00737559679,15.8265789 0.00243541403,15.2003652 0.000733921992,14.1617286 L0.000733920891,11.8382841 C0.00243541087,10.7996398 0.00737558997,10.1734237 0.0197181455,9.56852031 L0.0208677969,9.51324213 C0.0230137651,9.4119671 0.0253714239,9.31095605 0.02796032,9.20836494 C0.0584237205,8.0011808 0.120003294,7.05861787 0.229461136,6.24448304 C0.483047447,4.35833725 1.01995591,3.05330838 2.03663213,2.03663824 C3.05330578,1.01995678 4.35833353,0.483047859 6.24447771,0.229461332 C7.05861185,0.120003396 8.00117398,0.0584237703 9.20835708,0.0279603438 C9.31094811,0.0253714455 9.41195907,0.0230137847 9.51323401,0.0208678147 L9.56851215,0.0197181623 C10.1734151,0.00737559626 10.7996306,0.00243541295 11.838274,0.000733921517 L14.1617165,0.000733922618 Z M13,11 C13.5522847,11 14,11.4029437 14,11.9 L14,19.1 C14,19.5970563 13.5522847,20 13,20 C12.4477153,20 12,19.5970563 12,19.1 L12,11.9 C12,11.4029437 12.4477153,11 13,11 Z M13,7 C13.5522847,7 14,7.44771525 14,8 C14,8.55228475 13.5522847,9 13,9 C12.4477153,9 12,8.55228475 12,8 C12,7.44771525 12.4477153,7 13,7 Z"
          id="Combined-Shape"
          fill={color}
          fillRule="nonzero"
        />
      </g>
    </svg>
  );
};

export default WarningIcon;