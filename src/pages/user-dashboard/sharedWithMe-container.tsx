import forwordIcon from "assets/images/forward-icon.svg";
import IconFile from "assets/images/icon-pdf.svg";
import "pages/contract-data-list/contract-data-list.styles.scss";
import SharedFilesView from "pages/user-dashboard/components/my-files/file-shared-withMe";
import {
  clearReduxStateSharedWithMe,
  dashboardReducer,
  getFilterSharedWithMeFile,
  getSharedWithMeFile,
  getTopTwoSharedUsers,
} from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FILTER_TYPE } from "src/const";
import NoDataPage from "src/core/components/no-data/no-data";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { encodeFileKey } from "src/core/utils";
import DataFilter from "src/layouts/admin/components/data-filter/data-filter";
import {
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import { contractReducer, handleFileToOpen } from "../contract/contract.redux";
import SharedTeamList from "../manage-team/shared-teams/shared-team-list";
import { teamReducer } from "../manage-team/team.redux";
import "./dashboard-container.scss";
import { MySharedFileWithName } from "./dashboard.model";

interface SharedWithMeContainer {}

const SharedWithMeContainer: React.FC<SharedWithMeContainer> = () => {
  const monthIds = ["curr", "prev", "prev2"];
  const fileName = ["THIS MONTH", "LAST MONTH", "EARLIER THIS YEAR"];
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isLoading = useAppSelector((state) => state.dashboard.isLoading);
  const isFilterActive = useAppSelector((state) => state.dataFilter.isFilterActive);
  const { sharedTeamList: teamList = [] } = useAppSelector((state) => state.team);

  const [noList, setNoList] = useState<boolean>();

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getTopTwoSharedUsers());
      for (const monthId of monthIds) {
        await dispatch(getSharedWithMeFile(1, monthId));
      }
    };

    fetchData();

    return () => {
      dispatch(clearReduxStateSharedWithMe());
    };
  }, []);

  const SharedWithMeList = useAppSelector((state) => state.dashboard.TopSharedFileUsers);

  useEffect(() => {
    setNoList((SharedWithMeList as any).length === 0 && teamList.length === 0);
  }, [SharedWithMeList, teamList]);

  const handleFilter = async () => {
    await dispatch(clearReduxStateSharedWithMe());
    await dispatch(getFilterSharedWithMeFile(1));
    dispatch(setFilterActive(true));
  };

  return (
    <>
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <div className="left-inner-sticky pb-1">
            <div className="filter-sec">
              <DataFilter
                handleFilter={handleFilter}
                filterType={[FILTER_TYPE.USER_LIST, FILTER_TYPE.CONTRACT_TYPE]}
              />
              <span className="grow"></span>
            </div>
          </div>
          {isFilterActive ? (
            <SharedFilesView
              key={"curr"}
              monthId={"curr"}
              fileName={""}
              isFilterActive={isFilterActive}
            />
          ) : (
            <>
              {Array.isArray(SharedWithMeList) && SharedWithMeList.length > 0 ? (
                <section className="mb-5">
                  <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
                    Recent and Suggested
                  </h2>
                  <div className="sec-2 space-x-4">
                    {SharedWithMeList &&
                      SharedWithMeList?.map((data, index) => (
                        <div className="col-6" key={index}>
                          <div className="data-card">
                            <ul>
                              <li>
                                <div className="flex fs11 font-bold items-center">
                                  <i className="u-img-size mr-4 rounded-full">
                                    {data.userMeta.logoUrl ? (
                                      <img
                                        src={data.userMeta.logoUrl}
                                        className="rounded-full"
                                        alt="User Logo"
                                      />
                                    ) : (
                                      <div
                                        className="rounded-full"
                                        style={{
                                          backgroundColor: index % 2 === 0 ? "#9CBAD0" : "#589BCD",
                                          marginTop: 3,
                                          padding: 5,
                                          textAlign: "center",
                                          color: "white",
                                        }}
                                      >
                                        {data.userMeta.userName.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </i>
                                  {data.userMeta.userName}
                                </div>
                              </li>
                              {data.mySharedFilesWithNames.map((file, fileIndex) => (
                                <li
                                  key={fileIndex}
                                  onClick={(event) => {
                                    if (event.ctrlKey || event.metaKey) {
                                      const encodedString = encodeFileKey({
                                        id: file.id,
                                        teamId: file.teamId,
                                        folderId: file.folderId,
                                        fileName: file.fileName,
                                      });
                                      window.open(`/admin/file?key=${encodedString}`, "_blank");
                                    } else {
                                      dispatch(
                                        handleFileToOpen({
                                          id: (file as unknown as MySharedFileWithName).id,
                                          teamId: (file as unknown as MySharedFileWithName).teamId,
                                          folderId: (file as unknown as MySharedFileWithName)
                                            .folderId,
                                          status: (file as unknown as MySharedFileWithName)
                                            .processStatus,
                                          fileName: (file as unknown as MySharedFileWithName)
                                            .fileName,
                                          createdBy: (file as unknown as MySharedFileWithName)
                                            .createdBy,
                                          mimeType:
                                            (file as unknown as MySharedFileWithName).mimeType ||
                                            "",
                                        }),
                                      );
                                    }
                                  }}
                                >
                                  <a href="#" className="flex items-center">
                                    <i className="w-20 h-20 mr-5">
                                      <img src={IconFile} alt="Icon" />
                                    </i>
                                    <span className="fs11 truncate-line1">{file.fileName}</span>
                                    <span className="grow"></span>
                                    <button className="forward-btn">
                                      <img src={forwordIcon} alt="Forward Icon" />
                                    </button>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                  </div>
                  {monthIds.map((monthId, index) => (
                    <SharedFilesView key={monthId} monthId={monthId} fileName={fileName[index]} />
                  ))}
                </section>
              ) : (
                ""
              )}
              <SharedTeamList />
              {noList && isLoading === false && <NoDataPage pathname={location.pathname} />}
            </>
          )}
        </div>
      </div>
      {/* 
      <div className="right-section">
        <NotificationStack />
      </div> */}
    </>
  );
};

export default SharedWithMeContainer;

export const reducer = {
  dashboard: dashboardReducer,
  team: teamReducer,
  contract: contractReducer,
  dataFilter: dataFilterReducer,
};
