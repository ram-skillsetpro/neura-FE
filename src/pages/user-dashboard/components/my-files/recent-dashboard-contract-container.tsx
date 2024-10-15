import { useAppDispatch, useAppSelector } from "core/hook";
import { contractReducer } from "pages/contract/contract.redux";
import RecentContract from "pages/user-dashboard/components/my-files/recent-dashboard-contract";
import {
  clearMyDriveState,
  dashboardReducer,
  getRecentDashboardFilesList,
} from "pages/user-dashboard/dashboard.redux";
import React, { useEffect } from "react";
import { Loader } from "src/core/components/loader/loader.comp";
import NotificationStack from "src/core/components/notification/notification-stack";
import { dataFilterReducer } from "src/layouts/admin/components/data-filter/data-filter.redux";
import { manageMembersReducer } from "src/pages/manage-members/manage-members.redux";
import { teamDashboardReducer } from "src/pages/manage-team/team-files/team-files.redux";
import { teamReducer } from "src/pages/manage-team/team.redux";
import "src/pages/playbook/playbook-container.scss";
import { EmptyComponent } from "../../empty-component/empty-component";

interface Props {}

const PlaybookContainer: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const recentFileList = useAppSelector((state) => state.dashboard.recentFilesList);
  const isLoading = useAppSelector((state) => state.dashboard.isRecentFilesLoading);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getRecentDashboardFilesList({ pgn: 1 }));
    };
    fetchData();
    return () => {
      dispatch(clearMyDriveState());
    };
  }, []);

  return (
    <>
      {isLoading && <Loader />}
      <div className="left-section">
        <div className="left-section-inner">
          <div className="left-inner-sticky pb-1">
            {recentFileList.length > 0 ? (
              <>
                <RecentContract />
              </>
            ) : (
              <EmptyComponent text="Recent Contract" messageOne={"No data"} />
            )}
          </div>
        </div>
      </div>
      <div className="right-section">
        <NotificationStack />
      </div>
    </>
  );
};

export default PlaybookContainer;

export const reducer = {
  dashboard: dashboardReducer,
  contract: contractReducer,
  team: teamReducer,
  manageMembers: manageMembersReducer,
  teamDashboard: teamDashboardReducer,
  dataFilter: dataFilterReducer,
};
