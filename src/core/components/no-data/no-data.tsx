import React from "react";
import { useNavigate } from "react-router";
import { ROUTE_ADMIN, ROUTE_USER_DASHBOARD } from "src/const";
import { noDataPageConfigs } from "src/core/utils/constant";
import "./empty-state.scss";
interface INoDataPage {
  pathname?: string;
  hideIcon?: boolean;
}

const NoDataPage: React.FC<INoDataPage> = ({ pathname, hideIcon = false }) => {
  const currentConfig = noDataPageConfigs.find((config) => config.pathname === pathname);
  const navigate = useNavigate();
  const config = currentConfig || {
    title: "No Data Available",
    text: "This can happen when a user has not entered any data.",
    icon: "",
  };
  return (
    <div className="empty-state">
      <div className="empty-info font-bold">
        {!hideIcon && (
          <div className="file-img mb-2">
            <img src={config.icon} />
          </div>
        )}
        {config.title}
        <br />
        {config.text}
        {!hideIcon && (
          <a
            onClick={() => navigate(`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`)}
            className="flex m-auto w-26"
          >
            <i className="icon-emty"></i>
          </a>
        )}
      </div>
    </div>
  );
};

export default NoDataPage;
