import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { handleInvalidFile, isValidFileSize } from "src/core/utils";
import AddFieldForm from "./add-quesans-template";

import {
  fileUploadPreContract,
  setContractTypeId,
} from "src/pages/pre-contract/pre-contract.redux";
import { setTemplateTypeError } from "src/pages/pre-dashboard/templates/templates.redux";

const UploadTemplate: React.FC = () => {
  const { contractTypeError } = useAppSelector((state) => state.templates);
  const [isSecondDivVisible, setSecondDivVisible] = useState(true);
  const isLoading = useAppSelector((state) => state.preContract.isFileUplaodLoading);
  const dispatch = useAppDispatch();
  const { contractTypes } = useAppSelector((state) => state.contract);
  const { contractTypeId } = useAppSelector((state) => state.preContract);
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
    const obj = {
      file,
      contractTypeId,
      contractFlag: 0,
    };
    dispatch(fileUploadPreContract(obj));
    // if (file.name.endsWith(".docx") || file.name.endsWith(".dotx")) {
    //   const reader = new FileReader();
    //   reader.onload = async (event) => {
    //     const arrayBuffer = event.target?.result as ArrayBuffer;
    //     const text = new Uint8Array(arrayBuffer);
    //     const result = await convertToHtml({ arrayBuffer: text });
    //     const htmlResult = result.value;
    //     dispatch(contentCkEditorOffline(htmlResult));
    //   };
    //   reader.readAsArrayBuffer(file);
    // } else {
    //   CommonService.toast({
    //     type: "error",
    //     message: "File type is not supported",
    //   });
    //   return;
    // }
    // try {
    // } catch (error) {
    //   console.error("Error while fetching data:", error);
    // }
  };

  return (
    <div className="wizard-elements">
      <div className="wizard-component">
        <h5
          className="h5 ml-3 mt-8 flex items-center heading-collapse arrow-down"
          data-toggle-target=".tab-upload-file"
          onClick={() => setSecondDivVisible(!isSecondDivVisible)}
        ></h5>
        {!config && isSecondDivVisible && (
          <div className="box-component mb-6 tab-upload-file active">
            <h4 className="box-heading">You don't have any Templates or Document saved?</h4>
            <div className="box-content">
              <p>
                Templates enable you to start creating any contract effortlessly.Please upload a
                verified document here to use as a template and our system will create a playbook
                out of it.
              </p>
              {isLoading ? (
                <div className="simpleO-loader"></div>
              ) : (
                <button className="button-grey-upload box-btn rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
                  upload{" "}
                  <div className="input-file">
                    <input
                      type="file"
                      className="upload-light"
                      accept=".pdf, .doc, .docx, application/pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="contract-name-wrap w-full mb-6">
        <select
          className="custom-select w-full p-2"
          value={contractTypeId}
          onChange={(e) => {
            dispatch(setTemplateTypeError(null));
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
      <AddFieldForm />
    </div>
  );
};

export default UploadTemplate;
