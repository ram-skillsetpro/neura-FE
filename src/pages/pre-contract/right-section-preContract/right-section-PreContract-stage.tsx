import { decodeFileKey } from "core/utils";
import { wizardStages } from "core/utils/constant";
import Approvals from "pages/pre-contract/right-section-preContract/approval-component/approvals";
import Collaboration from "pages/pre-contract/right-section-preContract/collaboration-component/collaborations.component";
import PreContractReview from "pages/pre-contract/right-section-preContract/pre-contract-review/pre-contract-review";
import QuesAns from "pages/pre-contract/right-section-preContract/question-ans";
import PreContractSummary from "pages/pre-contract/right-section-preContract/summary/pre-contract-summary";
import UploadFile from "pages/pre-contract/right-section-preContract/upload-preContract";
import WizardComponent from "pages/pre-contract/right-section-preContract/wizard.component";
import React, { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ROUTE_ADMIN, UPLOAD_AND_SIGN } from "src/const";
import NotificationStack from "src/core/components/notification/notification-stack";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { clearSideBarContent } from "../pre-contract.redux";
import DocuSign from "../signature-precontract/docusign.component";
import ShareFilePrecontract from "./share-precontract";

const PreContractStage: React.FC = () => {
  const dispatch = useAppDispatch();
  const stage = useAppSelector((state) => state.preContract.activeStagePreContract);
  const tabName = useAppSelector((state) => state.headerSearchContract.activeContractTab);
  const contractId = useAppSelector((state) => state.preContract.contractId);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const key = searchParams.get("key");
  const { folderId, teamId } = decodeFileKey(key || "");

  const renderStageContent = () => {
    if (stage === 1) {
      return <UploadFile />;
    } else if (stage === 2) {
      return <QuesAns />;
    } else if (stage === 5) {
      return <DocuSign />;
    } else {
      return false;
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearSideBarContent());
    };
  }, [contractId]);

  return (
    <div className="right-section">
      {location?.pathname === "/admin/pre-contract" && (
        <div className="right-section-inner">
          <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal ml-3 wizard-txt">
            <div className="flex items-center">
              Wizard
              <div className="wizard-pagination">
                <WizardComponent stages={wizardStages} currentStage={stage} />
              </div>
            </div>
          </h4>
          {tabName === "comments" && stage > 1 ? <Collaboration /> : null}
          {tabName === "summary" && stage > 2 ? (
            <PreContractSummary fileId={contractId} folderId={folderId} teamId={teamId} />
          ) : null}
          {tabName === "contractReview" && stage > 2 ? (
            <PreContractReview fileId={contractId} folderId={folderId} teamId={teamId} />
          ) : null}
          {tabName === "" && (
            <>
              <NotificationStack />
              <div className="right-content-sec c-padding">
                {contractId > 0 && <ShareFilePrecontract />}
                {stage > 1 && stage < 6 && <Approvals />}
                {renderStageContent()}
              </div>
            </>
          )}
        </div>
      )}
      {location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}` && (
        <div className="right-section-inner">
          <NotificationStack />

          <div className="right-content-sec c-padding">
            {contractId > 0 && <ShareFilePrecontract />}
            {stage > 1 && stage < 6 && <Approvals />}
            {stage && (
              <PreContractSummary
                fileId={contractId}
                folderId={folderId}
                teamId={teamId}
                sourceType={UPLOAD_AND_SIGN}
              />
            )}
            {stage === 5 && renderStageContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreContractStage;
