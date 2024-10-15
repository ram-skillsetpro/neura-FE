// import FoldersTable from "core/components/folders-table/folders-table";
import { useAppDispatch, useAppSelector } from "core/hook";
import { contractReducer } from "pages/contract/contract.redux";
import { manageMembersReducer } from "pages/manage-members/manage-members.redux";
import { teamReducer } from "pages/manage-team/team.redux";
import { dashboardReducer } from "pages/pre-dashboard/dashboard.redux";
import { UploadedSignedContracts } from "pages/pre-dashboard/drafts/uploaded-signed-contracts";
import UploadDropdown from "pages/user-dashboard/components/file-upload/upload-dropdown";
import React, { useEffect, useRef, useState } from "react";
import { FILTER_TYPE, USER_AUTHORITY } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataFilter from "src/layouts/admin/components/data-filter/data-filter";
import { EmptyComponent } from "src/pages/user-dashboard/empty-component/empty-component";
// import DraftFileView from "./draft-file-view";
import {
  clearFilter,
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import "../pre-dashboard/drafts/drafts-container.scss";
import { draftReducer, getUploadedSignedContracts } from "./drafts/drafts.redux";
// import { draftReducer, getDraftListData } from "./drafts.redux";

interface UploadAndSignContainerProps {}

const UploadAndSignContainer: React.FC<UploadAndSignContainerProps> = () => {
  const dispatch = useAppDispatch();
  const summaryAlerts = useAppSelector((state) => state.dashboard.summaryAlerts);
  // const renderUpload = useAppSelector((state) => state.dashboard.createNew);
  const isFilterActive = useAppSelector((state) => state.dataFilter.isFilterActive);
  const isUploadSign = useAuthorityCheck([USER_AUTHORITY.UPLOAD_SIGN]);
  // const draftList = useAppSelector((state) => state.drafts?.draftList);
  const [isListLoading, setIsListLoading] = useState<boolean>(false);
  const uploadedSignedContractList = useAppSelector(
    (state) => state.drafts?.uploadedSignedContractList,
  );
  const { selectedFilterContractStage } = useAppSelector((state) => state.dataFilter);
  const othersTableRef = useRef<HTMLDivElement | null>(null);

  const fetchData = async () => {
    try {
      const payload = {
        dataReset: true,
        state: selectedFilterContractStage.map((data) => {
          return data.id;
        }),
      };
      setIsListLoading(true);
      await dispatch(getUploadedSignedContracts(payload));
      setIsListLoading(false);
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      clearFilter();
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
                  // FILTER_TYPE.USER_LIST,
                  // FILTER_TYPE.CONTRACT_TYPE,
                  FILTER_TYPE.CONTRACT_STAGE,
                ]}
                handleFilter={handleFilter}
                stageType="upload-and-sign"
              />
              <span className="grow"></span>
              {isUploadSign && <UploadDropdown />}
            </div>
          </div>

          {isListLoading ? (
            <Loader />
          ) : isFilterActive ? (
            uploadedSignedContractList.length ? (
              <div ref={othersTableRef}>
                <UploadedSignedContracts />
              </div>
            ) : (
              <EmptyComponent
                messageOne={"Upload And Sign data not available"}
                text={"Upload And Sign"}
              />
            )
          ) : (
            <>
              {uploadedSignedContractList.length ? (
                <div ref={othersTableRef}>
                  <UploadedSignedContracts />
                </div>
              ) : (
                <EmptyComponent
                  messageTwo={isUploadSign ? "You can create new." : ""}
                  messageOne={"Your Upload And Sign section are empty now"}
                  text={"Upload And Sign"}
                />
              )}
            </>
          )}
        </div>
      </div>
      {/* <div className="right-section">
        {summaryAlerts.length === 0 && <NotificationStack />}
        {summaryAlerts.length > 0 && <RightSectionSummary data={summaryAlerts} />}
      </div> */}
    </>
  );
};

export default UploadAndSignContainer;

export const reducer = {
  dashboard: dashboardReducer, // TODO: should consume its own drafts reducer
  team: teamReducer,
  contract: contractReducer,
  manageMembers: manageMembersReducer,
  drafts: draftReducer,
  dataFilter: dataFilterReducer,
};
