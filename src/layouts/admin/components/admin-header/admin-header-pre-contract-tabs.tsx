import { useEffect, useState } from "react";
import { USER_AUTHORITY } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { getAuth, getUserIdWithRole } from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { checkUserAuthrity } from "src/pages/user-dashboard/common-utility/utility-function";
import { setActiveContractTab } from "./header-auth.redux";

export const AdminHeaderPreContractTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("");
  const dispatch = useAppDispatch();
  const { profileId } = getAuth();
  const { activeStagePreContract, createdby, shareUser, sideBarData } = useAppSelector(
    (state) => state.preContract,
  );
    const ApprovalAllData = useAppSelector((state) => state.contractApprovals?.ApprovalAllData);
  const Pb_review = useAuthorityCheck([USER_AUTHORITY.PB_REVIEW]);
  useEffect(() => {
    dispatch(setActiveContractTab(""));
    return () => {
      dispatch(setActiveContractTab(""));
    };
  }, []);

  const { showPlaybook, showSummary } = ApprovalAllData;

  const isEditor = getUserIdWithRole(shareUser, USER_AUTHORITY.ROLE_PRE_CONTRACT_EDITOR, profileId);
  const isApprover = getUserIdWithRole(
    shareUser,
    USER_AUTHORITY.ROLE_PRE_CONTRACT_APPROVER,
    profileId,
  );
  const isReviewer = getUserIdWithRole(
    shareUser,
    USER_AUTHORITY.ROLE_PRE_CONTRACT_REVIEWER,
    profileId,
  );
  const isSignature = getUserIdWithRole(
    shareUser,
    USER_AUTHORITY.ROLE_PRE_CONTRACT_SIGNATURE,
    profileId,
  );
  const handlePreContractTabChange = (tab: string) => {
    if (activeTab === tab) {
      setActiveTab("");
      dispatch(setActiveContractTab(""));
    } else {
      setActiveTab(tab);
      dispatch(setActiveContractTab(tab));
    }
  };

  const isHeadertOn = (activeStage: number) => {
    if (activeStage === 2 && isEditor) {
      return true;
    } else if (activeStage === 3 && isReviewer) {
      return true;
    } else if (activeStage === 4 && isApprover) {
      return true;
    } else if (activeStage === 5 && isSignature) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      {activeStagePreContract > 2 && showSummary && (
        <div
          className={`app-icon-w app-icon-tab icon-tool-tip ${
            activeTab === "summary" ? "active" : ""
          }`}
          data-toggle-target=".tab-summary"
          onClick={() => handlePreContractTabChange("summary")}
        >
          <i className="sharing-ic any-ic"></i>
          <div className="icon-info">Summary</div>
        </div>
      )}
      {isHeadertOn(activeStagePreContract) && (
        <div
          className={`app-icon-w app-icon-tab icon-tool-tip ${
            activeTab === "comments" ? "active" : ""
          }`}
          data-toggle-target=".tab-comment"
          onClick={() => handlePreContractTabChange("comments")}
        >
          <span className="alert-message" style={{ display: "none" }}>
            2
          </span>
          <i className="comment-ic any-ic"></i>
          <div className="icon-info">Comment</div>
        </div>
      )}
      {activeStagePreContract > 1 && !checkUserAuthrity(createdby, profileId) && (
        <div
          className={`app-icon-w app-icon-tab icon-tool-tip ${
            activeTab === "comments" ? "active" : ""
          }`}
          data-toggle-target=".tab-comment"
          onClick={() => handlePreContractTabChange("comments")}
        >
          <span className="alert-message" style={{ display: "none" }}>
            2
          </span>
          <i className="comment-ic any-ic"></i>
          <div className="icon-info">Comment</div>
        </div>
      )}
      {activeStagePreContract > 2 && Pb_review && showPlaybook &&   (
        <div
          className={`app-icon-w app-icon-tab icon-tool-tip ${
            activeTab === "contractReview" ? "active" : ""
          }`}
          data-toggle-target=".tab-playbook"
          onClick={() => handlePreContractTabChange("contractReview")}
        >
          <span className="alert-message" style={{ display: "none" }}>
            4
          </span>
          <i className="playbook-ic any-ic"></i>
          <div className="icon-info">Contract Review</div>
        </div>
      )}
    </>
  );
};
