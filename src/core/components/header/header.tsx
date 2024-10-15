import React from "react";
import userImageIcon from "../../../assets/images/harry.jpg";

const NavHeader: React.FC = () => {
  return (
    <div className="navigation">
      <div className="navigation-logo">
        <a className="logo">&nbsp;</a>
      </div>
      <div className="navigation-search">
        <form>
          <input
            tabIndex={1}
            type="search"
            value=""
            placeholder="Search for anything and we will figure it out"
          />
        </form>
      </div>
      <div className="navigation-alerts">
        <a className="icon bell active">&nbsp;</a>
      </div>
      <div className="navigation-user">
        <a className="icon user">
          <img src={userImageIcon} alt="User" />
        </a>
      </div>
    </div>
  );
};

export default NavHeader;
