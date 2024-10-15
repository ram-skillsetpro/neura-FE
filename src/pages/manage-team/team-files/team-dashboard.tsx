import { Loader } from "core/components/loader/loader.comp";
import { useAppDispatch, useAppSelector } from "core/hook";
import { LS_TEAM, LS_TEAM_FILES_FOLDERS_ROUTE } from "core/utils/constant";
import useLocalStorage from "core/utils/use-local-storage";
import OtherTeamFilesView from "pages/manage-team/team-files/components/team-files";
import TeamFoldersView from "pages/manage-team/team-files/components/team-folders";
import {
  clearSearchFoldersFetched,
  clearTeamDriveState,
  clearTeamFiles,
  fileStatusCheck,
  getFilterDataTeamDrive,
  getTeamFilesPerPage,
  getTeamFoldersPerPage,
  isFolderExistOnSearch,
  teamDashboardReducer,
} from "pages/manage-team/team-files/team-files.redux";
import { TeamListType } from "pages/manage-team/team.model";
import CreateFolderComponent from "pages/user-dashboard/components/file-upload/create-folder/create-folder";
import FolderNavigation from "pages/user-dashboard/components/file-upload/folder-navigation";
import UploadFolder from "pages/user-dashboard/components/upload-folder/upload-folder";
import { FileStatusCheckPayload, FileType, FolderType } from "pages/user-dashboard/dashboard.model";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FILTER_TYPE, ROUTE_ADMIN, ROUTE_TEAMS_DRIVE, ROUTE_TEAM_FILES } from "src/const";
import NotificationStack from "src/core/components/notification/notification-stack";
import { generateUUID } from "src/core/utils";
import DataFilter from "src/layouts/admin/components/data-filter/data-filter";
import {
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import { contractReducer } from "src/pages/contract/contract.redux";
import AddDriveFolder from "src/pages/user-dashboard/components/file-upload/drive-folder/add-drive-folder";
import SingleFileUpload from "src/pages/user-dashboard/components/file-upload/single-file-upload/single-file-upload";
import UploadDropdown from "src/pages/user-dashboard/components/file-upload/upload-dropdown";
import { dashboardReducer, setRenderContainer } from "src/pages/user-dashboard/dashboard.redux";
import { teamReducer } from "../team.redux";
import "./team-dashboard.style.scss";
interface TeamDashboardType {}
const TeamDashboard: React.FC<TeamDashboardType> = () => {
  const dispatch = useAppDispatch();
  const navigateTo = useNavigate();
  // const [folder, setFolder] = useState<FolderType>();
  const foldersTableRef = useRef<HTMLDivElement | null>(null);
  const othersTableRef = useRef<HTMLDivElement | null>(null);
  const teamTableRef = useRef<HTMLDivElement | null>(null);

  const renderUpload = useAppSelector((state) => state.dashboard.createNew);
  const isLoading = useAppSelector((state) => state.teamDashboard.isLoading);
  const fileListLoading = useAppSelector((state) => state.dashboard.fileListLoading);
  const routeDataString = localStorage.getItem(LS_TEAM_FILES_FOLDERS_ROUTE);
  const [teamData] = useLocalStorage<TeamListType>(LS_TEAM);
  const fileListRef = useRef<Array<FileType>>([]);
  const filesStatus = useAppSelector((state) => state.teamDashboard.filesStatus);
  const fileList = useAppSelector((state) => state.teamDashboard.fileList);
  const folders = useAppSelector((state) => state.teamDashboard.folders);
  const [paginationData, setPaginationData] = useState({
    totalItems: folders.totct as number,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const isFilterActive = useAppSelector((state) => state.dataFilter.isFilterActive);

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: folders.totct as number,
    });
  }, [folders]);

  const { currentPage } = paginationData;

  const fetchData = async (folder?: any) => {
    const flagValue = localStorage.getItem("parentSearchExist");
    const flag = flagValue ? JSON.parse(flagValue) : false;
    try {
      if (!flag) {
        dispatch(getTeamFoldersPerPage(teamData?.id, folder?.pgn ?? 1, folder));
        dispatch(getTeamFilesPerPage(teamData?.id, folder?.filePgn ?? 1, folder));
      }
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  const location = useLocation();
  const routeDataMap = useMemo(
    () => location.state?.routeDataMap ?? {},
    [location.state?.routeDataMap],
  );
  const [searchParams] = useSearchParams();

  const navValue = searchParams.get("folders") || "";

  useEffect(() => {
    if (location.pathname.includes(ROUTE_TEAM_FILES)) {
      const folder = routeDataMap[navValue]?.[routeDataMap[navValue].length - 1];
      fetchData(folder);
    }

    return () => {
      dispatch(clearTeamDriveState());
      dispatch(clearSearchFoldersFetched());
    };
  }, [navValue]);
  const addFolderToTraversePath = async (folder: FolderType, clearPath: boolean) => {
    let newPath: any;
    if (clearPath) {
      newPath = [folder];
    } else if (navValue) {
      newPath = [...routeDataMap[navValue], { ...folder }];
    } else {
      newPath = [folder];
    }
    const uuid = generateUUID(newPath);
    dispatch(clearTeamDriveState());

    navigateTo(`/${ROUTE_ADMIN}/${ROUTE_TEAM_FILES}?folders=${uuid}`, {
      state: {
        ...location.state,
        routeDataMap: { ...location.state?.routeDataMap, [uuid]: newPath },
      },
    });
    return newPath;
  };
  const handleGoBack = (folder: any) => {
    const currentPath = routeDataMap[navValue];
    if (currentPath && currentPath[currentPath.length - 1].id === folder.id) {
      return;
    }
    let targetUuid = null;
    for (const [uuid, folders] of Object.entries(routeDataMap)) {
      if (Array.isArray(folders) && folders[folders.length - 1].id === folder.id) {
        targetUuid = uuid;
        break;
      }
    }
    if (targetUuid) {
      delete routeDataMap[folder.uuid];
      navigateTo(`/${ROUTE_ADMIN}/${ROUTE_TEAM_FILES}?folders=${targetUuid}`, {
        state: {
          ...location.state,
          routeDataMap: { ...location.state?.routeDataMap, [targetUuid]: routeDataMap[targetUuid] },
        },
      });
      dispatch(clearTeamDriveState());
    } else {
      console.error("UUID not found for the given folder id");
    }
  };

  const goBack = () => {
    dispatch(clearTeamDriveState());
    localStorage.removeItem(LS_TEAM);
    navigateTo(`/${ROUTE_ADMIN}/${ROUTE_TEAMS_DRIVE}`, { state: {}, replace: true });
  };

  useEffect(() => {
    filesStatus.forEach((file) => {
      if (file.processStatus === 3) {
        const folder = routeDataMap[navValue]
          ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
          : undefined;
        fetchData(folder);
      }
    });
    const intervalFileStatusUpdate = setInterval(fetchAndUpdateFileStatus, 10000);
    return () => clearInterval(intervalFileStatusUpdate);
  }, [filesStatus]);

  const fetchAndUpdateFileStatus = useCallback(async () => {
    try {
      if (fileListRef.current.length === 0) {
        return;
      }
      const fileIdList = fileListRef.current
        .filter((file) => file.processStatus === 1 || file.processStatus === 2)
        .map((file) => file.id);
      if (fileIdList.length === 0) {
        return;
      }
      const fileObj = fileListRef.current.find((file) => file?.folderId || file?.teamId);
      const data: FileStatusCheckPayload = {
        fileIdList,
        folderId: fileObj?.folderId || null,
        status: 1,
        teamId: fileObj?.teamId || null,
      };
      await dispatch(fileStatusCheck(data));
      const updatedFileList = fileListRef.current.map((fileItem) => {
        const updatedFile = filesStatus.find((updatedFile) => updatedFile.id === fileItem.id);
        return updatedFile && updatedFile.processStatus === 3
          ? { ...fileItem, processStatus: 3 }
          : fileItem;
      });
      fileListRef.current = updatedFileList;
    } catch (error) {
      console.error("Error while fetching file status:", error);
    }
  }, []);

  useEffect(() => {
    if (fileList !== fileListRef.current) {
      fileListRef.current = fileList;
    }
  }, [fileList]);
  const handleFilter = async () => {
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;
    dispatch(clearTeamFiles());
    const payload = {
      currentPage,
      folder,
      team: teamData,
    };
    await dispatch(getFilterDataTeamDrive(payload));
    dispatch(setFilterActive(true));
    dispatch(setRenderContainer(""));
  };

  useEffect(() => {
    return () => {
      dispatch(clearTeamDriveState());
      dispatch(clearSearchFoldersFetched());
      dispatch(isFolderExistOnSearch(false));
    };
  }, []);

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

  return (
    <>
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <div className="left-inner-sticky pb-1 max-w-full">
            <FolderNavigation
              label={teamData?.teamName}
              handleGoBack={handleGoBack}
              goBack={goBack}
            />
            <div className="filter-sec">
              {!routeDataString && (
                <DataFilter
                  handleFilter={handleFilter}
                  filterType={[FILTER_TYPE.USER_LIST, FILTER_TYPE.CONTRACT_TYPE]}
                />
              )}
              <span className="grow"></span>
              <UploadDropdown teamCreated={() => teamCreate()} />
            </div>
          </div>
          {renderUpload === "uploadFile" && (
            <SingleFileUpload focusMove={() => handleFocus(othersTableRef)} />
          )}
          {renderUpload === "addDriveFolder" && <AddDriveFolder />}
          {renderUpload === "addFolder" && (
            <CreateFolderComponent
              routeString={LS_TEAM_FILES_FOLDERS_ROUTE}
              focusMove={() => handleFocus(foldersTableRef)}
              isOpen={renderUpload === "addFolder"}
              onClose={() => dispatch(setRenderContainer(""))}
            />
          )}
          {renderUpload === "uploadFolder" && <UploadFolder />}
          {/* <UploadingFilesView store="teamDashboard" /> */}
          {/* <div ref={foldersTableRef}>
            <TeamFoldersView addFolderToTraversePath={addFolderToTraversePath} />
          </div>
          <div ref={othersTableRef}>
            <OtherTeamFilesView />
          </div> */}
          {isFilterActive ? (
            <div ref={othersTableRef}>
              <OtherTeamFilesView isFilterActive={isFilterActive} />
            </div>
          ) : (
            <>
              <div ref={foldersTableRef}>
                <TeamFoldersView addFolderToTraversePath={addFolderToTraversePath} />
              </div>
              <div ref={othersTableRef}>
                <OtherTeamFilesView localStorageRouteData={navValue} />
              </div>
            </>
          )}
        </div>
        {(isLoading || fileListLoading) && <Loader />}
      </div>
      <div className="right-section hide">
        <div className="right-section-inner">
          <div className="right-content-sec hide">
            <NotificationStack />
          </div>
        </div>
        {/* {summaryAlerts.length > 0 && <RightSectionSummary data={summaryAlerts} />} */}
      </div>
    </>
  );
};

export default TeamDashboard;

export const reducer = {
  teamDashboard: teamDashboardReducer,
  dashboard: dashboardReducer,
  team: teamReducer,
  contract: contractReducer,
  dataFilter: dataFilterReducer,
};
