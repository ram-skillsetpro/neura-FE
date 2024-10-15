import { getSummaryAlertColor } from "core/utils";
import { SummaryAlert } from "pages/user-dashboard/dashboard.model";
import React from "react";

interface INotificationCard<T> {
  item: T;
}

export const NotificationCard: React.FC<INotificationCard<SummaryAlert>> = ({ item }) => {
  return (
    <div className="bg-light1 p-3 rounded-6 mb-4 text-defaul-color">
      <a href="#" className="text-defaul-color forward-arrow">
        <div className="fs11 font-bold mb-1">
          <span className={`${getSummaryAlertColor(item.status)} mr-2-5 inline-block`}></span>
          {item.title}
        </div>
        <div className="body-text">
          <p>{item.text}</p>
        </div>
      </a>
    </div>
  );
};
