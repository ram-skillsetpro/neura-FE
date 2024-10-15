import QuesAns from "pages/pre-contract/right-section-preContract/question-ans";

import React, { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ButtonLoader } from "src/core/components/loader/button-loader";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import {
  encodeFilePreContractKey,
  getAuth,
  getUploadFileTypeIcon,
  handleInvalidFile,
  isValidFileSize,
} from "src/core/utils";
import { checkUserAuthrity } from "src/pages/user-dashboard/common-utility/utility-function";
import {
  clearDataSearchTemplate,
  fetchLatestTemplate,
  fetchLatestTemplateSuccesss,
  fileUploadPreContract,
  getContentCkEditor,
  searchContractTemplate,
  setContractTypeError,
  setContractTypeId,
} from "../pre-contract.redux";

const UploadFilePreContract: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const {
    AutoSearchTemplate,
    latestTemplate,
    contractTypeError,
    contractTypeId,
    isLoading: fetchTemplatesLoading,
  } = useAppSelector((state) => state.preContract);
  const [searchInput, setSearchInput] = useState("");
  const [isSecondDivVisible, setSecondDivVisible] = useState(true);
  const isLoading = useAppSelector((state) => state.preContract.isFileUplaodLoading);
  const dispatch = useAppDispatch();
  const { contractTypes } = useAppSelector((state) => state.contract);
  const { profileId } = getAuth();
  const { createdby } = useAppSelector((state) => state.preContract);
  const { getEditorConfigReps } = useAppSelector((state) => state.onlyOfficeEditor);
  const { config } = getEditorConfigReps || {};

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      handleInvalidFile("Please select a file.");
      return;
    }

    if (!isValidFileSize(selectedFile)) {
      handleInvalidFile("File size exceeds the maximum limit (10MB).");
      return;
    }
    handleFileUpload(selectedFile);
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    try {
      const obj = {
        file,
        contractTypeId,
        contractFlag: 1,
      };

      dispatch(fileUploadPreContract(obj));
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setSearchInput(newInput);
    if (newInput.length > 2) {
      dispatch(fetchLatestTemplateSuccesss([]));
      dispatch(searchContractTemplate(newInput));
    } else {
      dispatch(clearDataSearchTemplate());
    }
  };

  const handleSelectAutoSuggest = async (id: number) => {
    const cid = await dispatch(getContentCkEditor(id));
    if (cid) {
      const encodedString = encodeFilePreContractKey({ contractId: cid });
      navigate("/admin/pre-contract?key=" + encodedString, { replace: true });
    }
  };

  useEffect(() => {
    dispatch(fetchLatestTemplateSuccesss([]));
    dispatch(fetchLatestTemplate({ contractTypeId }));
    return () => {
      dispatch(clearDataSearchTemplate());
    };
  }, [contractTypeId]);

  return (
    <>
      {!config ? (
        <div className="wizard-elements">
          <div className="wizard-component">
            <h5
              className="h5 ml-3 mt-8 flex items-center heading-collapse arrow-down"
              data-toggle-target=".tab-upload-file"
              onClick={() => setSecondDivVisible(!isSecondDivVisible)}
            >
              Start from an Existing Contract on your Computer <i className="forward-arrow1" />
            </h5>
            {isSecondDivVisible && (
              <div className="box-component mb-6 tab-upload-file active">
                <h4 className="box-heading">You don{"'"}t have any Templates or Document saved?</h4>
                <div className="box-content">
                  <p>
                    Templates enable you to start creating any contract effortlessly.Please upload a
                    verified document here to use as a template and our system will create a
                    playbook out of it.
                  </p>
                  {isLoading ? (
                    <ButtonLoader />
                  ) : (
                    <button className="button-grey-upload box-btn rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
                      upload{" "}
                      <div className="input-file">
                        <input
                          type="file"
                          className="upload-light"
                          accept=".pdf,.doc,.docx,.zip"
                          onChange={handleFileChange}
                        />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {!key || !checkUserAuthrity(createdby, profileId) ? (
            <div className="contract-name-wrap w-full mb-6">
              <select
                className="custom-select w-full p-2"
                value={contractTypeId}
                onChange={(e) => {
                  dispatch(setContractTypeError(null));
                  dispatch(setContractTypeId(Number(e.target.value)));
                }}
              >
                <option value={0}>Contract Type</option>
                {contractTypes.map((data, index) => (
                  <option key={index} value={data.id}>
                    {data.name}
                  </option>
                ))}
              </select>
              {contractTypeId === 0 && (
                <div className="contract-input-error mt-3">{contractTypeError}</div>
              )}
            </div>
          ) : (
            ""
          )}

          <div className="wizard-component">
            <h5
              className="h5 ml-3 mt-8 flex items-center heading-collapse"
              data-toggle-target=".tab-search-list"
            >
              Select{" "}
              {contractTypes?.filter((contract) => contract.id === contractTypeId)[0]?.name || ""}{" "}
              Template{" "}
            </h5>
            <div className="box-component p-0 bg-none rounded-6  mb-6 tab-search-list active">
              <div className="box-card-bg1 rounded-6">
                <div className="wizard-search p-3">
                  <div className="wizard-search-inner">
                    <form>
                      <input
                        onChange={handleInputChange}
                        type="search"
                        value={searchInput}
                        placeholder="Search ..."
                      />
                    </form>
                  </div>
                </div>
                {AutoSearchTemplate.length > 0 ? (
                  <div className="data-card rounded-6  font-normal">
                    <ul>
                      {AutoSearchTemplate.map((user) => (
                        <li key={user.id} onClick={() => handleSelectAutoSuggest(user.id)}>
                          <div className="flex items-center cursor-pointer">
                            <span className="fs11">{user.templateName}</span>
                            <span className="grow"></span>
                            <button className="forward-btn">
                              <i className="forward-arrow1" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : latestTemplate.length > 0 ? (
                  <div className="data-card rounded-6  font-normal">
                    <ul>
                      {latestTemplate.map((user) => (
                        <li key={user.id} onClick={() => handleSelectAutoSuggest(user.id)}>
                          <div className="flex items-center cursor-pointer">
                            <img
                              className="w-20 h-20 mr-5"
                              src={require(
                                `assets/images/icon-${getUploadFileTypeIcon(
                                  user.uploadFileType,
                                )}.svg`,
                              )}
                            />
                            <span className="fs11">{user.templateName}</span>
                            <span className="grow"></span>
                            <button className="forward-btn">
                              <i className="forward-arrow1" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : fetchTemplatesLoading ? (
                  <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3 pb-1">
                    Loading...
                  </h4>
                ) : (
                  <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3 pb-1">
                    No templates found!
                  </h4>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="wizard-elements">
          <QuesAns />
        </div>
      )}
    </>
  );
};

export default UploadFilePreContract;
