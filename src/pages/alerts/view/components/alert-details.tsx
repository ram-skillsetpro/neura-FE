import IconGreenTick from "assets/images/icon-tick-green.svg";
import React from "react";
import AppModal from "src/core/components/modals/app-modal";
import { formatDateWithOrdinal } from "src/core/utils/constant";
import "../../../../core/components/modals/team-user-list-model/team-user-list-modal.scss";
import { AlertsType } from "../../alerts.model";
import { CustomAlert } from "../../components/alert";
import "./alert-details.styles.scss";
interface AlertDetailsType {
  isOpen: boolean;
  onClose: () => void;
  onAfterClose: () => void;
  alert?: AlertsType;
}

const AlertDetailsModal: React.FC<AlertDetailsType> = ({
  alert,
  isOpen,
  onAfterClose,
  onClose,
}) => {
  const getCustomAlert = (alert: AlertsType) => {
    if (alert.alertPriorityLevel === 1) {
      return <CustomAlert message={alert.alertPriorityLevelName} severity={"error"} />;
    } else if (alert.alertPriorityLevel === 2) {
      return <CustomAlert message={alert.alertPriorityLevelName} severity={"warning"} />;
    } else if (alert.alertPriorityLevel === 3) {
      return <CustomAlert message={alert.alertPriorityLevelName} severity={"info"} />;
    }
  };

  const getAlertFrequency = (alert: AlertsType) => {
    switch (alert.alertFrequency) {
      case 1:
        return "Start to End Date";
      case 2:
        return "View Once";
      default:
        break;
    }
  };
  return (
    <AppModal isOpen={isOpen} onAfterClose={onAfterClose}>
      <div className="team-user-list-modal alert-details-modal">
        <div className="team-user-header">
          <div>Alert Details</div>
          <div onClick={onClose} className="close-popups"></div>
        </div>
        <div className="vertical-table">
          <div className="vertical-table-row">
            <div className="vertical-table-column">
              <div className="vertical-table-header">Title</div>
              <div className="vertical-table-cell">{alert?.alertTitle}</div>
            </div>
            <div className="vertical-table-column">
              <div className="vertical-table-header">Text</div>
              <div className="vertical-table-cell">{alert?.alertText}</div>
            </div>
            <div className="vertical-table-column">
              <div className="vertical-table-header">Medium</div>
              <div className="vertical-table-cell">{alert?.alertCommMediumName}</div>
            </div>
            <div className="vertical-table-column">
              <div className="vertical-table-header">Priority</div>
              <div className="vertical-table-cell">{alert && getCustomAlert(alert)}</div>
            </div>
            <div className="vertical-table-column">
              <div className="vertical-table-header">Frequency</div>
              <div className="vertical-table-cell">{alert && getAlertFrequency(alert)}</div>
            </div>
            <div className="vertical-table-column">
              <div className="vertical-table-header">Created On</div>
              <div className="vertical-table-cell">
                {alert?.createdOn ? formatDateWithOrdinal(new Date(alert.createdOn * 1000)) : "-"}
              </div>
            </div>
            {alert?.targetUserId && alert.targetUserId.length > 0 && (
              <div className="vertical-table-column">
                <div className="vertical-table-header">Team</div>
                <div className="vertical-table-cell team-list">
                  <div className="table">
                    <div className="table-row header">
                      <div className="table-column">Name</div>
                      <div className="table-column">Acknowledged</div>
                      <div className="table-column">Acknowledged On</div>
                    </div>
                    <div className="table-body">
                      {alert.targetUserId.map((user) => (
                        <div className="table-row" key={user.userId}>
                          <div className="table-column">
                            {user.userName} {user.userLastName}
                          </div>
                          <div className="table-column">
                            {user.ack ? <img src={IconGreenTick} width={24} height={24} /> : "-"}
                          </div>
                          <div className="table-column">
                            {user.ack ? formatDateWithOrdinal(new Date(user.ackon * 1000)) : "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default AlertDetailsModal;
