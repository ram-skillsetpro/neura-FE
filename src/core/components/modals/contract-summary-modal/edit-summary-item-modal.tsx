import React, { useEffect, useState } from "react";
import { ToastContent } from "react-toastify";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { CommonService } from "src/core/services/common.service";
import Tree from "src/pages/contract/components/lib/tree";
import { ExtractedSummary } from "src/pages/contract/contract.model";
import { readSideBarContent, updateSummary } from "src/pages/contract/contract.redux";
import { Loader } from "../../loader/loader.comp";
import AppModal from "../app-modal";
import { AppModalType } from "../app-modal.model";
import DeleteSummaryItemModal from "./delete-summary-item-modal/delete-summary-item-modal";
import "./edit-summary-item-modal.scss";

interface Section {
  key: string;
  value: any[] | string;
  id: number;
}

interface EditSummaryModalType extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  subClauseLevel1: any[];
  mainClauseData: any[];
  section: Section;
  SUMMARY: string;
  folderId: number;
  fileId: number;
  teamId: number;
}

interface Item {
  id: number;
  parentId?: number;
  value?: Item[];
  [key: string]: any;
}

const EditSummaryModal: React.FC<EditSummaryModalType> = ({
  isOpen,
  onClose,
  subClauseLevel1,
  shouldCloseOnOverlayClick,
  mainClauseData,
  section,
  SUMMARY,
  folderId,
  fileId,
  teamId,
}) => {
  const [selectedKey, setSelectedKey] = useState("");
  const [editableKey, setEditableKey] = useState<string>("");
  const [rules, setRules] = useState<
    { key?: string; value?: string; error?: string; id: number }[]
  >([]);
  const dispatch = useAppDispatch();
  const [subClauseLevel2, setSubClauseLevel2] = useState<Array<any>>([]);
  const [subClauseLevel3, setSubClauseLevel3] = useState<Array<any>>([]);
  const [level1Key, setLevel1Key] = useState<number>(section.id);
  const [level2Key, setLevel2Key] = useState<number>();
  const [level3Key, setLevel3Key] = useState<number>();
  const [level4Key, setLevel4Key] = useState<number>();
  const [mainJson, setMainJsonData] = useState<any[]>(mainClauseData);
  const isLoading = useAppSelector((state) => state.contract.isUpdateSummaryLoading);
  const [headingError, setHeadingError] = useState<string>("");
  const [isDeleteModalOpenForExtraction, setIsDeleteModalOpenForExtraction] =
    useState<boolean>(false);
  const [tree, setTree] = useState<Tree<any>>(new Tree<any>());

  const traverse = (obj: any, parent?: any) => {
    // return;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key]?.value) {
          const checkRootObj = obj.filter((d: any) => d?.id === obj[key]?.id);
          if (parent) {
            if (checkRootObj.length) {
              tree.add({ ...checkRootObj[0], parentId: parent?.id }, parent?.id);
            }
          }
          else {
            tree.add({ ...checkRootObj[0], parentId: 0 }, 0);
          }
        }
        if (typeof obj[key] === "object" && obj[key] !== null) {
          traverse(obj[key], obj);
        }
      }
    }
  };

  function buildJson(data: Item[]): Item[] {
    const itemMap: { [key: number]: Item } = {};
    const json: Item[] = [];

    // Create a map of items
    data.forEach((item: any) => {
      if (item !== 0) {
        if (typeof item.value !== "string") {
          item.value = []; // Initialize value array for each item
          itemMap[item.id] = item;
        }
        else {
          itemMap[item.id] = item;
        }
      }
    });

    // Build the nested structure
    data.forEach(item => {
      const { parentId, ...rest } = item; // Destructure to remove parentId

      if (parentId === 0) {
        json.push({ ...rest, value: item.value });
      } else if (itemMap[parentId]) {
        itemMap[parentId].value.push({ ...rest, value: item.value });
      }
    });

    return json;
  }

  const saveClause = async () => {
    let isValidated = true;
    if (rules.length > 0) {
      rules.forEach((item) => {
        if (item.error && item.error !== "") {
          isValidated = false;
        }
        if (item.key === "" || item.value === "") {
          isValidated = false;
        }
      });

      if (editableKey === "" || editableKey.length > 30) {
        CommonService.toast({
          type: "error",
          message: "Clause heading should not be empty and charchter limit < 30" as ToastContent,
        });
      } else if (isValidated) {
        const payload: ExtractedSummary = {
          extractedJson: JSON.stringify({
            SUMMARY,
            data: mainJson
          }),
          fileId,
          teamId,
          folderId,
        };

        const result = await dispatch(updateSummary(payload));
        if (result?.isSuccess) {
          onClose();
          setTree(new Tree<any>());
          dispatch(readSideBarContent({ fileId, teamId, folderId }));
        }
      } else {
        CommonService.toast({
          type: "error",
          message:
            "Clause key and value should not be empty and key character limit < 30" as ToastContent,
        });
      }
    } else {
      CommonService.toast({
        type: "error",
        message: "Please add extracts to clause!!" as ToastContent,
      });
    }
  };

  const addRule = () => {
    const newId = Math.floor(Math.random() * 10000000000);
    let parentId;

    if (section?.id && level1Key === 0 && !level2Key && !level3Key && !level4Key) {
      parentId = section?.id;
    } else if (level1Key && !level2Key && !level3Key && !level4Key) {
      parentId = level1Key;
    } else if (level2Key && !level3Key && !level4Key) {
      parentId = level2Key;
    } else if (level3Key && !level4Key) {
      parentId = level3Key;
    } else {
      parentId = level4Key;
    }

    const newNode = { key: "", value: "", error: "", id: newId, parentId: parentId };
    tree.add(newNode, parentId);
    const newRules = [...rules, newNode];
    setRules(newRules);
    const newJson = buildJson(tree.traverseBFS());
    setMainJsonData(newJson);
  };

  const updateNestedKey = (arr: any[], keys: any[], newValue: any[], ruleToRemove: any): any[] => {
    if (keys.length === 0) {
      return arr;
    }

    const [currentKey, ...restKeys] = keys;
    if (arr) {
      return arr.map((item) => {
        if (item && item.id === currentKey) {
          if (restKeys.length === 0) {
            const updatedValue = Array.isArray(item?.value)
              ? [
                ...item.value.map((existingItem: any) => {
                  let matchingNewValue = {};
                  if (Object.keys(ruleToRemove).length > 0) {
                    matchingNewValue = newValue.find(
                      (newItem) => existingItem?.id != ruleToRemove?.id,
                    );
                    return matchingNewValue;
                    // newValue.map((newItem) => {
                    //   if(newItem?.id != ruleToRemove?.id){
                    //     return { ...newItem }
                    //   }
                    // })
                  } else {
                    newValue.map((newItem) => {
                      if (existingItem?.id === newItem?.id) {
                        matchingNewValue = newItem;
                      }
                    });
                    // matchingNewValue = newValue.find((newItem) => existingItem?.id === newItem?.id);
                    return matchingNewValue
                      ? { ...existingItem, ...matchingNewValue }
                      : existingItem;
                  }
                }),
                // @ts-ignore
                ...newValue.filter(
                  (newItem) =>
                    !item.value.some((existingItem) => existingItem?.id === newItem?.id),
                ),
              ]
              : newValue;
            return { ...item, value: updatedValue };
          } else if (item && Array.isArray(item.value)) {
            return updateNestedKey(item.value, restKeys, newValue, ruleToRemove);
          } else {
            if (item && item.id != ruleToRemove?.id) {
              return item;
            }
          }
        } else if (item && Array.isArray(item.value)) {
          return { ...item, value: updateNestedKey(item?.value, keys, newValue, ruleToRemove) };
        } else {
          if (item && item.id != ruleToRemove.id) {
            return item;
          }
        }
      });
    } else {
      return [];
    }
  };

  const removeRule = (id: number) => {
    tree.delete({ id: id });
    const updatedRules = rules.filter(rule => rule.id !== id);
    setRules(updatedRules);
    const builtJson = buildJson(tree.traverseDFS());
    setMainJsonData(builtJson);
  };

  const handleRuleChange = (index: number, field: string, value: string, id: number) => {
    const newRules = [...rules];
    // @ts-ignore
    newRules[index][field] = value;

    if (field === "key") {
      if (value?.length > 30) {
        newRules[index].error = "Please create clause key with in the limit of 30 characters";
      } else {
        newRules[index].error = "";
      }
    }
    tree.updateNodeValue(newRules[index], id);
    setMainJsonData(buildJson(tree.traverseDFS()));
  };

  useEffect(() => {
    if (isOpen) {
      setEditableKey(section?.key);
      tree.add(0);
      traverse(mainClauseData);
      setMainJsonData(mainClauseData);
      if (section && Array.isArray(section?.value)) {
        const newRules = section?.value
          .filter((item) => !Array.isArray(item.value))
          .map((item) => ({ key: item.key, value: item.value, error: "", id: item.id }));
        setRules(newRules);
      } else {
        setRules([]);
      }
      setSelectedKey(section?.key);
    } else {
      setRules([]);
      setLevel1Key(0);
      setSelectedKey("");
      setSubClauseLevel2([]);
      setSubClauseLevel3([]);
      setTree(new Tree<any>());
    }
  }, [isOpen, section]);

  const handleSelectKeys = (e: React.ChangeEvent<HTMLSelectElement>, LEVEL: number) => {
    const selectedValue = e.target.value;

    switch (LEVEL) {
      case 1:
        setLevel1Key(parseInt(selectedValue));
        setLevel2Key(0);
        setLevel3Key(0);
        setLevel4Key(0);
        break;
      case 2:
        setLevel2Key(parseInt(selectedValue));
        setLevel3Key(0);
        setLevel4Key(0);
        break;
      case 3:
        setLevel3Key(parseInt(selectedValue));
        setLevel4Key(0);
        break;
      case 4:
        setLevel4Key(parseInt(selectedValue));
        break;
    }

    const findNestedData = (data: any[], id: number): any | null => {
      for (const item of data) {
        if (item && item.id === id) {
          return item;
        }
        if (item && Array.isArray(item.value)) {
          const found = findNestedData(item.value, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const selectedData = findNestedData(mainJson, parseInt(selectedValue) === 0 ? section?.id : parseInt(selectedValue));

    if (selectedData) {
      if (Array.isArray(selectedData.value)) {
        // @ts-ignore
        const filteredRules = selectedData.value
          // @ts-ignore
          .filter((item) => !Array.isArray(item.value))
          // @ts-ignore
          .map((subItem1) => ({ key: subItem1.key, value: subItem1.value, id: subItem1.id }));
        setRules(filteredRules);
        selectedData.value.map((subItem: any) => {
          if (Array.isArray(subItem.value)) {
            switch (LEVEL) {
              case 1:
                setSubClauseLevel2(selectedData?.value);
                setSubClauseLevel3([]);
                break;
              case 2:
                setSubClauseLevel3(selectedData.value);
                break;
              case 3:
                setRules([
                  { key: selectedData.key, value: selectedData.value, id: selectedData.id },
                ]);
                break;
            }
          }
        });
      } else {
        // setRules([{ key: selectedData.key, value: selectedData.value }]);
        setSubClauseLevel2([]);
        setSubClauseLevel3([]);
      }
    } else {
      setRules([]);
      setSubClauseLevel2([]);
      setSubClauseLevel3([]);
    }

    if (Number(selectedValue) === 0 && LEVEL === 1) {
      setSubClauseLevel2([]);
      setSubClauseLevel3([]);
    }
  };

  const removeKeyFromMainClause = async () => {
    const newData = mainClauseData?.filter((item) => item.key !== section?.key);

    const payload: ExtractedSummary = {
      extractedJson: JSON.stringify({
        SUMMARY,
        data: newData,
      }),
      fileId,
      teamId,
      folderId,
    };
    const result = await dispatch(updateSummary(payload));
    if (result?.isSuccess) {
      onClose();
      dispatch(readSideBarContent({ fileId, teamId, folderId }));
    }
  };

  const backButtnClicked = () => {
    if (level4Key && subClauseLevel3.length > 0) {
      setLevel4Key(0);
      setSubClauseLevel3([]);
    } else if (level3Key && subClauseLevel2.length > 0) {
      setLevel3Key(0);
      setSubClauseLevel2([]);
    } else if (level2Key) {
      setLevel2Key(0);
    } else if (level1Key) {
      setLevel1Key(0);
      setSelectedKey("");
    }

    const jsonSection = mainJson.filter((item) => item.id === section?.id);

    if (Array.isArray(jsonSection[0].value)) {
      const newRules = jsonSection[0].value
        .filter((item) => !Array.isArray(item.value))
        .map((item) => ({ key: item.key, value: item.value, error: "", id: item.id }));
      setRules(newRules);
    } else {
      setRules([]);
    }
    setSelectedKey(editableKey);
  };

  const onChangeMainClauseKey = (value: any) => {
    if (value.length <= 30) {
      setHeadingError("");
      const updatedMainClauseData = mainClauseData.map((item) => {
        if (item && item.id === section?.id) {
          return { ...item, key: value };
        }
        return item;
      });

      setMainJsonData(updatedMainClauseData);
    } else {
      setHeadingError("Please create clause heading in limit < 30 charachters");
    }
    setEditableKey(value);
  };

  return (
    <>
      {isLoading && <Loader />}
      <AppModal
        isOpen={isOpen}
        onClose={onClose}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      >
        <div className="share-outer-wrap">
          <div className="share-inner">
            <div className="w-full mb-5">
              {level1Key != 0 ? (
                <div className="mb-5">
                  <div className="app-breadcrumbs">
                    <button className="back-btn">
                      <i
                        className="icon-img"
                        onClick={() => {
                          backButtnClicked();
                        }}
                      ></i>{" "}
                    </button>
                    <span className="fs12 font-bold truncate-line1">
                      BACK TO {section?.key?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-5">
                  <input
                    type="text"
                    className="edit-input"
                    // placeholder={section.key}
                    value={editableKey.toUpperCase()}
                    onChange={(e) => {
                      onChangeMainClauseKey(e.target.value);
                    }}
                  />
                  {headingError.length > 0 && (
                    <div className="error-message1 font-normal">{headingError}</div>
                  )}
                </div>
              )}
              {/* <div className="fs14 font-bold mb-5 text-body">{section.key}</div> */}
              <div className="clause-edit-heading">
                <div className="pb-2">
                  {subClauseLevel1.length > 0 && (
                    <select
                      id="keys"
                      onChange={(e) => handleSelectKeys(e, 1)}
                      className="custom-select edit-select w-full p-2 mb-2"
                      value={level1Key}
                    >
                      <option value={0}>Please select sub clause</option>
                      {subClauseLevel1.map((item) => (
                        <option key={item.label} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {subClauseLevel2.length > 0 && (
                    <select
                      id="keys"
                      onChange={(e) => handleSelectKeys(e, 2)}
                      className="custom-select edit-select w-full p-2 mb-2"
                      value={level2Key}
                    >
                      <option value="">Please select sub Clause</option>
                      {subClauseLevel2.map((item) => (
                        <option key={item.key} value={item.id}>
                          {item.key}
                        </option>
                      ))}
                    </select>
                  )}

                  {subClauseLevel3.length > 0 && (
                    <select
                      id="keys"
                      onChange={(e) => handleSelectKeys(e, 3)}
                      className="custom-select edit-select w-full p-2 mb-2"
                      value={level3Key}
                    >
                      <option value="">Please select sub clause </option>
                      {subClauseLevel3.map((item) => (
                        <option key={item.key} value={item.id}>
                          {item.key}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <ul className="shared-user-list-scroll mb-5" style={{ display: "block" }}>
                  {rules?.map((rule, index) => (
                    <li key={index} className="pb-2">
                      <div className="info-row">
                        <div className="info-row-left">
                          <span className="block">
                            <input
                              type="text"
                              className={`edit-input ${rule.error ? "border-red-500" : ""} p-2 mb-2 mr-2`}
                              placeholder="Please add key"
                              value={rule.key}
                              onChange={(e) => handleRuleChange(index, "key", e.target.value, rule?.id)}
                            />
                            {rule.error && <div className="error-message1">{rule.error}</div>}
                          </span>
                        </div>
                        <div className="info-row-right">
                          <p className="block">
                            <textarea
                              className="edit-input"
                              value={rule.value}
                              onChange={(e) => handleRuleChange(index, "value", e.target.value, rule?.id)}
                              rows={1}
                            />
                          </p>
                        </div>
                        <div className="button-tool-tip relative mt-3">
                          <button
                            className="trash-btn"
                            type="button"
                            onClick={() => removeRule(rule?.id)}
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
                  <div className="button-tool-tip relative">
                    <button
                      className="trash-btn ml-3"
                      type="button"
                      onClick={() => setIsDeleteModalOpenForExtraction(true)}
                    ></button>
                    <div className="button-info">
                      Remove {section?.key?.toLowerCase()} from extraction
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppModal>
      <DeleteSummaryItemModal
        isOpen={isDeleteModalOpenForExtraction}
        mainClauseData={mainClauseData}
        section={section}
        summary={SUMMARY}
        fileId={fileId}
        teamId={teamId}
        onClose={() => setIsDeleteModalOpenForExtraction(false)}
        folderId={folderId}
        setEditPopUpClose={() => onClose()}
      />
    </>
  );
};

export default EditSummaryModal;
