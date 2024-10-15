import MoveFolderModal from "core/components/modals/move-folder-modal/move-folder-modal";
import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import useModal from "core/utils/use-modal.hook";
import moment from "moment";
import { teamDashboardReducer } from "pages/manage-team/team-files/team-files.redux";
import { teamReducer } from "pages/manage-team/team.redux";
import {
  clearApprovalListData,
  contractApprovalReducer,
  fetchApprovalsData,
} from "pages/pre-contract/right-section-preContract/approval-component/approval.redux";
import { collaborationReducer } from "pages/pre-contract/right-section-preContract/collaboration-component/collaboration.redux";
import {
  clearDocusign,
  docusignReducer,
} from "pages/pre-contract/signature-precontract/docusign.redux";
import { TemplatesReducer, clearTemplateData } from "pages/pre-dashboard/templates/templates.redux";
import { dashboardReducer } from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_PRE_DRAFTS, USER_AUTHORITY } from "src/const";
import { ButtonLoader } from "src/core/components/loader/button-loader";
import { LoaderSection } from "src/core/components/loader/loaderSection.comp";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { CommonService } from "src/core/services/common.service";
import {
  base64toBlob,
  decodeFilePreContractKey,
  downloadFileFromBlobUrl,
  encodeFilePreContractKey,
  getPendingTrackChanges,
  getUserIdWithRole,
} from "src/core/utils";
import { headerSearchdReducer } from "src/layouts/admin/components/admin-header/header-auth.redux";
import { contractReducer, fetchContractType } from "../contract/contract.redux";
import { playbookReducer } from "../playbook/playbook.redux";
import Editor from "./contract-editor/only-office-editor/editor";
import {
  clearEditorConfig,
  fetchConfigByContractId,
  onlyOfficeEditorReducer,
} from "./contract-editor/only-office-editor/onlyoffice.redux";
import ContractViewer from "./contract-viewer/contract-viewer";
import {
  changeContractState,
  clearPreContractData,
  preContractReducer,
  saveContractData,
  setContractName,
  setContractTypeError,
  setContractTypeId,
  setExpandEditorState,
  setPreContractPdf,
} from "./pre-contract.redux";
import "./pre-contract.scss";
import RightSection from "./right-section-preContract/right-section-PreContract-stage";
import DocuSign from "./signature-precontract/docusign.component";

const PreContract: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const contractInputRef = useRef<HTMLInputElement | null>(null);
  const stateBtnRef = useRef<HTMLButtonElement | null>(null);

  const [contractNameError, setContractNameError] = useState<any>(null);
  const isContractCreator = useAuthorityCheck([USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR]);
  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const profileID = authData?.profileId ? authData.profileId : "";
  const preSignedUrl = useAppSelector((state) => state.docusign.preSignedUrl);
  const ApprovalList = useAppSelector((state) => state.contractApprovals?.ApprovalList);
  const [inputWidth, setInputWidth] = useState<number>();
  const [downloadDropdown, setDownloadDropdown] = useState<boolean>(false);
  // const [expandEditor, setExpandEditor] = useState<boolean>(false);
  const [editorLoadingState, setEditorLoadingState] = useState<boolean>(false);

  const { reviews } = useAppSelector((state) => state.onlyOfficeEditor);

  const childRef = useRef<any>();

  const { contractId: decodedContractId } = decodeFilePreContractKey(key || "");
  const [interValCount, setInterValCount] = useState(0);

  const saveBtnRef = useRef<HTMLButtonElement | null>(null);

  const {
    contractName,
    contractId,
    createdby,
    templateData,
    activeStagePreContract,
    isLoading,
    shareUser,
    contractTypeId: existingContractTypeId,
    preContractPdf,
    contractLastUpdate,
    savePreContractError,
    postContractId,
    expandEditor
  } = useAppSelector((state) => state.preContract);
  const { questionaireArray } = useAppSelector((state) => state.templates);
  const canEdit = getUserIdWithRole(shareUser, USER_AUTHORITY.ROLE_PRE_CONTRACT_EDITOR, profileID);
  const {
    getEditorConfigReps,
    isLoading: officeIsLoading,
    isNameFieldEnabled,
  } = useAppSelector((state) => state.onlyOfficeEditor);
  const { config } = getEditorConfigReps || {};
  const [isShowingModal, toggleModal] = useModal();

  let isWorkInProgress: any;
  let isSignComplete: any;
  let isApprovalComplete: any;
  let isSigningShareAndInitiated = true;

  if (Array.isArray(ApprovalList)) {
    isWorkInProgress = ApprovalList.some((user) => user.isWorkDone === 2);
    isSignComplete = ApprovalList.some(
      (user) => user.isWorkDone === 1 && user.userId === profileID,
    );
    isApprovalComplete = ApprovalList.some((user) => user.isWorkDone === 1);

    const signCompleted = ApprovalList.some((user) => user.isWorkDone === 1);

    if (activeStagePreContract === 5 && (isWorkInProgress || signCompleted)) {
      isSigningShareAndInitiated = false;
    }
  }

  const checkWorkComplete = async () => {
    await dispatch(fetchApprovalsData(contractId));
  };

  const { template: { templateId = 0, contractTypeId = 0, templateName = "" } = {} } =
    templateData || {};

  const saveContract = async () => {
    if (contractInputRef.current) {
      contractInputRef.current.classList.remove("contract-name-input");
    }
    if (contractName === "") {
      if (contractInputRef.current) {
        contractInputRef.current.classList.add("contract-name-input");
        contractInputRef.current.focus();
      }
      setContractNameError("Please Fill Contract Name!");
      return;
    }
    if (!existingContractTypeId && isContractCreator) {
      dispatch(setContractTypeError("Please Select Contract Type"));
      return;
    }

    const markerJson = JSON.stringify({ questionaire: questionaireArray });

    if (saveBtnRef.current) {
      saveBtnRef.current.disabled = true;
    }

    const payload: any = {
      contractTypeId: undefined,
      contractName,
      folderId: 0,
      markerJson,
      templateId,
      text: "{}",
      contractId: contractId || decodedContractId || 0,
    };

    if (existingContractTypeId) {
      payload.contractTypeId = existingContractTypeId;
    }

    const cid = await dispatch(saveContractData(payload));

    if (cid) {
      if (saveBtnRef.current) {
        saveBtnRef.current.disabled = false;
      }
      const encodedString = encodeFilePreContractKey({ contractId: cid });
      navigate("/admin/pre-contract?key=" + encodedString, { replace: true });
    }
  };

  const getReviewData = (data: any) => {
    if (JSON.stringify(data) === "{}" && activeStagePreContract === 3) {
      callNextStep();
    } else {
      if (data) {
        CommonService.toast({
          type: "error",
          message: "Please review the pending change requests and then proceed.",
        });
        setTimeout(() => {
          handleNextChanges();
        }, 500);
      }
    }
  };

  const callNextStep = async (backToEdit: boolean = false) => {
    if (stateBtnRef.current) {
      stateBtnRef.current.disabled = true;
    }
    if (activeStagePreContract === 4) {
      dispatch(setPreContractPdf(null));
    }
    await dispatch(
      changeContractState({
        contractId,
        backToEdit,
      }),
    );

    const docEditor = window.DocEditor.instances.docxEditor;
    docEditor && docEditor.destroyEditor();

    setEditorLoadingState(true);

    setTimeout(() => {
      (async () => {
        await dispatch(fetchConfigByContractId(contractId));
        setEditorLoadingState(false);
      })();
    }, 10000);

    if (stateBtnRef.current) {
      stateBtnRef.current.disabled = false;
    }
  };

  const initiateNextStep = (backToEdit: boolean = false) => {
    if (!backToEdit && activeStagePreContract === 3) {
      childRef.current && childRef.current.checkTrackChangesRequestQueue(true);
      return;
    }
    if (contractId && activeStagePreContract < 6) {
      callNextStep(backToEdit);
    }
    if (activeStagePreContract === 6) {
      toggleModal();
    }
  };

  const handleDownload = () => {
    preContractPdf &&
      preContractPdf !== "" &&
      downloadFileFromBlobUrl(base64toBlob(preContractPdf), contractName);
  };

  const handleNextChanges = () => {
    const connector = childRef.current.getConnector();
    connector.executeMethod("MoveToNextReviewChange", [true]);
  };

  const handleAcceptChanges = () => {
    const connector = childRef.current.getConnector();
    connector.executeMethod("AcceptReviewChanges");
    childRef.current.checkTrackChangesRequestQueue();
    setTimeout(() => {
      handleNextChanges();
    }, 500);
  };

  const handleRejectChanges = () => {
    const connector = childRef.current.getConnector();
    connector.executeMethod("RejectReviewChanges");
    childRef.current.checkTrackChangesRequestQueue();
    setTimeout(() => {
      handleNextChanges();
    }, 500);
  };

  useEffect(() => {
    let fetchWorkCompleteStatus: any;
    if (activeStagePreContract > 1) {
      fetchWorkCompleteStatus = setInterval(checkWorkComplete, 5000);
    }
    if (isSignComplete && activeStagePreContract === 5) {
      dispatch(clearDocusign());
      dispatch(fetchConfigByContractId(decodedContractId));
    }
    return () => {
      clearInterval(fetchWorkCompleteStatus);
    };
  }, [isWorkInProgress, activeStagePreContract, isSignComplete]);

  useEffect(() => {
    return () => {
      dispatch(clearApprovalListData());
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      setContractNameError(null);
    }
  }, [isLoading]);

  useEffect(() => {
    let fetchWorkCompleteStatus: any;
    if (activeStagePreContract < 3) {
      fetchWorkCompleteStatus = setInterval(() => {
        setInterValCount(Math.random());
      }, 3000);
    }

    return () => clearInterval(fetchWorkCompleteStatus);
  }, [activeStagePreContract]);

  useEffect(() => {
    if (contractName !== "" && !canEdit && existingContractTypeId && activeStagePreContract < 3) {
      saveContract();
    } else {
      if (
        contractName !== "" &&
        canEdit &&
        existingContractTypeId &&
        activeStagePreContract === 2
      ) {
        saveContract();
      }
    }
  }, [interValCount]);

  useEffect(() => {
    dispatch(fetchContractType());

    return () => {
      dispatch(clearEditorConfig());
    };
  }, []);

  useEffect(() => {
    if (contractName) {
      setInputWidth(Math.min(Math.max(contractName.length * 8, 170), 800));
    }
  }, [contractName]);

  useEffect(() => {
    if (decodedContractId > 0) {
      dispatch(fetchConfigByContractId(decodedContractId));
    }

    return () => {
      dispatch(clearPreContractData());
      dispatch(clearTemplateData());
    };
  }, [decodedContractId]);

  useEffect(() => {
    if (!contractId) {
      dispatch(setContractName(templateName || ""));
    }
  }, [templateName, contractId]);

  useEffect(() => {
    if (contractTypeId) {
      dispatch(setContractTypeId(contractTypeId));
    }
  }, [contractTypeId]);

  useEffect(() => {
    window.addEventListener("click", () => {
      setDownloadDropdown(false);
    });
    return () => {
      dispatch(clearPreContractData());
    };
  }, []);

  const handleExpandEditor = () => {
    dispatch(setExpandEditorState(!expandEditor))
  }

  return (
    <>
      <div className={`left-section ${expandEditor ? "expand-view" : ""}`}>
        <div className="left-section-inner relative" style={{ overflow: "hidden" }}>
          {/* Inner HTML */}
          {config && activeStagePreContract < 5 ? (
            <div
              onClick={() => {
                handleExpandEditor();
                // setExpandEditor(!expandEditor)
              }}
              className={`hide-side-panel-btn button-tool-tip ${expandEditor ? "r90" : ""}`}
            >
              <i className="drop-arrow-ic"></i>
              <div className="button-info">
                {expandEditor ? "Show Side Panel" : "Expand Editor"}
              </div>
            </div>
          ) : (
            ""
          )}
          <div className="ck-editor-sec">
            {!expandEditor && <div className="left-inner-sticky">
              <div className="app-breadcrumbs">
                <button
                  className="back-btn"
                  onClick={() => {
                    dispatch(clearDocusign());
                    navigate(`/${ROUTE_ADMIN}/${ROUTE_PRE_DRAFTS}`);
                  }}
                >
                  <i className="icon-img" />
                </button>
                {preSignedUrl === "" && (
                  <div className="contract-name-wrap contract-truncate1">
                    {isContractCreator && activeStagePreContract < 3 ? (
                      <input
                        ref={contractInputRef}
                        value={contractName}
                        style={{
                          width: inputWidth ? `${inputWidth}px` : "initial",
                        }}
                        disabled={createdby !== profileID && !isNameFieldEnabled}
                        onChange={(e) => {
                          if (e.target.value) {
                            contractInputRef.current &&
                              contractInputRef.current.classList.remove("contract-name-input");
                            setContractNameError(null);
                          } else {
                            contractInputRef.current &&
                              contractInputRef.current.classList.add("contract-name-input");
                            setContractNameError("Please Fill Contract Name!");
                          }
                          dispatch(setContractName(e.target.value));
                          const inputWidth = Math.min(
                            Math.max(e.target.value.length * 8, 170),
                            800,
                          ); // Adjust the factor based on your font size and style
                          if (contractInputRef.current) {
                            contractInputRef.current.style.width = `${inputWidth}px`;
                          }
                        }}
                        onBlur={() => {
                          contractInputRef.current &&
                            contractInputRef.current.classList.remove("contract-name-input");
                          setContractNameError(null);
                        }}
                        onFocus={() => {
                          if (contractInputRef.current) {
                            contractInputRef.current.select(); // Select all text on focus
                          }
                        }}
                        type="text"
                        className="input-name"
                        placeholder="Enter Contract Name"
                      />
                    ) : (
                      <span className="fs12 font-bold">{contractName}</span>
                    )}
                  </div>
                )}

                {contractNameError && (
                  <div className="contract-input-error">{contractNameError}</div>
                )}
              </div>
              <div className="flex items-center">
                <ul className="app-tab-style" id="tabs-nav">
                  {createdby === profileID &&
                    activeStagePreContract > 2 &&
                    activeStagePreContract < 6 &&
                    isSigningShareAndInitiated &&
                    isContractCreator ? (
                    <li className="active" onClick={() => initiateNextStep(true)}>
                      <a>Open for Edit</a>
                    </li>
                  ) : (
                    ""
                  )}
                </ul>
                {/* END tabs-nav */}
                <span className="grow" />

                <div
                  className="relative word-count"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <p className="inline-block" style={{ display: "none" }}>
                    Words <strong>2400</strong>, Pages <strong>12 - Autosaved 12:45PM</strong>
                  </p>
                  {!savePreContractError && contractLastUpdate ? (
                    <p className="inline-block">
                      <strong>Autosaved {moment(contractLastUpdate).format("hh:mm:ss A")}</strong>
                    </p>
                  ) : (
                    ""
                  )}
                  {savePreContractError && (
                    <p className="inline-block">
                      <strong>Autosave Error: Please Try After Sometime</strong>
                    </p>
                  )}
                  {isLoading || officeIsLoading ? <ButtonLoader /> : ""}
                  {activeStagePreContract === 6 && (
                    <div className="relative drop-down-modal">
                      <button
                        disabled={!preContractPdf}
                        className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase "
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
                  {createdby === profileID &&
                    activeStagePreContract === 3 &&
                    reviews &&
                    JSON.stringify(reviews) !== "{}" && (
                      <>
                        <button
                          className="button-dark-gray rounded-12 sm-button tracking-wider ml-2"
                          style={{ background: "#0000", color: "#5c677d", letterSpacing: 0 }}
                        >
                          {getPendingTrackChanges(reviews)} track changes left
                        </button>

                        <button
                          title="Accept Changes"
                          className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer ml-3"
                          onClick={handleAcceptChanges}
                          disabled={!(activeStagePreContract === 3)}
                        >
                          Accept
                        </button>
                        <button
                          title="Reject Changes"
                          className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer ml-3"
                          onClick={handleRejectChanges}
                          disabled={!(activeStagePreContract === 3)}
                        >
                          Reject
                        </button>
                      </>
                    )}

                  <>
                    {contractId &&
                      key &&
                      createdby === profileID &&
                      isContractCreator &&
                      existingContractTypeId ? (
                      <div className="button-tool-tip">
                        {activeStagePreContract === 5 && preContractPdf === null && (
                          <div className="button-info">
                            Contract is not ready for signing, please try after sometime.
                          </div>
                        )}
                        <button
                          ref={stateBtnRef}
                          onClick={() => initiateNextStep()}
                          className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer ml-3"
                          disabled={
                            (activeStagePreContract === 5 &&
                              (!isApprovalComplete || preContractPdf === null)) ||
                            (activeStagePreContract === 6 && postContractId > 0)
                          }
                        >
                          {activeStagePreContract === 1 ? "Initiate Collaboration" : ""}
                          {activeStagePreContract === 2 ? "Initiate Review" : ""}
                          {activeStagePreContract === 3 ? "Initiate Approvals" : ""}
                          {activeStagePreContract === 4 ? "Initiate Signing" : ""}
                          {activeStagePreContract === 5 ? "Initiate Complete" : ""}
                          {activeStagePreContract === 6
                            ? postContractId > 0
                              ? "Moved"
                              : "Move"
                            : ""}
                        </button>
                      </div>
                    ) : null}
                  </>
                </div>
              </div>
            </div>}
            <div
              className="editor-inner-content"
              style={{
                display: `${preSignedUrl !== "" ? "none" : ""}`,
                overflowY: "auto",
              }}
            >
              {preSignedUrl === "" &&
                (activeStagePreContract > 4 && preContractPdf ? (
                  <ContractViewer file={preContractPdf} />
                ) : (
                  ""
                ))}
              <div
                style={{
                  display: `${activeStagePreContract > 4 && preContractPdf ? "none" : ""}`,
                  height: "100%",
                }}
              >
                <>
                  {editorLoadingState && <LoaderSection loaderLabel="Loading document" />}
                  <div style={{ height: "100%" }}>
                    <Editor
                      ref={childRef}
                      getReviewData={getReviewData}
                      contractId={contractId || decodedContractId}
                      setEditorLoadingState={setEditorLoadingState}
                    />
                  </div>
                </>
              </div>
            </div>
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

export default PreContract;

export const reducer = {
  preContract: preContractReducer,
  contractApprovals: contractApprovalReducer,
  collaboration: collaborationReducer,
  contract: contractReducer,
  headerSearchContract: headerSearchdReducer,
  docusign: docusignReducer,
  onlyOfficeEditor: onlyOfficeEditorReducer,
  templates: TemplatesReducer,
  dashboard: dashboardReducer,
  teamDashboard: teamDashboardReducer,
  team: teamReducer,
  playbook: playbookReducer,
};
