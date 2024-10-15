import React from "react";
import { useNavigate } from "react-router";
import { ROUTE_ADMIN, ROUTE_TEAMS_DRIVE, ROUTE_TEAM_FILES, ROUTE_USER_DASHBOARD } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { LS_FILES_FOLDERS_ROUTE, LS_TEAM, LS_TEAM_FILES_FOLDERS_ROUTE } from "src/core/utils/constant";
import { alertsOpen } from "../alerts/alerts.redux";
import { TeamListType } from "../manage-team/team.model";
import { FolderType } from "../user-dashboard/dashboard.model";

const NotificationsTeamsFolder: React.FC = () => {
  const dispatch = useAppDispatch();
  const { teamList = [] } = useAppSelector((state) => state.team);
  const navigate = useNavigate();
  const foldersList = useAppSelector((state) => state.dashboard.folderList);
  const alertsForMe = useAppSelector((state) => state.alerts.forMe);

  const toggleAlertsPopup = async () => {
    dispatch(alertsOpen());
  };

  const handleFolderClick = (folder: FolderType) => {
    localStorage.setItem(LS_FILES_FOLDERS_ROUTE, JSON.stringify([folder]));
    navigate(`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`);

  };

  const handleItemClicked = (team: TeamListType) => {
    if (team.id) {
      localStorage.removeItem(LS_TEAM_FILES_FOLDERS_ROUTE);
      localStorage.setItem(LS_TEAM, JSON.stringify(team));
    }
    navigate(`/${ROUTE_ADMIN}/${ROUTE_TEAM_FILES}`, { state: { team } });
  };
  return (
    <section className="relative mb-3">
      <div className="dash-team-row">
        <div className="col-50">
          <div className="team-alert-sec">
            <div className="team-alert-col">
              <div className="alert-inner-card rounded-6 h-full">
                <div>
                  <div className="font-semibold fs14 mb-3">Notifications</div>
                  <div className="card-info-numb">
                    {alertsForMe?.totct > 0 ? alertsForMe.totct + " Alert" : "No Alert"}
                  </div>
                </div>
                <div>
                  <button className="view-all-btn specific-component" onClick={toggleAlertsPopup}>
                    All Alerts
                  </button>
                </div>
              </div>
            </div>
            <div className="team-alert-col">
              <div className="ta-inner-card rounded-6 h-full">
                <div className="font-semibold fs14 mb-3">Teams</div>
                <div className="dash-team">
                  {teamList.length > 0 &&
                    teamList.slice(0, 3).map((team, index) => (
                      <div
                        key={team.id}
                        onClick={() => handleItemClicked(team)}
                        className="team-info-row cursor-pointer"
                        style={{ width: index === 0 ? "70%" : index === 1 ? "70%" : "40%" }}
                      >
                        <span>{team.teamName}</span>
                        <span className="grow"></span>
                      </div>
                    ))}
                </div>
                <div>
                  <button className="view-all-btn" onClick={() => navigate(`/${ROUTE_ADMIN}/${ROUTE_TEAMS_DRIVE}`)}>All Teams</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-50">
          <div className="dash-team-inner-card w-full h-full">
            <div>
              <div className="font-semibold fs14 mb-3">Folders</div>
              <div className="folder-chips-sec">
                {foldersList.slice(0, 5).map((folder) => (
                  <div
                    className="folder-chips cursor-pointer"
                    onClick={() => handleFolderClick(folder)}
                    key={folder.id}
                  >
                    <button key={folder.id} className="plush-btn">
                      +
                    </button>
                    {folder.folderName}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <button className="view-all-btn" onClick={() => navigate(`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`)}>All Folders</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationsTeamsFolder;
