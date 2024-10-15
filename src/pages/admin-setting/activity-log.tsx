import DOMPurify from "dompurify";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FILTER_TYPE } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { formatDateWithOrdinal } from "src/core/utils/constant";
import DataFilter from "src/layouts/admin/components/data-filter/data-filter";
import {
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import { contractReducer } from "../contract/contract.redux";
import { teamReducer } from "../manage-team/team.redux";
import { EmptyComponent } from "../user-dashboard/empty-component/empty-component";
import "./admin-setting.scss";
import { activityReportList, adminSettingReducer, clearActvityList } from "./settings-auth.redux";

interface Activity {
  eventlog: string;
  eventDate: number;
  ip: string | null;
}

interface ActivityLogProps {
  activityDataList?: Activity[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activityDataList = [] }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const profileID = authData?.profileId ? authData.profileId : "";

  const [showAll, setShowAll] = useState(location.pathname === "/admin/activity-log");
  // const [selectedValue, setSelectedValue] = useState("");

  const activityData = useAppSelector((state) => state?.adminSettingContract?.actvityList);
  const isLoading = useAppSelector((state) => state?.adminSettingContract?.isLoading);
  const acivityListDataNotAvailable = useAppSelector(
    (state) => state?.adminSettingContract?.acivityListDataNotAvailable,
  );
  const user = useAppSelector((state) => state.dataFilter.selectedFilterUsers);

  const { selectedFilterActivityType, selectedDateRangeFilter } = useAppSelector(
    (state) => state.dataFilter,
  );

  const [paginationData, setPaginationData] = useState({
    // totalItems: 30,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const { currentPage, itemsPerPage } = paginationData;

  const handleViewAllClick = () => {
    setShowAll(true);
    // Navigate to the new activity page
    navigate("/admin/activity-log");
  };

  useEffect(() => {
    // dispatch(activityReportActionDropdown());
    const payload = {
      pgn: 1,
      profileId: profileID,
    };
    dispatch(activityReportList(payload));
    return () => {
      dispatch(clearActvityList());
    };
  }, []);

  const handleFilter = () => {
    let getSelectedOptionKey: any = [];
    const { fromDate, toDate } = selectedDateRangeFilter || {};
    const startDate = Math.floor(fromDate / 1000);
    const endDate = Math.floor(toDate / 1000);

    getSelectedOptionKey =
      selectedFilterActivityType.length > 0 && selectedFilterActivityType?.map((item) => item?.key);
    const payload = {
      pgn: 1,
      profileId: profileID,
      selectedOption: getSelectedOptionKey,
      mergeResponse: true,
      startDate,
      endDate,
      userId: user.map((u) => u.id),
    };

    dispatch(activityReportList(payload));
    dispatch(setFilterActive(true));
    setPaginationData({ ...paginationData, currentPage: 1 });
  };

  const handleLoadMore = () => {
    // Increment the current page
    const newPage = currentPage + 1;
    const { fromDate, toDate } = selectedDateRangeFilter || {};
    const startDate = Math.floor(fromDate / 1000);
    const endDate = Math.floor(toDate / 1000);
    const selectedOptions =
      selectedFilterActivityType.length > 0 && selectedFilterActivityType?.map((item) => item?.key);
    // Fetch more data from the API using the new page
    const payload = {
      pgn: newPage,
      profileId: profileID,
      ...(selectedOptions && { selectedOption: selectedOptions }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(user.length > 0 && { userId: user.map((u) => u.id) }),
    };

    dispatch(activityReportList(payload));

    // Update the state to reflect the new current page
    setPaginationData({ ...paginationData, currentPage: newPage });
  };

  const adminSettingPage = (showData: boolean) => {
    navigate("/admin/settings", { state: { showData, buttonAction: true } });
  };

  return (
    <div
      className={location.pathname === "/admin/activity-log" ? `left-section left-divider-sec` : ""}
    >
      <div className={location.pathname === "/admin/activity-log" ? `left-section-inner` : ""}>
        <section className="admin-setting-sec">
          <div className="admin-setting-inner">
            <div className="admin-setting-left">
              <div className="flex view-all-header mb-3">
                {showAll && (
                  <div className="app-breadcrumbs">
                    <button
                      className="back-btn"
                      onClick={() => {
                        adminSettingPage(true);
                      }}
                    >
                      <i className="icon-img" />
                      {/* <img src="assets/images/back-icon.svg" /> */}
                    </button>
                  </div>
                )}
                <h2 className="fs10 text-defaul-color font-normal tracking-wider uppercase ml-3">
                  recent activity
                </h2>
                {!showAll && (
                  <button
                    onClick={handleViewAllClick}
                    className="button-dark-gray view-all rounded-12 sm-button tracking-wider font-bold uppercase"
                  >
                    view all
                  </button>
                )}
                {showAll && (
                  <DataFilter
                    handleFilter={handleFilter}
                    filterType={[
                      FILTER_TYPE.ACTIVITY_TYPE,
                      FILTER_TYPE.DATE_RANGE,
                      FILTER_TYPE.USER_LIST_SINGLE,
                    ]}
                  />
                )}
              </div>
            </div>
            {/* <div className="admin-setting-right-sec"></div> */}
          </div>
          {activityData?.length > 0 ? (
            <div className="admin-setting-inner">
              <div className="admin-setting-left">
                <div className="admin-setting-section">
                  <div className="admin-setting-card">
                    <div className="w-full">
                      {activityData?.length > 0 && (
                        <div className="recent-activity-row">
                          <div className="recent-activity-col1 uppercase tracking-wider">
                            Event Log
                          </div>
                          <div className="recent-activity-col2 uppercase tracking-wider">
                            Event Date
                          </div>
                          <div className="recent-activity-col3 uppercase tracking-wider">
                            IP & Location
                          </div>
                        </div>
                      )}

                      {activityData &&
                        activityData?.length > 0 &&
                        activityData.map((activity, index) => {
                          const sanitizedHTML = DOMPurify.sanitize(activity?.eventlog);
                          const sanitizedIP = DOMPurify.sanitize(activity?.ip);

                          return (
                            <div
                              className="recent-activity-row"
                              key={index}
                              style={{ display: showAll || index < 3 ? "flex" : "none" }}
                            >
                              <div
                                className="recent-activity-col1"
                                dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                              ></div>
                              <div className="recent-activity-col2">
                                {typeof activity?.eventDate === "string"
                                  ? // Checking if it's a string before attempting conversion
                                    formatDateWithOrdinal(
                                      new Date(parseInt(activity?.eventDate) * 1000),
                                      " ",
                                      true,
                                    )
                                  : formatDateWithOrdinal(
                                      new Date((activity?.eventDate as number) * 1000),
                                      " ",
                                      true,
                                    )}
                              </div>
                              <div
                                className="recent-activity-col3"
                                dangerouslySetInnerHTML={{ __html: sanitizedIP }}
                              ></div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
                {acivityListDataNotAvailable.length > 0 && showAll ? (
                  <div className="flex justify-center mt-3">
                    {isLoading ? (
                      <div className="flex justify-end">
                        <div className="simpleO-loader"></div>
                      </div>
                    ) : (
                      <button
                        onClick={handleLoadMore}
                        className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                      >
                        Load Next
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
              {/* <div className="admin-setting-right-sec"></div> */}
            </div>
          ) : (
            <EmptyComponent
              // messageTwo={""}
              messageOne={"Recent activity not available"}
              text={""}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default ActivityLog;

export const reducer = {
  adminSettingContract: adminSettingReducer,
  team: teamReducer,
  contract: contractReducer,
  dataFilter: dataFilterReducer,
};
