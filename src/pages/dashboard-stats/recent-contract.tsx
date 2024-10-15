import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ROUTE_ADMIN, ROUTE_RECENT_CONTRACT } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { getFileIcon, getShortUsername, getUsernameColor } from "src/core/utils";
import { handleFileToOpen } from "../contract/contract.redux";
import { FileType } from "../user-dashboard/dashboard.model";
import { clearMyDriveState } from "../user-dashboard/dashboard.redux";

const RecentContractDashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const currentDate = new Date();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const { contractExpiring, fileStats, topUser, currentMonthData } = useAppSelector(
    (state) => state.dashboardStats,
  );
  const { recentFilesList } = useAppSelector((state) => state.dashboard);
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const navigate = useNavigate();
  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };
  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
    return () => {
      dispatch(clearMyDriveState());
    };
  }, []);
  return (
    <section className="relative mb-3">
      <div className="sec-row">
        <div className="col-50">
          <div className="flex h-full">
            <div className="inner-card w-full">
              <div>
                <div className="flex mb-4">
                  <div className="card-info-title font-bold">Recent Contracts</div>
                  <span className="grow"></span>
                  <div className="fs10"></div>
                </div>
                <div className="dash-file-list">
                  <ul>
                    {recentFilesList?.slice(0, 5).map((file, index) => (
                      <li key={index}>
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <i className="dash-file-img mr-3">
                              <img
                                src={require(
                                  `assets/images/icon-${getFileIcon(file.fileName, file.mimeType)}.svg`,
                                )}
                              />
                            </i>
                            <div className="fs12">
                              <div className="mb-1 lh2">
                                <span>{file.fileName}</span>
                              </div>
                              <div className="mb-1 text-light-color">{file.firstName}</div>
                            </div>
                          </div>
                          <span className="grow"></span>
                          <div className="fs10">
                            <div className="sorting-menu-modal relative">
                              <button
                                className="icon-option-dot cursor-pointer"
                                onClick={(e) => handleFileOption(e, file.id)}
                              ></button>
                              {activeFileOption === file.id && (
                                <div className="sorting-menu-card rounded-6 cursor-pointer">
                                  <ul>
                                    <li>
                                      <div
                                        className="truncate-line1"
                                        onClick={() =>
                                          dispatch(
                                            handleFileToOpen({
                                              id: file.id,
                                              teamId: file.teamId,
                                              folderId: (file as FileType).folderId,
                                              status: (file as FileType).processStatus,
                                              fileName: (file as FileType).fileName,
                                              createdBy: (file as FileType).createdBy,
                                              mimeType: (file as FileType).mimeType || "",
                                            }),
                                          )
                                        }
                                      >
                                        View
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <button
                  className="view-all-btn"
                  onClick={() => navigate(`/${ROUTE_ADMIN}/${ROUTE_RECENT_CONTRACT}`)}
                >
                  All Contracts
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-50">
          <div className="data-box-row mb-3">
            <div className="data-box-col">
              <div className="data-box-detail">
                <div className="text-light-color fs14 font-semibold">Contracts</div>
                <div className="data-box-num">
                  {currentMonth} {currentYear}
                  <div className="fs12 mt-2">
                    {currentMonthData?.tfc > 1
                      ? currentMonthData?.tfc + " Contracts"
                      : currentMonthData?.tfc + " Contract"}
                  </div>
                </div>
              </div>
            </div>
            <div className="data-box-col">
              <div className="data-box-detail">
                <div className="text-light-color fs14 font-semibold mb-3">Top Member</div>
                <div className="fs12">
                  {topUser?.logoUrl ? (
                    <div className="dash-sm-img mb-1">
                      <img src={topUser.logoUrl} className="rounded-full" alt={topUser.name} />
                    </div>
                  ) : (
                    <div
                      className="user-name rounded-full mb-1"
                      style={{
                        backgroundColor: getUsernameColor(topUser?.name) || "",
                      }}
                    >
                      {topUser?.name !== "" && getShortUsername(topUser?.name)}
                    </div>
                  )}

                  <div>{topUser?.name}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="inner-card w-full card-h" style={{ justifyContent: "flex-start" }}>
            {contractExpiring && contractExpiring.length > 0 ? (
              <>
                {" "}
                <div className="flex mb-4">
                  <div className="card-info-title font-bold">Contracts Expiring in 45 days</div>
                </div>
                <div className="dash-expiring-list">
                  <ul>
                    {contractExpiring?.map((contract, index) => (
                      <li key={index}>
                        <div
                          className="flex items-center"
                          onClick={() => {
                            dispatch(
                              handleFileToOpen({
                                id: contract.fid,
                                fileName: contract.fileName,
                                teamId: contract.teamId,
                                folderId: contract.folderId,
                                mimeType: contract.mimeType,
                              }),
                            );
                          }}
                        >
                          <div className="flex">
                            <i className="dash-sm-img mr-3">
                              <img
                                src={require(
                                  `assets/images/icon-${getFileIcon(contract.fileName, contract.mimeType)}.svg`,
                                )}
                              />
                            </i>
                            <div className="fs12">
                              <div className="mb-1 lh2">
                                <span>{contract.fileName}</span>
                              </div>
                              <div className="mb-1 text-light-color">{contract.userName}</div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex mb-4 h-full">
                <div className="card-info-title font-bold h-full w-full flex items-center justify-center">
                  No contract expiring in 45 days
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentContractDashboard;
