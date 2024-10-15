import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { USER_AUTHORITY } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import { useAppSelector } from "src/core/hook";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import "./alerts-view.styles.scss";
import AlertsCreatedByMe from "./components/alerts-created-by-me";
import AlertsCreatedForMe from "./components/alerts-created-for-me";

function AlertView() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const alertsAuthCheck = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.ALERT,
  ]);
  const tabs = [
    { title: "ALERTS FOR ME", content: <AlertsCreatedForMe />, isVisible: true },
    { title: "ALERTS BY ME", content: <AlertsCreatedByMe />, isVisible: alertsAuthCheck },
  ];

  const handleClick = (index: number) => setActiveTab(index);
  const isLoading = useAppSelector((state) => state.alerts.isLoading);

  useEffect(() => {
    setActiveTab(activeTab);
  }, [alertsAuthCheck]);

  return (
    <div className="dashboard-viewer">
      {isLoading && <Loader />}

      <div className="dashboard-viewer-wrapper">
        <div className="files-container">
          <div className="scroller">
            <div className="files-container-list">
              <div className="wrapper nobg">
                <div className="alert-btn-container">
                  <a className="button button-red" onClick={() => navigate("/admin/alerts-create")}>
                    Create Alert
                  </a>
                </div>
                <div className="tab-header horizontal">
                  {tabs.map((tab, index) =>
                    tab.isVisible ? (
                      <div
                        key={index}
                        className={`tab-item ${index === activeTab ? "active" : ""}`}
                        onClick={() => handleClick(index)}
                      >
                        {tab.title}
                      </div>
                    ) : null,
                  )}
                </div>
                <div className="tab-content">{tabs[activeTab].content}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertView;
