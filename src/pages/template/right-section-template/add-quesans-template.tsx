import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { handleFormFieldToggle } from "src/core/utils";
import { setQuestionaireArray } from "src/pages/pre-contract/pre-contract.redux";
import {
  addQuestionnaire,
  deleteQuestionnaire,
  fetchAutoSuggestField,
  setAutoSuggestFieldList,
  setTemplateQuestionaireArray,
} from "src/pages/pre-dashboard/templates/templates.redux";

interface Field {
  variable_name: string;
  ans_type: string;
  question: string;
}

interface AddFieldFormProps {}

const AddFieldForm: React.FC<AddFieldFormProps> = () => {
  const dispatch = useAppDispatch();

  const [fields, setFields] = useState<Field[]>([]);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const isQuestionaireArrayLoaded = useRef<boolean>(false);

  const { questionaireArray, autoSuggestFieldList } = useAppSelector((state) => state.templates);
  const { contractTypeId, questionaireArray: formQuestionaireArray } = useAppSelector(
    (state) => state.preContract,
  );
  const { getEditorConfigReps } = useAppSelector((state) => state.onlyOfficeEditor);
  const { config } = getEditorConfigReps || {};

  const handleAddField = () => {
    const newField: Field = {
      variable_name: "",
      ans_type: "String",
      question: "",
    };
    setShowErrorMessage(false);
    const fieldsArr = [...fields, newField];
    setFields(fieldsArr);
    setTimeout(() => {
      handleFormFieldToggle(fieldsArr.length - 1);
    });
  };

  const handleDeleteField = (index: number) => {
    const deletedItem = fields[index];
    dispatch(
      deleteQuestionnaire({
        key: deletedItem.variable_name,
        label: deletedItem.question,
      }),
    );
    const fieldList = fields.filter((_, i) => i !== index);
    setFields(fieldList);
    dispatch(setTemplateQuestionaireArray(fieldList));
  };

  const handleChange = (index: number, field: keyof Field, value: string) => {
    const updatedFields = fields.map((item, idx) => {
      if (idx !== index) return item;
      return {
        ...item,
        [field]: field === "ans_type" && (value === "" || value === undefined) ? "String" : value,
      };
    });

    setFields(updatedFields);
  };

  const handleInput = (index: number, field: keyof Field, value: string) => {
    handleFormFieldToggle(index);
    const regex = /^[a-zA-Z0-9_ ]+(?:[a-zA-Z0-9_ ]+)*$/;
    const test = regex.test(value.trim());
    if (test || value.length === 0) handleChange(index, field, value);
  };

  const insertFieldInDocument = (index: number) => {
    const field: any = fields.filter((_, key) => key === index);
    if ((field[0].question || "").trim() === "" || (field[0].variable_name || "").trim() === "") {
      setShowErrorMessage(true);
      return;
    }

    dispatch(
      setQuestionaireArray([
        ...formQuestionaireArray,
        {
          question: field[0].question,
          ans_type: "String",
          variable_name: field[0].variable_name,
          value: field[0].variable_name,
        },
      ]),
    );
    dispatch(addQuestionnaire({ key: field[0].variable_name, label: field[0].question }));
  };

  const getAutoSuggestField = (key: string, index: number) => {
    setCurrentIndex(index);
    dispatch(fetchAutoSuggestField({ key, contractTypeId }));
  };

  const selectField = (field: any, index: number) => {
    setCurrentIndex(-1);
    const updatedFields = fields.map((item, idx) => {
      if (idx !== index) return item;

      return {
        ...item,
        question: field.ques,
        ans_type: field.smdt || "String",
        variable_name: field.var || field.ques,
      };
    });

    setFields(updatedFields);
    setTimeout(() => {
      handleFormFieldToggle(index);
    });
  };

  const checkFieldAdded = (data: any) => {
    let result = false;
    formQuestionaireArray.forEach((d) => {
      if (d.variable_name === data.variable_name) {
        result = true;
      }
    });
    return result;
  };

  useEffect(() => {
    if (questionaireArray.length > 0 && !isQuestionaireArrayLoaded.current) {
      isQuestionaireArrayLoaded.current = true;

      setFields(questionaireArray);
      setTimeout(() => {
        handleFormFieldToggle(-1);
      });
    }
  }, [isQuestionaireArrayLoaded.current, questionaireArray]);

  useEffect(() => {
    dispatch(setTemplateQuestionaireArray(fields.filter((data) => data.variable_name !== "")));
  }, [fields]);

  return (
    <div className="wizard-elements">
      <div>
        <div className="flex justify-end mb-6">
          {config && (
            <button
              className="button-green rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer"
              onClick={handleAddField}
            >
              <i className="font-bold fs10">+</i>Add Field
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column-reverse" }}>
          {fields.length > 0 &&
            fields.map((field, index) => (
              <div
                style={{ marginBottom: "8px" }}
                className={`add-filed-form mb-6 ${checkFieldAdded(field) ? "added collapse-form" : "collapse-form"}`}
                key={index}
                onClick={() => handleFormFieldToggle(index)}
              >
                <form>
                  <div className="filed-row mb-3">
                    <label>Label/Ques</label>
                    <div className="fl-input relative">
                      <input
                        type="text"
                        className={`w-full ${
                          showErrorMessage && field.question === "" ? "error-state" : ""
                        }`}
                        placeholder="Enter Question"
                        value={field.question}
                        onChange={(e) => {
                          handleInput(index, "question", e.target.value);
                          getAutoSuggestField(e.target.value, index);
                        }}
                        onBlur={() =>
                          setTimeout(() => {
                            dispatch(setAutoSuggestFieldList([]));
                          }, 500)
                        }
                      />

                      {Array.from(autoSuggestFieldList || []).length && index === currentIndex ? (
                        <div className="qu-auto-suggest font-normal">
                          <ul>
                            {autoSuggestFieldList.map((data, i) => (
                              <li key={i} onClick={() => selectField(data, index)}>
                                <div className="flex items-center cursor-pointer">
                                  <span className="fs11">{data.ques}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        ""
                      )}
                      {showErrorMessage && field.question === "" && (
                        <div className="error-message">This field is compulsory</div>
                      )}
                    </div>
                  </div>
                  <div className="filed-row mb-3">
                    <label>Field Type</label>
                    <div className="fl-input">
                      <select
                        className="sl-select w-full"
                        value={field.ans_type}
                        onChange={(e) => handleInput(index, "ans_type", e.target.value)}
                      >
                        <option value="String">String</option>
                        <option value="Number">Number</option>
                        <option value="Date">Date</option>
                      </select>
                    </div>
                  </div>
                  <div className="filed-row mb-3">
                    <label>Field Name</label>
                    <div className="fl-input">
                      <input
                        type="text"
                        className={`w-full ${
                          showErrorMessage && field.variable_name === "" ? "error-state" : ""
                        }`}
                        placeholder="Enter Field Name"
                        value={field.variable_name}
                        onChange={(e) => {
                          handleInput(index, "variable_name", e.target.value);
                        }}
                      />

                      {showErrorMessage && field.variable_name === "" && (
                        <div className="error-message">This field is compulsory</div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center relative">
                    <div className=" button-tool-tip">
                      <button
                        type="button"
                        className="button-red rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer"
                        onClick={() => insertFieldInDocument(index)}
                      >
                        Add
                      </button>
                      <div className="button-info">Add to document</div>
                    </div>
                    <div className="button-tool-tip trash-fix-right">
                      <button
                        className="trash-btn"
                        onClick={() => {
                          handleDeleteField(index);
                        }}
                        type="button"
                      ></button>
                      <div className="button-info">Discard</div>
                    </div>
                  </div>
                </form>
              </div>
            ))}
        </div>

        {/* {fields.length > 0 && (
          <div className="flex justify-center">
            <button
              className="button-red rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer"
              onClick={handleSave}
            >
              Save Field
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default AddFieldForm;
