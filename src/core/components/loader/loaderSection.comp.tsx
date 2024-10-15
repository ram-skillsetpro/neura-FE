import React from "react";
import "./section-loader.scss";

interface LoaderSectionType {
  loaderLabel?: string;
}

export const LoaderSection: React.FC<LoaderSectionType> = ({ loaderLabel = "Loading" }) => {
  return (
    <div className="loader-wrap">
      <div className="loader-section">
        <div className="loader-sec"></div>
        <div className="loading font-bold mt-3">
          {loaderLabel}
          <span className="dotDark-one"> .</span>
          <span className="dotDark-two"> .</span>
          <span className="dotDark-three"> .</span>
        </div>
      </div>
    </div>
  );
};
