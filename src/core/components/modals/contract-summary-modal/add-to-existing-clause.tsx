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

interface AddExsitingClauseSummary extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  mainClauseData: any[];
  pdfContent: { text: string };
  summary: string;
  fileId: number;
  teamId: number;
  folderId: number;
}

const AddToExisitingClauseModal: React.FC<AddExsitingClauseSummary> = ({
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
  const [rules, setRules] = useState<{ key?: string; value?: string; error?: string; }[]>([]); // Initialize with an empty rule
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.contract.isUpdateSummaryLoading);
  const [subClauseLevel1, setSubClauseLevel1] = useState<Array<any>>([]);
  const [subClauseLevel2, setSubClauseLevel2] = useState<Array<any>>([]);
  const [subClauseLevel3, setSubClauseLevel3] = useState<Array<any>>([]);
  const [level1Key, setLevel1Key] = useState<string>('');
  const [level2Key, setLevel2Key] = useState<string>('');
  const [level3Key, setLevel3Key] = useState<string>('');
  const [level4Key, setLevel4Key] = useState<string>('');

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
    if (level1Key === "" && level2Key === "" && level3Key === "" && level4Key === "") {
      CommonService.toast({
        type: "error",
        message: ("Please select clause to add into existing...") as ToastContent,
      });
    }
    else if (rules.length === 0) {
      CommonService.toast({
        type: "error",
        message: ("Extracts are empty, please add extracts...") as ToastContent,
      });
    } else {
      rules.map((item) => {
        if (item.error && item.error != '') {
          return isValidated = false;
        }
      })
      rules.map((item) => {
        if (item.key === "" || item.value === "") {
          return isValidated = false;
        }
      })
      if (isValidated) {
        let updatedMainClauseData = [...mainClauseData];

        const newRules = rules.map((rule) => ({
          key: rule.key,
          value: rule.value
        }))

        // @ts-ignore
        const updateData = (data: any[], key: string, rules: any[]): any[] => {
          return data.map(item => {
            if (item.id === parseInt(key)) {
              return { ...item, value: Array.isArray(item.value) ? [...item.value, ...rules] : rules };
            } else if (Array.isArray(item.value)) {
              return { ...item, value: updateData(item.value, key, rules) };
            }
            return item;
          });
        };

        if (level1Key && level2Key === "" && level3Key === "" && level4Key === "") {
          updatedMainClauseData = updateData(updatedMainClauseData, level1Key, newRules);
        }
        if (level2Key && level3Key === "" && level4Key === "") {
          updatedMainClauseData = updateData(updatedMainClauseData, level2Key, newRules);
        }
        if (level3Key && level4Key === "") {
          updatedMainClauseData = updateData(updatedMainClauseData, level3Key, newRules);
        }
        if (level4Key) {
          updatedMainClauseData = updateData(updatedMainClauseData, level4Key, newRules);
        }

        console.log("Main clause data", updatedMainClauseData);
        const payload: ExtractedSummary = {
          extractedJson: JSON.stringify({
            summary,
            data: updatedMainClauseData,
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
          message: ("Clause key should not be empty and charachter limit < 30") as ToastContent,
        });
      }
    }
  };

  // Function to handle adding a new rule
  const addRule = () => {
    setRules([...rules, { key: "", value: "", error: "" }]);
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
    if (field === 'key') {
      if (value.length > 30) {
        newRules[index].error = "Please create clause key with in the limit of 30 charachters";
      } else {
        newRules[index].error = "";
      }
    }
    setRules(newRules);

  };


  useEffect(() => {
    setRules([{ key: "Definition", value: pdfContent?.text }]);
  }, [pdfContent]);

  const setDataToDropDown = (id: number, level: number) => {
    console.log(`SubClause Level ${level}`, id);

    const findMainData = (AllClauseData: any) => {
      AllClauseData.map((clauseData: any) => {
        if (clauseData.id === id) {
          if (clauseData) {
            // @ts-ignore
            const updatedSubClause = clauseData.value
              // @ts-ignore
              .filter(item => Array.isArray(item.value))
              // @ts-ignore
              .map((item) => ({
                value: item.id,
                key: item.key,
              }));

            console.log(`Updated SubClause Level ${level}`, updatedSubClause);

            switch (level) {
              case 1:
                setSubClauseLevel1(updatedSubClause);
                break;
              case 2:
                setSubClauseLevel2(updatedSubClause);
                break;
              case 3:
                setSubClauseLevel3(updatedSubClause);
                break;
              default:
                console.log("Invalid level");
            }
          }
        }
        else if (Array.isArray(clauseData?.value)) {
          findMainData(clauseData?.value);
        }
      })
    }

    findMainData(mainClauseData);


    // const selectedItem = mainClauseData.find((item) => item.id === id);

  }

  useEffect(() => {
    if (level1Key) {
      setDataToDropDown(parseInt(level1Key, 10), 1);
    }
  }, [level1Key]);

  useEffect(() => {
    if (level2Key) {
      setDataToDropDown(parseInt(level2Key, 10), 2);
    }
  }, [level2Key]);

  useEffect(() => {
    if (level3Key) {
      setDataToDropDown(parseInt(level3Key, 10), 3);
    }
  }, [level3Key]);

  useEffect(() => {
    setSubClauseLevel1([]);
    setSubClauseLevel2([]);
    setSubClauseLevel3([]);
    setLevel1Key("");
    setLevel2Key("");
    setLevel3Key("");
    setLevel4Key("");
    // console.log("test");
  }, [isOpen])

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
              <div className="fs14 font-bold mb-3 text-body">Add To Existing Clause</div>
              <div className="clause-edit-heading">
                <div className="pb-2">
                  <select id="keys" onChange={(e) => { setLevel1Key(e.target.value) }} className="custom-select edit-select w-full p-2 mb-2">
                    <option value="">Please select</option>
                    {mainClauseData.map((item) => {
                      return <option key={item?.key} value={item?.id}>
                        {item?.key}
                      </option>
                    })}
                  </select>
                </div>
                {subClauseLevel1.length > 0 && <div className="pb-2">
                  <select id="keys" onChange={(e) => { setLevel2Key(e.target.value) }} className="custom-select edit-select w-full p-2 mb-2">
                    <option value="">Please select sub clause</option>
                    {subClauseLevel1.map((item) => {
                      return <option key={item.key} value={item.value}>
                        {item.key}
                      </option>
                    })}
                  </select>
                </div>}

                {subClauseLevel2.length > 0 && <div className="pb-2">
                  <select id="keys" onChange={(e) => { setLevel3Key(e.target.value) }} className="custom-select edit-select w-full p-2 mb-2">
                    <option value="">Please select sub clause</option>
                    {subClauseLevel2.map((item) => {
                      return <option key={item.key} value={item.value}>
                        {item.key}
                      </option>
                    })}
                  </select>
                </div>}

                {subClauseLevel3.length > 0 && <div className="pb-2">
                  <select id="keys" onChange={(e) => { setLevel4Key(e.target.value) }} className="custom-select edit-select w-full p-2 mb-2">
                    <option value="">Please select sub clause</option>
                    {subClauseLevel3.map((item) => {
                      return <option key={item.key} value={item.value}>
                        {item.key}
                      </option>
                    })}
                  </select>
                </div>}

                <ul className="shared-user-list-scroll mb-5" style={{ display: "block" }}>
                  {rules.map((rule, index) => (
                    <li key={index} className="pb-2">
                      <div className="info-row items-center">
                        <div className="info-row-left font-bold">
                          <span className="block">
                            <input
                              type="text"
                              className={`edit-input ${rule.error ? 'border-red-500' : ''} p-2 mb-2 w-1/3 mr-2`}
                              placeholder="Please add key"
                              value={rule.key}
                              onChange={(e) => handleRuleChange(index, 'key', e.target.value)}
                            />
                            {rule.error && (
                              <div className="error-message" style={{ color: "var(--button-red)", fontSize: "10px" }}>
                                {rule.error}
                              </div>
                            )}
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
                        <div className="button-tool-tip relative">
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
                </div>

              </div>
            </div>
          </div>
        </div>
      </AppModal>
    </>
  );
};

export default AddToExisitingClauseModal;