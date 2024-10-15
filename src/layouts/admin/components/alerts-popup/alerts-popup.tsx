import { useAppDispatch, useAppSelector } from "core/hook";
import { clearBellIconAlerts, getAlertsForMe } from "pages/alerts/alerts.redux";
import React, { useEffect, useMemo, useState } from "react";
import "./alerts-popup.scss";

interface AlertsPopupType {
  handleOpen: (flag: boolean) => void;
}

export const AlertsPopup: React.FC<AlertsPopupType> = ({ handleOpen }) => {
  const dispatch = useAppDispatch();
  const alertsUnread = useAppSelector((state) => state.alerts.unreadBellIcon || []);
  const alertsForMe = useAppSelector((state) => state.alerts.forMe);
  const isLoading = useAppSelector((state) => state.alerts.isLoading);
  const [paginationData, setPaginationData] = useState({
    totalItems: 10,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const { currentPage } = paginationData;

  const handleLoadMore = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    e.stopPropagation();
    setPaginationData((prevState) => ({
      ...prevState,
      currentPage: currentPage + 1,
    }));
  };

  const totalPages = useMemo(() => {
    const totct = parseFloat(String(alertsForMe.totct!)) || 0;
    const perpg = parseFloat(String(alertsForMe.perpg!)) || 1;
    return Math.ceil(totct / perpg);
  }, [alertsForMe.totct, alertsForMe.perpg]);

  useEffect(() => {
    fetchAlertsForMe(currentPage);
  }, [currentPage]);

  useEffect(() => {
    dispatch(clearBellIconAlerts());
    return () => {
      dispatch(clearBellIconAlerts());
    };
  }, []);

  const fetchAlertsForMe = (pgn: number) => {
    dispatch(getAlertsForMe(pgn));
  };

  return (
    <>
      <div className="menu-card rounded-6 alert-menu-card">
        <ul>
          {alertsUnread.length > 0
            ? alertsUnread?.map((alert) => {
                if (alert.alertPriorityLevel === 1) {
                  return (
                    <li key={alert.id} onClick={(e) => e.stopPropagation()}>
                      <a href="#" className="forward-arrow">
                        {alert.alertTitle}
                      </a>
                    </li>
                  );
                } else if (alert.alertPriorityLevel === 2) {
                  return (
                    <li key={alert.id} onClick={(e) => e.stopPropagation()}>
                      <a href="#" className="forward-arrow">
                        {alert.alertTitle}
                      </a>
                    </li>
                  );
                } else if (alert.alertPriorityLevel === 3) {
                  return (
                    <li key={alert.id} onClick={(e) => e.stopPropagation()}>
                      <a href="#" className="forward-arrow">
                        {alert.alertTitle}
                        {/* <CustomAlert message={alert.alertTitle} severity={"info"} /> */}
                      </a>
                    </li>
                  );
                }
                return null;
              })
            : !isLoading && (
                <li>
                  <strong>It looks like everything&apos;s running smoothly</strong> - no
                  notifications to worry about!
                </li>
              )}

          {isLoading ? (
            <div className="flex justify-center mt-3">
              <div className="simpleO-loader"></div>
            </div>
          ) : alertsForMe.pgn < totalPages ? (
            <li onClick={handleLoadMore}>
              <span>Load Next</span>
            </li>
          ) : null}

          {/* <li>
            <Link
              onClick={() => handleOpen(false)}
              to={ROUTE_ALERTS_VIEW}
              style={{ width: "100%" }}
            >
              <span>View All</span>
            </Link>
          </li> */}
        </ul>
      </div>
    </>
  );
};
