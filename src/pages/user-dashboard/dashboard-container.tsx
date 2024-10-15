import { useAppDispatch, useAppSelector } from "core/hook";
import { LS_FILES_FOLDERS_ROUTE } from "core/utils/constant";
import { FileStatusCheckPayload, FileType, FolderType } from "pages/user-dashboard/dashboard.model";
import {
  clearMyDriveState,
  dashboardReducer,
  fileStatusCheck,
  getFilePerPage,
  getFilterDataMyDrive,
  getFoldersPerPage,
  getRecentFilesList,
  renderUploadContainer,
  setRenderContainer,
} from "pages/user-dashboard/dashboard.redux";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./dashboard-container.scss";
// import NavHeader from '../../core/components/header/header'
// import SideNavbar from '../../core/components/NavBar/SideNavBar'

import { Loader } from "core/components/loader/loader.comp";
import { generateUUID } from "core/utils";
import { manageMembersReducer } from "pages/manage-members/manage-members.redux";
import {
  clearSearchFoldersFetched,
  isFolderExistOnSearch,
  teamDashboardReducer,
} from "pages/manage-team/team-files/team-files.redux";
import FolderNavigation from "pages/user-dashboard/components/file-upload/folder-navigation";
import UploadDropdown from "pages/user-dashboard/components/file-upload/upload-dropdown";
import OthersFilesView from "pages/user-dashboard/components/my-files/other-files-view";
import RecentFilesView from "pages/user-dashboard/components/my-files/recent-files-view";
import RightSectionSummary from "pages/user-dashboard/components/right-section-summary";
import UploadFolder from "pages/user-dashboard/components/upload-folder/upload-folder";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FILTER_TYPE, ROUTE_ADMIN, ROUTE_USER_DASHBOARD } from "src/const";
import FoldersTable from "src/core/components/folders-table/folders-table";
import DataFilter from "src/layouts/admin/components/data-filter/data-filter";
import {
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import SingleFileUpload from "src/pages/user-dashboard/components/file-upload/single-file-upload/single-file-upload";
import { contractReducer } from "../contract/contract.redux";
import { teamReducer } from "../manage-team/team.redux";
import CreateFolderComponent from "./components/file-upload/create-folder/create-folder";
import AddDriveFolder from "./components/file-upload/drive-folder/add-drive-folder";
import SuggestedFiles from "./components/my-files/suggested-files";

interface DashboardContainerProps {}

export interface ILocalStorageRouteData extends FolderType {
  pgn: number;
  filePgn: number;
}

const DashboardContainer: React.FC<DashboardContainerProps> = () => {
  const navigateTo = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const fileListRef = useRef<Array<FileType>>([]);
  const fileList = useAppSelector((state) => state.dashboard.fileList);
  const filesStatus = useAppSelector((state) => state.dashboard.filesStatus);
  const fileListLoading = useAppSelector((state) => state.dashboard.fileListLoading);
  const summaryAlerts = useAppSelector((state) => state.dashboard.summaryAlerts);
  const renderUpload = useAppSelector((state) => state.dashboard.createNew);
  const folderAllData = useAppSelector((state) => state.dashboard.foldersResponse || []);
  const [paginationData, setPaginationData] = useState({
    totalItems: folderAllData.totct as number,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const isFilterActive = useAppSelector((state) => state.dataFilter.isFilterActive);

  const recentFileList = useAppSelector((state) => state.dashboard.recentFilesList);
  const foldersTableRef = useRef<HTMLDivElement | null>(null);
  const othersTableRef = useRef<HTMLDivElement | null>(null);

  const { currentPage } = paginationData;

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: folderAllData.totct as number,
    });
  }, [folderAllData]);

  useEffect(() => {
    // Iterate through the filesStatus array  (2nd method => if (filesStatus[0]?.processStatus === 3) fetchData())
    filesStatus.forEach((file) => {
      if (file.processStatus === 3) {
        // const folder = getFolderFromLocalStorage();
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

  const fetchData = async (folder?: any) => {
    const flagValue = localStorage.getItem("parentSearchExist");
    const flag = flagValue ? JSON.parse(flagValue) : false;
    try {
      if (!folder) dispatch(getRecentFilesList({ dataReset: true }));
      if (!flag) {
        dispatch(getFoldersPerPage(folder?.pgn ?? 1, folder));
        dispatch(getFilePerPage(folder?.filePgn ?? 1, folder));
      }
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  const routeDataMap = useMemo(
    () => location.state?.routeDataMap ?? {},
    [location.state?.routeDataMap],
  );
  const [searchParams] = useSearchParams();

  const navValue = searchParams.get("folders") || "";

  useEffect(() => {
    if (routeDataMap[navValue]) {
      const folder = routeDataMap[navValue]
        ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
        : undefined;
      fetchData(folder);
    } else {
      fetchData();
    }
    return () => {
      dispatch(clearMyDriveState());
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
    dispatch(clearMyDriveState());

    navigateTo(`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}?folders=${uuid}`, {
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
        dispatch(clearMyDriveState());

        break;
      }
    }
    if (targetUuid) {
      delete routeDataMap[folder.uuid];
      navigateTo(`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}?folders=${targetUuid}`, {
        state: {
          ...location.state,
          routeDataMap: { ...location.state?.routeDataMap, [targetUuid]: routeDataMap[targetUuid] },
        },
      });
    } else {
      console.error("UUID not found for the given folder id");
    }
  };

  const goToMyDrive = () => {
    dispatch(clearMyDriveState());
    navigateTo(`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`, { state: {} });
  };

  const handleFilter = async () => {
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;
    dispatch(clearMyDriveState());
    await dispatch(getFilterDataMyDrive(currentPage, folder));
    dispatch(setFilterActive(true));
    dispatch(renderUploadContainer(""));
  };

  useEffect(() => {
    return () => {
      dispatch(clearMyDriveState());
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

  return (
    <>
      {fileListLoading && <Loader />}
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <div className="left-inner-sticky pb-1 max-w-full">
            {!isFilterActive && (
              <FolderNavigation label="My Drive" goBack={goToMyDrive} handleGoBack={handleGoBack} />
            )}
            <div className="filter-sec">
              {navValue === "" && (
                <DataFilter
                  filterType={[FILTER_TYPE.USER_LIST, FILTER_TYPE.CONTRACT_TYPE]}
                  handleFilter={handleFilter}
                />
              )}
              <span className="grow"></span>
              <UploadDropdown />
            </div>
          </div>
          {renderUpload === "uploadFile" && (
            <SingleFileUpload focusMove={() => handleFocus(othersTableRef)} />
          )}
          {renderUpload === "addDriveFolder" && <AddDriveFolder />}
          {renderUpload === "addFolder" && (
            <CreateFolderComponent
              routeString={LS_FILES_FOLDERS_ROUTE}
              focusMove={() => handleFocus(foldersTableRef)}
              isOpen={renderUpload === "addFolder"}
              onClose={() => dispatch(setRenderContainer(""))}
            />
          )}
          {renderUpload === "uploadFolder" && <UploadFolder />}

          {isFilterActive ? (
            <div ref={othersTableRef}>
              <OthersFilesView isFilterActive={isFilterActive} />
            </div>
          ) : recentFileList.length > 6 ? (
            <RecentFilesView />
          ) : (
            <>
              {navValue === "" && (
                <>
                  <SuggestedFiles />
                  <RecentFilesView />
                </>
              )}
              <div ref={foldersTableRef}>
                <FoldersTable addFolderToTraversePath={addFolderToTraversePath} />
              </div>
              <div ref={othersTableRef}>
                <OthersFilesView localStorageRouteData={navValue} />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="right-section hide">
        <RightSectionSummary data={summaryAlerts} />
      </div>
    </>
  );
};

export default DashboardContainer;

export const reducer = {
  dashboard: dashboardReducer,
  team: teamReducer,
  contract: contractReducer,
  manageMembers: manageMembersReducer,
  teamDashboard: teamDashboardReducer,
  dataFilter: dataFilterReducer,
};
