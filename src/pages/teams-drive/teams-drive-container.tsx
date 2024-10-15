import NotificationStack from "core/components/notification/notification-stack";
import { useAppDispatch } from "core/hook";
import { LS_TEAM, LS_TEAM_FILES_FOLDERS_ROUTE } from "core/utils/constant";
import { manageMembersReducer } from "pages/manage-members/manage-members.redux";
import {
  clearTeamDriveState
} from "pages/manage-team/team-files/team-files.redux";
import { teamReducer } from "pages/manage-team/team.redux";
import { TeamsDriveSharedTeamsList } from "pages/teams-drive/teams-drive-shared-teams-list.component";
import { TeamsFoldersList } from "pages/teams-drive/teams-folder.component";
import FolderNavigation from "pages/user-dashboard/components/file-upload/folder-navigation";
import UploadDropdown from "pages/user-dashboard/components/file-upload/upload-dropdown";
import { dashboardReducer } from "pages/user-dashboard/dashboard.redux";
import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_TEAMS_DRIVE, USER_AUTHORITY } from "src/const";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import "./teams-drive-container.scss";
const TeamsDrive = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const [traversePath, setTraversePath] = useState<Array<FolderType>>([]);
  const teamTableRef = useRef<HTMLDivElement | null>(null);
  const createTeamAuthority = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_ADMIN,
  ]);
  const routeDataString = localStorage.getItem(LS_TEAM_FILES_FOLDERS_ROUTE);
  // const [teamData] = useLocalStorage<TeamListType>(LS_TEAM);

  // const fetchData = async (folder?: FolderType) => {
  //   if (teamData) {
  //     try {
  //       await dispatch(getTeamFilesFoldersList(teamData?.id, folder));
  //       await dispatch(getTeamFilesPerPage(teamData?.id, 1, folder));
  //     } catch (error) {
  //       console.error("Error while fetching data:", error);
  //     }
  //   }
  // };
  const goBack = () => {
    dispatch(clearTeamDriveState());
    localStorage.removeItem(LS_TEAM);
    navigate(`/${ROUTE_ADMIN}/${ROUTE_TEAMS_DRIVE}`, { state: {} });
    // fetchData();
  };
  const handleGoBack = (id: number) => {
    const routeData = [...JSON.parse(routeDataString || "")];
    const index = routeData.findIndex((i) => i.id === id);
    const newPath = routeData.slice(0, index + 1);
    localStorage.setItem(LS_TEAM_FILES_FOLDERS_ROUTE, JSON.stringify(newPath));
    // setTraversePath(newPath);
  };
  const handleFocus = useCallback((targetRef: React.RefObject<HTMLDivElement>) => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth", // or "auto" for instant scrolling
        block: "start", // or "end" to align the bottom of the element with the bottom of the visible area
      });
    }
  }, []);

  const teamCreate = () => {
    handleFocus(teamTableRef);
  };

  useEffect(() => {
    localStorage.removeItem(LS_TEAM_FILES_FOLDERS_ROUTE);
    return () => {
      localStorage.removeItem(LS_TEAM_FILES_FOLDERS_ROUTE);
    };
  }, []);
  return (
    <>
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <div className="left-inner-sticky pb-1 max-w-full">
            <FolderNavigation label="Teams Drive" goBack={goBack} handleGoBack={handleGoBack} />
            <div className="filter-sec">
              <span className="grow"></span>
              {createTeamAuthority && <UploadDropdown teamCreated={() => teamCreate()} />}
            </div>
          </div>

          {/* <TeamList /> */}
          <TeamsFoldersList />
          <TeamsDriveSharedTeamsList />
        </div>
      </div>
      <div className="right-section hide">
        <div className="right-section-inner">
          <div className="right-content-sec">
            <NotificationStack />
          </div>
        </div>
        {/* {summaryAlerts.length > 0 && <RightSectionSummary data={summaryAlerts} />} */}
      </div>
    </>
  );
};

export default TeamsDrive;

export const reducer = {
  dashboard: dashboardReducer,
  team: teamReducer,
  // contract: contractReducer,
  manageMembers: manageMembersReducer,
};
