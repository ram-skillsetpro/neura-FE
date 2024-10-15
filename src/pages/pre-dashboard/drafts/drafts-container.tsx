// import FoldersTable from "core/components/folders-table/folders-table";
import { useAppDispatch, useAppSelector } from "core/hook";
import { contractReducer } from "pages/contract/contract.redux";
import { manageMembersReducer } from "pages/manage-members/manage-members.redux";
import { teamReducer } from "pages/manage-team/team.redux";
import { dashboardReducer } from "pages/pre-dashboard/dashboard.redux";
import UploadDropdown from "pages/user-dashboard/components/file-upload/upload-dropdown";
import React, { useEffect, useRef, useState } from "react";
import { FILTER_TYPE, USER_AUTHORITY } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataFilter from "src/layouts/admin/components/data-filter/data-filter";
import {
  clearFilter,
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import { EmptyComponent } from "src/pages/user-dashboard/empty-component/empty-component";
import DraftFileView from "./draft-file-view";
import "./drafts-container.scss";
import { draftReducer, getDraftListData } from "./drafts.redux";

interface DraftsContainerProps {}

const DraftsContainer: React.FC<DraftsContainerProps> = () => {
  const dispatch = useAppDispatch();
  const summaryAlerts = useAppSelector((state) => state.dashboard.summaryAlerts);
  // const renderUpload = useAppSelector((state) => state.dashboard.createNew);
  const isFilterActive = useAppSelector((state) => state.dataFilter.isFilterActive);
  const isContractCreator = useAuthorityCheck([USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR]);
  const draftList = useAppSelector((state) => state.drafts?.draftList);
  const [isDraftListLoading, setIsDraftListLoading] = useState<boolean>(false);
  const othersTableRef = useRef<HTMLDivElement | null>(null);

  const fetchData = async () => {
    try {
      const payload = {
        dataReset: true,
      };
      setIsDraftListLoading(true);
      await dispatch(getDraftListData(payload));
      setIsDraftListLoading(false);
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      dispatch(clearFilter());
    };
  }, []);

  const handleFilter = async () => {
    fetchData();
    dispatch(setFilterActive(true));
  };

  return (
    <>
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <div className="left-inner-sticky pb-1">
            <div className="filter-sec">
              <DataFilter
                filterType={[
                  FILTER_TYPE.USER_LIST,
                  FILTER_TYPE.CONTRACT_TYPE,
                  FILTER_TYPE.CONTRACT_STAGE,
                ]}
                handleFilter={handleFilter}
              />
              <span className="grow"></span>
              {isContractCreator && <UploadDropdown />}
            </div>
          </div>

          {isDraftListLoading ? (
            <Loader />
          ) : isFilterActive ? (
            draftList.length > 0 ? (
              <div ref={othersTableRef}>
                <DraftFileView isFilterActive={isFilterActive} />
              </div>
            ) : (
              <EmptyComponent messageOne={"Drafts section data not available"} text={"My Drafts"} />
            )
          ) : (
            <>
              {draftList.length > 0 ? (
                <div className="w-full" ref={othersTableRef}>
                  <DraftFileView />
                </div>
              ) : (
                <EmptyComponent
                  messageTwo={isContractCreator ? "You can create new." : ""}
                  messageOne={"Your Drafts section are empty now"}
                  text={"My Drafts"}
                />
              )}
            </>
          )}
          {/* <UploadedSignedContracts /> */}
        </div>
      </div>
      {/* <div className="right-section">
        {summaryAlerts.length === 0 && <NotificationStack />}
        {summaryAlerts.length > 0 && <RightSectionSummary data={summaryAlerts} />}
      </div> */}
    </>
  );
};

export default DraftsContainer;

export const reducer = {
  dashboard: dashboardReducer, // TODO: should consume its own drafts reducer
  team: teamReducer,
  contract: contractReducer,
  manageMembers: manageMembersReducer,
  drafts: draftReducer,
  dataFilter: dataFilterReducer,
};
