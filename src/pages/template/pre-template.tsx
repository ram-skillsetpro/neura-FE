import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import moment from "moment";
import { clearPreContractData, preContractReducer, setExpandEditorState } from "pages/pre-contract/pre-contract.redux";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import { ButtonLoader } from "src/core/components/loader/button-loader";
import { LoaderSection } from "src/core/components/loader/loaderSection.comp";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { decodeFilePreTemplateKey, encodeFilePreTemplateKey } from "src/core/utils";
import { headerSearchdReducer } from "src/layouts/admin/components/admin-header/header-auth.redux";
import { contractReducer, fetchContractType } from "../contract/contract.redux";
import Editor from "../pre-contract/contract-editor/only-office-editor/editor";
import {
  clearEditorConfig,
  fetchConfigByTemplateId,
  onlyOfficeEditorReducer,
} from "../pre-contract/contract-editor/only-office-editor/onlyoffice.redux";
import "../pre-contract/pre-contract.scss";
import {
  TemplatesReducer,
  clearTemplateData,
  saveTemplateData,
  setContractTypeId,
  setTemplateName,
  setTemplateTypeError,
} from "../pre-dashboard/templates/templates.redux";
import RightSection from "./right-section-template/right-section-template";

const PreTemplate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const contractInputRef = useRef<HTMLInputElement | null>(null);
  const [contractNameError, setContractNameError] = useState<any>(null);
  const isContractCreator = useAuthorityCheck([USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR]);
  const [inputWidth, setInputWidth] = useState<number>();
  const [interValCount, setInterValCount] = useState(0);
  const [editorLoadingState, setEditorLoadingState] = useState<boolean>(false);
  // const [expandEditor, setExpandEditor] = useState<boolean>(false);

  const { id: decodedTemplateId, isGlobalTemplate } = decodeFilePreTemplateKey(key || "");
  const saveBtnRef = useRef<HTMLButtonElement | null>(null);

  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const profileID = authData?.profileId ? authData.profileId : "";

  const {
    templateName,
    templateId,
    isLoading,
    isSaving,
    questionaireArray,
    templateLastUpdate,
    saveTemplateError,
  } = useAppSelector((state) => state.templates);

  const { expandEditor } = useAppSelector((state) => state.preContract);

  const { getEditorConfigReps, templatePublishStatus } = useAppSelector(
    (state) => state.onlyOfficeEditor,
  );
  const { config, createdBy } = getEditorConfigReps || {};
  const { contractTypeId: existingContractTypeId } = useAppSelector((state) => state.preContract);

  const saveTemplate = async (status: number, showMessage: boolean = false) => {
    if (isGlobalTemplate === "YES" && createdBy === 0) {
      return;
    }
    if (contractInputRef.current) {
      contractInputRef.current.classList.remove("contract-name-input");
    }
    if (templateName === "") {
      if (contractInputRef.current) {
        contractInputRef.current.classList.add("contract-name-input");
        contractInputRef.current.focus();
      }
      setContractNameError("Please Fill Template Name!");
      return;
    }

    if (!existingContractTypeId && isContractCreator) {
      dispatch(setTemplateTypeError("Please Select Contract Type"));
      return;
    }

    const markerJson = JSON.stringify({ questionaire: questionaireArray });
    if (saveBtnRef.current) {
      saveBtnRef.current.disabled = true;
    }

    const payload: any = {
      contractTypeId: undefined,
      templateName,
      markerJson,
      templateText: "{}",
      templateId: decodedTemplateId || templateId || 0,
      status,
      showMessage,
    };

    if (existingContractTypeId) {
      payload.contractTypeId = existingContractTypeId;
    }

    const id = await dispatch(saveTemplateData(payload));

    if (id) {
      if (saveBtnRef.current) {
        saveBtnRef.current.disabled = false;
      }
      const encodedString = encodeFilePreTemplateKey({ id });
      navigate("/admin/pre-template?key=" + encodedString, { replace: true });
    }
  };

  const renderSaveBtn = () => {
    return (
      <>
        {isSaving ? <ButtonLoader /> : ""}
        <>
          {config && createdBy === profileID ? (
            <button
              onClick={() => {
                !templatePublishStatus ? saveTemplate(1, true) : saveTemplate(0, true);
              }}
              className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer ml-3"
              disabled={!existingContractTypeId}
            >
              {!templatePublishStatus ? "Publish" : "Unpublish"}
            </button>
          ) : (
            ""
          )}
        </>
      </>
    );
  };

  useEffect(() => {
    if (isLoading) {
      setContractNameError(null);
    }
  }, [isLoading]);

  useEffect(() => {
    let fetchWorkCompleteStatus: any;
    if (templateId) {
      fetchWorkCompleteStatus = setInterval(() => {
        setInterValCount(Math.random());
      }, 3000);
    }

    return () => clearInterval(fetchWorkCompleteStatus);
  }, [templateId]);

  useEffect(() => {
    if (templateName !== "" && existingContractTypeId && templateId) {
      saveTemplate(templatePublishStatus);
    }
  }, [interValCount]);

  useEffect(() => {
    dispatch(fetchContractType());

    return () => {
      dispatch(clearEditorConfig());
    };
  }, []);

  useEffect(() => {
    if (decodedTemplateId > 0) {
      dispatch(fetchConfigByTemplateId(decodedTemplateId, isGlobalTemplate));
    }

    return () => {
      dispatch(clearTemplateData());
      dispatch(clearPreContractData());
    };
  }, [decodedTemplateId]);

  useEffect(() => {
    if (!templateId) {
      dispatch(setTemplateName(templateName || ""));
    }
  }, [templateName, templateId]);

  useEffect(() => {
    if (existingContractTypeId) {
      dispatch(setContractTypeId(existingContractTypeId));
    }
  }, [existingContractTypeId]);

  useEffect(() => {
    if (templateName) {
      setInputWidth(Math.min(Math.max(templateName.length * 8, 170), 800));
    }
  }, [templateName]);

  return (
    <>
      <div className={`left-section ${expandEditor ? "expand-view" : ""}`}>
        <div className="left-section-inner relative" style={{ overflow: "hidden" }}>
          <div
            onClick={() => {
              // setExpandEditor(!expandEditor)
              dispatch(setExpandEditorState(!expandEditor))
            }}
            className={`hide-side-panel-btn button-tool-tip ${expandEditor ? "r90" : ""}`}
          >
            <i className="drop-arrow-ic"></i>
            <div className="button-info">{expandEditor ? "Show Side Panel" : "Expand Editor"}</div>
          </div>
          <div className="ck-editor-sec">
            {!expandEditor &&
              <div className="left-inner-sticky">
                <div className="app-breadcrumbs">
                  <button className="back-btn" onClick={() => navigate(-1)}>
                    <i className="icon-img" />
                  </button>
                  <div
                    className="contract-name-wrap tool-tip-text relative"
                    data-fulltext={templateName}
                  >
                    <input
                      ref={contractInputRef}
                      value={templateName}
                      style={{
                        width: inputWidth ? `${inputWidth}px` : "initial",
                      }}
                      disabled={!config}
                      onChange={(e) => {
                        if (e.target.value) {
                          contractInputRef.current &&
                            contractInputRef.current.classList.remove("contract-name-input");
                          setContractNameError(null);
                        } else {
                          contractInputRef.current &&
                            contractInputRef.current.classList.add("contract-name-input");
                          setContractNameError("Please Fill Template Name!");
                        }
                        dispatch(setTemplateName(e.target.value));
                        const inputWidth = Math.min(Math.max(e.target.value.length * 8, 170), 800); // Adjust the factor based on your font size and style
                        if (contractInputRef.current) {
                          contractInputRef.current.style.width = `${inputWidth}px`;
                        }
                      }}
                      onBlur={() => {
                        contractInputRef.current &&
                          contractInputRef.current.classList.remove("contract-name-input");
                        setContractNameError(null);
                      }}
                      type="text"
                      className="input-name"
                      placeholder="Enter Template Name"
                    />
                  </div>

                  {contractNameError && (
                    <div className="contract-input-error">{contractNameError}</div>
                  )}
                </div>
                <div className="flex items-center">
                  <ul className="app-tab-style" id="tabs-nav"></ul>

                  <span className="grow" />

                  <div
                    className="relative word-count flex"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <p className="inline-block" style={{ display: "none" }}>
                      Words <strong>2400</strong>, Pages <strong>12 - Autosaved 12:45PM</strong>
                    </p>
                    {templateLastUpdate ? (
                      <p className="inline-block">
                        <strong>Autosaved {moment(templateLastUpdate).format("hh:mm:ss A")}</strong>
                      </p>
                    ) : (
                      ""
                    )}
                    {saveTemplateError && (
                      <p className="inline-block">
                        <strong>Autosave Error: Please Try After Sometime</strong>
                      </p>
                    )}
                    {!(isGlobalTemplate === "YES" && createdBy === 0) && renderSaveBtn()}
                  </div>
                </div>
              </div>
            }
            <div className="editor-inner-content">
              <>
                {editorLoadingState && <LoaderSection loaderLabel="Loading document" />}
                <div style={{ height: "100%" }}>
                  <Editor
                    documentType="TEMPLATE"
                    templateId={templateId || decodedTemplateId}
                    setEditorLoadingState={setEditorLoadingState}
                  />
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
      <RightSection createdBy={createdBy} isGlobalTemplate={isGlobalTemplate} />
    </>
  );
};

export default PreTemplate;

export const reducer = {
  preContract: preContractReducer,
  contract: contractReducer,
  headerSearchContract: headerSearchdReducer,
  templates: TemplatesReducer,
  onlyOfficeEditor: onlyOfficeEditorReducer,
};
