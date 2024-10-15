import {
  contractApprovalReducer,
  fetchUserStatusUploadAndSign,
} from "pages/pre-contract/right-section-preContract/approval-component/approval.redux";
import { collaborationReducer } from "pages/pre-contract/right-section-preContract/collaboration-component/collaboration.redux";
import RightSection from "pages/pre-contract/right-section-preContract/right-section-PreContract-stage";
import {
  clearDocusign,
  docusignReducer,
} from "pages/pre-contract/signature-precontract/docusign.redux";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { ROUTE_ADMIN, UPLOAD_AND_SIGN_LIST } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { base64toBlob, decodeFilePreContractKey, downloadFileFromBlobUrl } from "src/core/utils";
import { headerSearchdReducer } from "src/layouts/admin/components/admin-header/header-auth.redux";
import {
  changeContractStateOnUploadAndSign,
  clearPreContractData,
  fetchUploadFileAndSignDocument,
  preContractReducer,
} from "src/pages/pre-contract/pre-contract.redux";
import { contractReducer, fetchContractType } from "../../../contract/contract.redux";
import "../../../pre-contract/pre-contract.scss";
// import RightSection from "src/pages/contract/right-section/right-section";
import MoveFolderModal from "core/components/modals/move-folder-modal/move-folder-modal";
import useModal from "core/utils/use-modal.hook";
import { teamDashboardReducer } from "pages/manage-team/team-files/team-files.redux";
import { teamReducer } from "pages/manage-team/team.redux";
import { dashboardReducer } from "pages/user-dashboard/dashboard.redux";
import { LoaderSection } from "src/core/components/loader/loaderSection.comp";
import ContractViewer from "src/pages/pre-contract/contract-viewer/contract-viewer";
import DocuSign from "src/pages/pre-contract/signature-precontract/docusign.component";
// import DocuSign from "./signature-precontract/docusign.component";

const UploadAndSign: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const contractInputRef = useRef<HTMLInputElement | null>(null);
  const stateBtnRef = useRef<HTMLButtonElement | null>(null);
  const [contractNameError, setContractNameError] = useState<any>(null);
  // const isContractCreator = useAuthorityCheck([USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR]);
  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const profileID = authData?.profileId ? authData.profileId : "";
  const preSignedUrl = useAppSelector((state) => state.docusign.preSignedUrl);
  const ApprovalList = useAppSelector((state) => state.contractApprovals?.ApprovalList);
  const [inputWidth, setInputWidth] = useState<number>();
  const [downloadDropdown, setDownloadDropdown] = useState<boolean>(false);
  const [isShowingModal, toggleModal] = useModal();

  let isWorkInProgress: any;
  let isSignComplete: any;

  if (Array.isArray(ApprovalList)) {
    isWorkInProgress = ApprovalList.some((user) => user.isWorkDone === 2);
    isSignComplete = ApprovalList.some(
      (user) => user.isWorkDone === 1 && user.userId === profileID,
    );
  }
  const { contractId: decodedContractId } = decodeFilePreContractKey(key || "");

  const {
    shareUser,
    contractName,
    contractId,
    createdby,
    activeStagePreContract,
    isLoading,
    preContractPdf,
    postContractId,
  } = useAppSelector((state) => state.preContract);

  useEffect(() => {
    let fetchWorkCompleteStatus: any;
    if (activeStagePreContract > 1 && activeStagePreContract < 6) {
      fetchWorkCompleteStatus = setInterval(checkWorkComplete, 10000);
    }

    if (isSignComplete && activeStagePreContract === 5) {
      dispatch(clearDocusign());
      dispatch(fetchUploadFileAndSignDocument(contractId));
    }
    return () => clearInterval(fetchWorkCompleteStatus);
  }, [isWorkInProgress, activeStagePreContract, isSignComplete, contractId]);

  const checkWorkComplete = async () => {
    if (contractId > 0) {
      await dispatch(fetchUserStatusUploadAndSign(contractId));
    }
  };

  useEffect(() => {
    if (isLoading) {
      setContractNameError(null);
    }
  }, [isLoading]);

  const initiateNextStep = async (backToEdit: boolean = false) => {
    if (contractId && activeStagePreContract < 6) {
      if (stateBtnRef.current) {
        stateBtnRef.current.disabled = true;
      }
      await dispatch(
        changeContractStateOnUploadAndSign({
          contractId,
          backToEdit,
        }),
      );

      if (stateBtnRef.current) {
        stateBtnRef.current.disabled = false;
      }
    }
    if (activeStagePreContract === 6) {
      toggleModal();
    }
  };

  useEffect(() => {
    dispatch(fetchContractType());

    return () => {
      dispatch(clearPreContractData());
    };
  }, []);

  useEffect(() => {
    if (contractName) {
      setInputWidth(Math.min(Math.max(contractName.length * 8, 170), 800));
    }
  }, [contractName]);

  useEffect(() => {
    if (decodedContractId > 0) {
      dispatch(fetchUploadFileAndSignDocument(decodedContractId));
    }
  }, [decodedContractId]);

  const handleDownload = () => {
    preContractPdf &&
      preContractPdf !== "" &&
      downloadFileFromBlobUrl(base64toBlob(preContractPdf), contractName);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setDownloadDropdown(false);
    });
  }, []);

  return (
    <>
      <div className="left-section">
        <div className="left-section-inner" style={{ overflow: "hidden" }}>
          {/* Inner HTML */}
          <div className="ck-editor-sec">
            <div className="left-inner-sticky">
              <div className="app-breadcrumbs">
                <button
                  className="back-btn"
                  onClick={() => {
                    dispatch(clearDocusign());
                    navigate(`/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN_LIST}`);
                  }}
                >
                  <i className="icon-img" />
                  {/* <img src="assets/images/back-icon.svg" /> */}
                </button>
                {preSignedUrl === "" && (
                  <div className="contract-name-wrap contract-truncate1">
                    <span className="fs12 font-bold">{contractName}</span>
                  </div>
                )}
                {/* {isContractCreator && displayContractTypeList ? (
                  <div className="contract-name-wrap">
                    <select
                      className="custom-select"
                      value={existingContractTypeId}
                      onChange={(e) => {
                        setContractNameError(null);
                        setLocalContractTypeId(Number(e.target.value));
                      }}
                    >
                      <option value={0}>Contract Type</option>
                      {contractTypes.map((data, index) => (
                        <option key={index} value={data.id}>
                          {data.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  ""
                )} */}

                {contractNameError && (
                  <div className="contract-input-error">{contractNameError}</div>
                )}
              </div>

              <div className="flex items-center">
                <ul className="app-tab-style" id="tabs-nav">
                  {/* <li><a href="#tab2">Clauses</a></li>
							<li><a href="#tab3">Tables</a></li>
							<li><a href="#tab4">Original</a></li> */}
                </ul>
                {/* END tabs-nav */}
                <span className="grow" />
                {activeStagePreContract === 6 && (
                  <div className="relative drop-down-modal">
                    <button
                      disabled={!preContractPdf}
                      className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDownloadDropdown(!downloadDropdown);
                      }}
                    >
                      Download
                    </button>
                    <div
                      className="menu-card rounded-6"
                      style={{ display: `${downloadDropdown ? "block" : "none"}` }}
                    >
                      <ul>
                        <li>
                          <a
                            className="download-file"
                            title="Download Contract"
                            onClick={handleDownload}
                          >
                            Download PDF
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                <div className="relative word-count">
                  <p className="inline-block" style={{ display: "none" }}>
                    Words <strong>2400</strong>, Pages <strong>12 - Autosaved 12:45PM</strong>
                  </p>
                  {/* {activeStagePreContract < 3
                    ? (activeStagePreContract === 1 &&
                        isContractCreator &&
                        key &&
                        createdby === profileID) ||
                      (activeStagePreContract === 1 &&
                        isContractCreator &&
                        !getUserIdWithRole(
                          shareUser,
                          USER_AUTHORITY.ROLE_PRE_CONTRACT_EDITOR,
                          profileID,
                        )) ||
                      (activeStagePreContract === 2 &&
                        getUserIdWithRole(
                          shareUser,
                          USER_AUTHORITY.ROLE_PRE_CONTRACT_EDITOR,
                          profileID,
                        ) && (
                          <button
                            // disabled={text === ""}
                            onClick={saveContract}
                            className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer ml-3"
                          >
                            save
                          </button>
                        ))
                    : null} */}
                  {/* {renderSaveBtn()} */}
                  {contractId && key && createdby === profileID ? (
                    <>
                      <div className="button-tool-tip">
                        {shareUser.length === 0 && (
                          <div className="button-info">
                            Add signatories before initiate signing.
                          </div>
                        )}
                        <button
                          disabled={
                            !preContractPdf || shareUser.length === 0 || postContractId !== 0
                          }
                          ref={stateBtnRef}
                          onClick={() => initiateNextStep()}
                          className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer ml-3"
                        >
                          {/* Initiate Complete */}
                          {activeStagePreContract === 1 ? "Initiate Signing" : ""}
                          {activeStagePreContract === 5 ? "Initiate Complete" : ""}
                          {activeStagePreContract === 6
                            ? postContractId > 0
                              ? "Moved"
                              : "Move"
                            : ""}
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            {preSignedUrl === "" && (
              <div className="editor-inner-content" style={{ overflowY: "auto" }}>
                {preContractPdf ? <ContractViewer file={preContractPdf} /> : <LoaderSection />}
              </div>
            )}

            {/* END tabs-content */}
          </div>
          {/* END tabs */}
        </div>
      </div>
      {preSignedUrl !== "" && <DocuSign SignButtonHide={false} />}

      {preSignedUrl === "" && <RightSection />}
      {isShowingModal && contractId && (
        <MoveFolderModal
          isOpen={isShowingModal}
          onClose={() => toggleModal()}
          shouldCloseOnOverlayClick={true}
          fileToMove={{ fileName: contractName, id: contractId }}
        />
      )}
    </>
  );
};

export default UploadAndSign;

export const reducer = {
  preContract: preContractReducer,
  contractApprovals: contractApprovalReducer,
  collaboration: collaborationReducer,
  contract: contractReducer,
  headerSearchContract: headerSearchdReducer,
  docusign: docusignReducer,
  dashboard: dashboardReducer,
  teamDashboard: teamDashboardReducer,
  team: teamReducer,
};
