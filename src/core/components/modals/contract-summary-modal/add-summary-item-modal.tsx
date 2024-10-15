import React, { useEffect, useState } from "react";
import { ToastContent } from "react-toastify";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { CommonService } from "src/core/services/common.service";
import { ExtractedSummary } from "src/pages/contract/contract.model";
import { readSideBarContent, updateSummary } from "src/pages/contract/contract.redux";
import { Loader } from "../../loader/loader.comp";
import AppModal from "../app-modal";
import { AppModalType } from "../app-modal.model";
import "./edit-summary-item-modal.scss";

interface AddSummaryModalType extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  mainClauseData: any[];
  pdfContent: { text: string };
  summary: string;
  fileId: number;
  teamId: number;
  folderId: number;
}

const AddSummaryModal: React.FC<AddSummaryModalType> = ({
  isOpen,
  onClose,
  mainClauseData,
  pdfContent,
  summary,
  fileId,
  teamId,
  folderId,
  shouldCloseOnOverlayClick,
}) => {
  const [rules, setRules] = useState<{ key?: string; value?: string; error?: string; id?: number; parentId: number; }[]>([]); // Initialize with an empty rule
  const [newClauseHeading, setNewClauseHeading] = useState<string>("");
  const [headingError, setHeadingError] = useState<string>("");
  const [keyError, setKeyError] = useState<string>("");
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.contract.isUpdateSummaryLoading);

  // @ts-ignore
  const updateNestedKey = (arr, targetKey, newValue) => {
    // @ts-ignore
    return arr.map((item) => {
      if (item.key === targetKey) {
        return { ...item, value: newValue };
      } else if (Array.isArray(item.value)) {
        return { ...item, value: updateNestedKey(item.value, targetKey, newValue) };
      } else {
        return item;
      }
    });
  };

  const saveClause = async () => {
    let isValidated = true;
    if (rules) {
      rules.map((item) => {
        if (item.error && item.error != "") {
          return (isValidated = false);
        }
      });
      rules.map((item) => {
        if (item.key === "" || item.value === "") {
          return (isValidated = false);
        }
      });
      if (newClauseHeading === "" || newClauseHeading.length > 30) {
        CommonService.toast({
          type: "error",
          message: "Clause heading should not be empty and charchter limit < 30" as ToastContent,
        });
      } else if (isValidated) {
        const newClause = {
          key: newClauseHeading,
          value: rules,
        };

        const newData = [...mainClauseData, newClause];

        const payload: ExtractedSummary = {
          extractedJson: JSON.stringify({
            summary,
            data: newData,
          }),
          fileId,
          teamId,
          folderId,
        };
        // @ts-ignore
        const result = await dispatch(updateSummary(payload));
        if (result?.isSuccess) {
          onClose();
          dispatch(readSideBarContent({ fileId, teamId, folderId }));
        }
      } else {
        CommonService.toast({
          type: "error",
          message: "Clause key should not be empty and charachter limit < 30" as ToastContent,
        });
      }
    } else {
      CommonService.toast({
        type: "error",
        message: "Please add some extract blank" as ToastContent,
      });
    }
  };

  // Function to handle adding a new rule
  const addRule = () => {
    const newId = Math.floor(Math.random() * 10000000000);
    setRules([...rules, { key: "", value: "", error: "", id: newId, parentId: 0 }]);
  };

  // Function to handle removing a rule
  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  };

  const handleRuleChange = (index: number, field: string, value: string) => {
    const newRules = [...rules];
    // @ts-ignore
    newRules[index][field] = value;

    // Reset keyError if the new key is within the limit
    if (field === "key") {
      if (value.length > 30) {
        newRules[index].error = "Please create clause key with in the limit of 30 charachters";
      } else {
        newRules[index].error = "";
      }
    }
    setRules(newRules);
  };

  const onChangeClauseHeading = (clauseHeading: string) => {
    if (clauseHeading.length <= 30) {
      setHeadingError("");
    } else {
      setHeadingError("Please create clause heading in limit < 30 charachters");
    }
    setNewClauseHeading(clauseHeading);
  };

  useEffect(() => {
    setRules([{ key: "Definition", value: pdfContent?.text }]);
    setHeadingError("");
  }, [pdfContent]);

  return (
    <>
      {isLoading && <Loader />}
      <AppModal
        isOpen={isOpen}
        onClose={onClose}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      >
        <div className="share-outer-wrap">
          {/* share-inner div start below */}
          <div className="share-inner">
            <div className="w-full">
              <div className="fs14 font-bold mb-3 text-body">Add New Clause</div>
              <div className="clause-edit-heading">
                <div className="pb-2">
                  <input
                    type="text"
                    className="edit-input"
                    placeholder="New Clause Heading"
                    onChange={(e) => {
                      onChangeClauseHeading(e.target.value);
                    }}
                  />
                  {headingError.length > 0 && (
                    <div className="error-message1 font-normal">{headingError}</div>
                  )}
                </div>
                <ul className="shared-user-list-scroll mb-5" style={{ display: "block" }}>
                  {rules.map((rule, index) => (
                    <li key={index} className="pb-2">
                      <div className="info-row">
                        <div className="info-row-left">
                          <span className="block">
                            <input
                              type="text"
                              className={`edit-input ${rule.error ? "border-red-500" : ""} p-2 mb-2 mr-2`}
                              placeholder="Please add key"
                              value={rule.key}
                              onChange={(e) => handleRuleChange(index, "key", e.target.value)}
                            />
                            {rule.error && <div className="error-message1">{rule.error}</div>}
                          </span>
                        </div>
                        <div className="info-row-right">
                          <p className="block">
                            <textarea
                              className="edit-input"
                              value={rule.value}
                              onChange={(e) => handleRuleChange(index, "value", e.target.value)}
                              rows={1}
                            />
                          </p>
                        </div>
                        <div className="button-tool-tip relative mt-3">
                          <button
                            className="trash-btn"
                            type="button"
                            onClick={() => removeRule(index)}
                          ></button>
                          <div className="button-info">Remove this from extraction</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end pt-2 mb-5 mr-3">
                  <button
                    onClick={addRule}
                    className="button-green rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer mr-2-5"
                  >
                    <i className="font-bold fs10">+</i> New Extracts
                  </button>
                </div>
                <div className="flex justify-center pt-2">
                  <button
                    className="button-red rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer mr-2-5"
                    onClick={saveClause}
                  >
                    Save Clause Extracts
                  </button>

                  {/* <div className="button-tool-tip relative">
                      <button className="trash-btn ml-3" type="button"></button>
                      <div className="button-info">Remove this from extraction</div>
                    </div> */}
                </div>
                {/* <div className="pb-2">
          <select id="keys" value={selectedKey} onChange={e => selectKeys(e)} className="custom-select edit-select w-full p-2">
            {allKeys.map((item) => {
              return <option value={item.label}>{item.label}</option>
            })}
          </select>
        </div>
        <div className="pb-2">
          <input type="text" className="edit-input" value="New Clause Heading" />
        </div> */}
              </div>
            </div>
          </div>
        </div>
      </AppModal>
    </>
  );
};

export default AddSummaryModal;
