import { motion } from "framer-motion";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { FILTER_TYPE, USER_AUTHORITY } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import {
  clearFilter,
  setCurrentPath,
  setSelectedActivityType,
  setSelectedContractStage,
  setSelectedFilterContractType,
  setSelectedFilterSingleUser,
  setSelectedFilterUsers,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import { activityReportActionDropdown } from "src/pages/admin-setting/settings-auth.redux";
import { fetchContractType } from "src/pages/contract/contract.redux";
import { fetchAllUserList } from "src/pages/manage-team/team.redux";
import "./data-filter.scss";
import DateRangeModal from "./date-range-modal";

interface DataFilterType {
  handleFilter: () => void;
  filterType: Array<string>;
  stageType?: string;
  activeFilterPath?: Array<string>;
}

const DataFilter: React.FC<DataFilterType> = ({
  handleFilter,
  filterType = [],
  stageType = "",
  activeFilterPath = [],
}) => {
  const dispatch = useAppDispatch();

  const location = useLocation();
  const { pathname } = location || {};

  const [hasOpenUserList, setHasOpenUserList] = useState<boolean>(false);
  const [hasOpenTypeList, setHasOpenTypeList] = useState<boolean>(false);
  const [hasOpenActivityTypeList, setHasOpenActivityTypeList] = useState<boolean>(false);
  const [hasOpenContractStageList, setHasOpenContractStageList] = useState<boolean>(false);
  const [dateRangeOpen, setDateRangeOpen] = useState<boolean>(false);
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);

  const { allActiveUserList } = useAppSelector((state) => state.team);
  const {
    selectedFilterContractType,
    selectedFilterUsers,
    currentPath,
    selectedFilterActivityType,
    selectedDateRangeFilter,
    isFilterActive: isFilterActive1,
    selectedFilterContractStage,
  } = useAppSelector((state) => state.dataFilter);

  const { contractTypes } = useAppSelector((state) => state.contract);

  const actvityDropdownLists = filterType.includes(FILTER_TYPE.ACTIVITY_TYPE)
    ? useAppSelector((state) => state?.adminSettingContract?.actvityDropdownLists)
    : [];

  const userListAuthority = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const contractStateFilterAuhtority = useAuthorityCheck([
    USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR,
  ]);

  const handleActivityTypeDropdown = (e: any) => {
    e.stopPropagation();
    setHasOpenActivityTypeList(!hasOpenActivityTypeList);
    setHasOpenUserList(false);
    setHasOpenTypeList(false);
    setHasOpenContractStageList(false);
  };

  const unsetAllFilter = () => {
    setHasOpenTypeList(false);
    setHasOpenUserList(false);
    setHasOpenActivityTypeList(false);
    setHasOpenContractStageList(false);
  };

  const handleTypeDropdown = (e: any) => {
    e.stopPropagation();
    setHasOpenTypeList(!hasOpenTypeList);
    setHasOpenUserList(false);
    setHasOpenActivityTypeList(false);
    setHasOpenContractStageList(false);
  };

  const handleUserDropdown = (e: any) => {
    e.stopPropagation();
    setHasOpenUserList(!hasOpenUserList);
    setHasOpenTypeList(false);
    setHasOpenActivityTypeList(false);
    setHasOpenContractStageList(false);
  };

  const handleContractStageDropdown = (e: any) => {
    e.stopPropagation();
    setHasOpenUserList(false);
    setHasOpenTypeList(false);
    setHasOpenActivityTypeList(false);
    setHasOpenContractStageList(!hasOpenContractStageList);
  };

  let stageList = [];

  if (stageType === "upload-and-sign") {
    stageList = [
      { label: "Draft", id: 1 },
      { label: "Signing", id: 5 },
      { label: "Complete", id: 6 },
    ];
  } else {
    stageList = [
      { label: "Draft", id: 1 },
      { label: "Collaborate", id: 2 },
      { label: "Review", id: 3 },
      { label: "Approvals", id: 4 },
      { label: "Signing", id: 5 },
      { label: "Complete", id: 6 },
    ];
  }

  const checkedActivityType = (data: any) => {
    if (selectedFilterActivityType.filter((d) => d.key === data.key)[0]) {
      return true;
    }
    return false;
  };

  const checkedUser = (data: any) => {
    if (selectedFilterUsers.filter((d) => d.id === data.id)[0]) {
      return true;
    }
    return false;
  };

  const checkedContractStage = (data: any) => {
    if (selectedFilterContractStage.filter((d) => d.id === data.id)[0]) {
      return true;
    }
    return false;
  };

  const checkedContractType = (data: any) => {
    if (selectedFilterContractType.filter((d) => d.id === data.id)[0]) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    (filterType.includes(FILTER_TYPE.USER_LIST) ||
      filterType.includes(FILTER_TYPE.USER_LIST_SINGLE)) &&
      userListAuthority &&
      dispatch(fetchAllUserList());
  }, [userListAuthority]);

  useEffect(() => {
    filterType.includes(FILTER_TYPE.CONTRACT_TYPE) && dispatch(fetchContractType());
    filterType.includes(FILTER_TYPE.ACTIVITY_TYPE) && dispatch(activityReportActionDropdown());
    window.addEventListener("click", () => {
      setHasOpenTypeList(false);
      setHasOpenUserList(false);
      setHasOpenActivityTypeList(false);
      setHasOpenContractStageList(false);
    });
  }, []);

  useEffect(() => {
    if (
      (currentPath !== pathname && !activeFilterPath.includes(pathname)) ||
      !activeFilterPath.includes(currentPath)
    ) {
      dispatch(clearFilter());
    }
    dispatch(setCurrentPath(pathname));
  }, [pathname]);

  const removeFilter = async () => {
    await dispatch(clearFilter());
    window.location.reload();
  };

  const openDateRange = () => {
    setDateRangeOpen(true);
  };

  const hasFilterApplied = () => {
    return !(
      !selectedFilterContractStage.length &&
      !selectedFilterContractType.length &&
      !selectedFilterUsers.length &&
      !selectedFilterActivityType.length &&
      (selectedDateRangeFilter.fromDate === null || selectedDateRangeFilter.toDate === null)
    );
  };

  useEffect(() => {
    if (!hasFilterApplied() && isFilterApplied) {
      unsetAllFilter();
      setIsFilterApplied(false);
      handleFilter();
    }
  }, [
    selectedFilterContractType,
    selectedFilterUsers,
    selectedFilterActivityType,
    selectedDateRangeFilter,
    selectedFilterContractStage,
  ]);

  useEffect(() => {
    isFilterActive1 ? setIsFilterApplied(true) : setIsFilterApplied(false);
  }, [isFilterActive1]);

  return (
    <>
      {filterType.includes(FILTER_TYPE.CONTRACT_TYPE) &&
      Array.isArray(contractTypes) &&
      contractTypes.length ? (
        <div className="filter-menu-modal relative">
          <button
            onClick={handleTypeDropdown}
            className={`file-btn1 font-bold down-icon cursor-pointer ${
              selectedFilterContractType.length > 0 && !hasOpenTypeList ? "filter-active" : ""
            }`}
          >
            Contract Type
          </button>
          {hasOpenTypeList && (
            <motion.div
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="filter-menu-card rounded-6 contract-filter-menu-card"
            >
              <ul>
                {contractTypes.map((data, index) => (
                  <li key={index} onClick={(e) => e.stopPropagation()}>
                    <div className="truncate-line1">{data.name}</div>
                    <div className="ch-box">
                      <input
                        checked={checkedContractType(data)}
                        type="checkbox"
                        onChange={() => dispatch(setSelectedFilterContractType(data))}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      ) : (
        ""
      )}
      {/* <!--breadcrum section start here--> */}
      {pathname !== "/admin/drafts" &&
      userListAuthority &&
      filterType.includes(FILTER_TYPE.USER_LIST) &&
      !filterType.includes(FILTER_TYPE.USER_LIST_SINGLE) &&
      Array.isArray(allActiveUserList) &&
      allActiveUserList.length ? (
        <div className="filter-menu-modal relative">
          <button
            onClick={handleUserDropdown}
            className={`file-btn1 font-bold down-icon cursor-pointer ${
              selectedFilterUsers.length > 0 && !hasOpenUserList ? "filter-active" : ""
            }`}
          >
            {filterType.includes(FILTER_TYPE.USER_LIST) ? "Owners" : "Owner"}
          </button>
          {hasOpenUserList && (
            <motion.div
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="filter-menu-card rounded-6 user-filter-menu-card"
            >
              <ul>
                {allActiveUserList.map((data, index) => (
                  <li key={index} onClick={(e) => e.stopPropagation()}>
                    <div className="truncate-line1">{`${data.userName}`}</div>
                    <div className="ch-box">
                      <input
                        checked={checkedUser(data)}
                        type="checkbox"
                        onChange={() => dispatch(setSelectedFilterUsers(data))}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      ) : (
        ""
      )}

      {pathname !== "/admin/drafts" &&
      userListAuthority &&
      filterType.includes(FILTER_TYPE.USER_LIST_SINGLE) &&
      !filterType.includes(FILTER_TYPE.USER_LIST) &&
      Array.isArray(allActiveUserList) &&
      allActiveUserList.length ? (
        <div className="filter-menu-modal relative">
          <button
            onClick={handleUserDropdown}
            className={`file-btn1 font-bold down-icon cursor-pointer ${
              selectedFilterUsers.length > 0 && !hasOpenUserList ? "filter-active" : ""
            }`}
          >
            {filterType.includes(FILTER_TYPE.USER_LIST) ? "Owners" : "Owner"}
          </button>
          {hasOpenUserList && (
            <motion.div
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="filter-menu-card rounded-6 user-filter-menu-card"
            >
              <ul>
                {allActiveUserList.map((data, index) => (
                  <li key={index} onClick={(e) => e.stopPropagation()}>
                    <div className="truncate-line1">{`${data.userName}`}</div>
                    <div className="ch-box">
                      <input
                        checked={checkedUser(data)}
                        type="checkbox"
                        onChange={() => dispatch(setSelectedFilterSingleUser(data))}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      ) : (
        ""
      )}

      {filterType.includes(FILTER_TYPE.ACTIVITY_TYPE) &&
      Array.isArray(actvityDropdownLists) &&
      actvityDropdownLists.length ? (
        <div className="filter-menu-modal relative">
          <button
            onClick={handleActivityTypeDropdown}
            className={`file-btn1 font-bold down-icon cursor-pointer ${
              selectedFilterActivityType.length > 0 && !hasOpenActivityTypeList
                ? "filter-active"
                : ""
            }`}
          >
            Activity Type
          </button>
          {hasOpenActivityTypeList && (
            <motion.div
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="filter-menu-card rounded-6 user-filter-menu-card"
            >
              <ul>
                {actvityDropdownLists.map((data, index) => (
                  <li key={index} onClick={(e) => e.stopPropagation()}>
                    <div className="truncate-line1">{`${data.value}`}</div>
                    <div className="ch-box">
                      <input
                        checked={checkedActivityType(data)}
                        type="checkbox"
                        onChange={() => dispatch(setSelectedActivityType(data))}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      ) : (
        ""
      )}

      {filterType.includes(FILTER_TYPE.DATE_RANGE) ? (
        <div className="filter-menu-modal relative">
          <button
            onClick={openDateRange}
            className={`file-btn1 font-bold down-icon cursor-pointer ${
              selectedDateRangeFilter.fromDate !== null &&
              selectedDateRangeFilter.toDate !== null &&
              !dateRangeOpen
                ? "filter-active"
                : ""
            }`}
          >
            {selectedDateRangeFilter.fromDate === null && selectedDateRangeFilter.toDate === null
              ? "Date Range"
              : `${
                  selectedDateRangeFilter.fromDate !== null
                    ? moment(selectedDateRangeFilter.fromDate).format("DD/MM/YYYY")
                    : ""
                } - ${
                  selectedDateRangeFilter.toDate !== null
                    ? moment(selectedDateRangeFilter.toDate).format("DD/MM/YYYY")
                    : ""
                }`}
          </button>
        </div>
      ) : (
        ""
      )}

      {contractStateFilterAuhtority && filterType.includes(FILTER_TYPE.CONTRACT_STAGE) ? (
        <div className="filter-menu-modal relative">
          <button
            onClick={handleContractStageDropdown}
            className={`file-btn1 font-bold down-icon cursor-pointer ${
              selectedFilterContractStage.length > 0 && !hasOpenUserList ? "filter-active" : ""
            }`}
          >
            Contract State
          </button>
          {hasOpenContractStageList && (
            <motion.div
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="filter-menu-card rounded-6 user-filter-menu-card"
            >
              <ul>
                {stageList.map((data, index) => (
                  <li key={index} onClick={(e) => e.stopPropagation()}>
                    <div className="truncate-line1">{`${data.label}`}</div>
                    <div className="ch-box">
                      <input
                        checked={checkedContractStage(data)}
                        type="checkbox"
                        onChange={() => dispatch(setSelectedContractStage(data))}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      ) : (
        ""
      )}

      {(((Array.isArray(allActiveUserList) && allActiveUserList.length) ||
        (Array.isArray(contractTypes) && contractTypes.length)) &&
        ((Array.isArray(selectedFilterContractType) && selectedFilterContractType.length) ||
          (Array.isArray(selectedFilterUsers) && selectedFilterUsers.length))) ||
      (Array.isArray(actvityDropdownLists) &&
        actvityDropdownLists.length &&
        Array.from(selectedFilterActivityType || []).length) ||
      (Array.isArray(stageList) &&
        stageList.length &&
        Array.isArray(selectedFilterContractStage) &&
        selectedFilterContractStage.length) ||
      (selectedDateRangeFilter.fromDate !== null && selectedDateRangeFilter.toDate !== null) ? (
        <button
          title={`${isFilterActive1 ? "Filter Applied" : "Apply Filter"}`}
          onClick={
            isFilterActive1
              ? () => {}
              : () => {
                  setIsFilterApplied(true);
                  handleFilter();
                }
          }
          className={`apply-btn ${isFilterActive1 ? "active" : ""} cursor-pointer`}
        ></button>
      ) : null}

      {hasFilterApplied() && isFilterActive1 ? (
        <button
          title="Clear Filter"
          onClick={removeFilter}
          className="filter-reset cursor-pointer"
        ></button>
      ) : (
        ""
      )}

      <DateRangeModal
        isOpen={dateRangeOpen}
        onClose={() => setDateRangeOpen(false)}
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
};

export default DataFilter;
