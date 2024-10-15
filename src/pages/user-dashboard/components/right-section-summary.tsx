import { NotificationCard } from "core/components/alerts/alert.component";
import { SummaryAlert } from "pages/user-dashboard/dashboard.model";
import React from "react";
import NotificationStack from "src/core/components/notification/notification-stack";

interface IRightSummary<T> {
  data: T;
}

const RightSectionSummary: React.FC<IRightSummary<SummaryAlert[]>> = ({ data }) => {
  return (
    <div className="right-section-inner">
      <div className="right-content-sec">
        <NotificationStack />
        {data.length > 0 &&
          data.map((alert, index) => <NotificationCard item={alert} key={index} />)}
      </div>
    </div>
  );
};

export default RightSectionSummary;
