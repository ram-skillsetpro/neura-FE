import { Loader } from "core/components/loader/loader.comp";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { CommonService } from "src/core/services/common.service";
import { decodePlaybookId } from "src/core/utils";
import { contractReducer } from "src/pages/contract/contract.redux";
import { teamReducer } from "src/pages/manage-team/team.redux";
import { dashboardReducer } from "src/pages/user-dashboard/dashboard.redux";
import { SavePlaybookPayload } from "../playbook.model";
import {
  clearPlaybookIdData,
  fetchClickPlaybook,
  playbookReducer,
  savePlaybook,
} from "../playbook.redux";
import "./playbook.scss";

const OpenPlaybook: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const { id: decodedPlaybookId } = decodePlaybookId(key || "");
  const { playbookResponse, isLoading } = useAppSelector((state) => state.playbook);
  const [sections, setSections] = useState<any[]>([]);
  const [checkboxState, setCheckboxState] = useState<boolean[]>([]);
  const [expandedState, setExpandedState] = useState<boolean[]>([]);

  const handleCheckboxChange = (index: number) => {
    const newCheckboxState = [...checkboxState];
    newCheckboxState[index] = !newCheckboxState[index];
    setCheckboxState(newCheckboxState);
  };

  useEffect(() => {
    if (sections.length !== checkboxState.length) {
      setCheckboxState(sections.map(() => true));
      setExpandedState(sections.map(() => false));
    }
  }, [sections]);

  useEffect(() => {
    if (playbookResponse?.jsonContent) {
      const content =
        typeof playbookResponse.jsonContent === "string" &&
        JSON.parse(playbookResponse?.jsonContent);
      setSections(content?.playbook_rules || []);
    }
  }, [playbookResponse]);

  const { version, created_date } =
    typeof playbookResponse?.jsonContent === "string" && JSON.parse(playbookResponse.jsonContent);

  const handleAddQuestion = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].ques.push("");
    setSections(newSections);
  };

  const handleDeleteQuestion = (sectionIndex: number, questionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].ques.splice(questionIndex, 1);
    setSections(newSections);
  };

  const handleAddSection = () => {
    setSections((prevSections) => [
      ...prevSections,
      { key: "", ques: [""], verbatim: "", isai: false },
    ]);
    setCheckboxState((prevCheckboxState) => [...prevCheckboxState, true]);
  };

  const handleDeleteSection = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections.splice(sectionIndex, 1);
    setSections(newSections);

    const newCheckboxState = [...checkboxState];
    newCheckboxState.splice(sectionIndex, 1);
    setCheckboxState(newCheckboxState);
  };

  const isAtLeastOneCheckboxChecked = () => {
    return checkboxState.some((checkbox) => checkbox);
  };

  const handlePublish = async (publishStatus: number) => {
    const updatedSections = sections
      .map((section, index) => ({
        key: section.key.trim(),
        ques: section.ques
          .map((question: string) => question.trim())
          .filter((question: string) => question !== ""),
        verbatim: section.verbatim ? section.verbatim.trim() : "",
        isai: section.isai !== false,
      }))
      .filter(
        (section, index) => checkboxState[index] && section.key !== "" && section.ques.length > 0,
      ); // Filter based on checkbox, non-empty key, and at least one question

    if (!isAtLeastOneCheckboxChecked()) {
      CommonService.popupToast({
        type: "error",
        message: `Cannot proceed. At least one section must be checked`,
      });
      return;
    }

    if (updatedSections.length === 0) {
      CommonService.popupToast({
        type: "error",
        message: `Clause name or Rules are not valid`,
      });
      return;
    }

    const payload: SavePlaybookPayload = {
      contractTypeId: playbookResponse?.contractTypeId,
      id: playbookResponse?.id,
      playbookName: playbookResponse?.playbookName,
      publishStatus,
      publishedJson: JSON.stringify({
        version,
        created_date,
        playbook_rules: updatedSections,
      }),
    };
    const result = await dispatch(savePlaybook(payload));
    if (result?.isSuccess) {
      dispatch(fetchClickPlaybook(decodedPlaybookId));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (decodedPlaybookId > 0) {
        await dispatch(fetchClickPlaybook(decodedPlaybookId));
      }
    };
    fetchData();
    return () => {
      dispatch(clearPlaybookIdData());
    };
  }, [decodedPlaybookId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleToggleExpanded = (sectionIndex: number) => {
    const newExpandedState = [...expandedState];
    newExpandedState[sectionIndex] = !newExpandedState[sectionIndex];
    setExpandedState(newExpandedState);
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <div className="app-tabs-sec">
            <div className="left-inner-sticky">
              <div className="app-breadcrumbs">
                <button className="back-btn" onClick={handleGoBack}>
                  <i className="icon-img"></i>
                </button>

                <span className="fs12 font-bold">{playbookResponse?.playbookName}</span>
              </div>
              <div
                className="flex justify-end mb-5"
                // style={{ maxWidth: "400px", margin: "auto", marginBottom: "20px" }}
              >
                {sections?.length > 0 && (
                  <>
                    <button
                      className="button-ob mr-3 rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer"
                      onClick={() => handlePublish(0)}
                    >
                      Save Draft
                    </button>
                    <button
                      className="green-button uppercase tracking-wider mr-3"
                      onClick={() => handlePublish(1)}
                    >
                      Save & Publish
                    </button>
                  </>
                )}
                <button
                  className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                  onClick={handleAddSection}
                >
                  Add Section
                </button>
              </div>
            </div>

            {sections?.map((section: any, sectionIndex: number) => (
              <div id="tabs-content">
                <div className="playbook-edit-inner relative">
                  <h2 className="hd-right-space" onClick={() => handleToggleExpanded(sectionIndex)}>
                    <div className="flex items-center">
                      <div>Clause name</div>
                      <div className="grow">
                        <input
                          type="text"
                          className="clause-input ml-3"
                          placeholder="Enter Clause Name"
                          value={section.key}
                          onChange={(e) => {
                            if (section.isai === false) {
                              const newSections = [...sections];
                              newSections[sectionIndex].key = e.target.value;
                              setSections(newSections);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </h2>
                  <div className="playbook-checkbox">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={checkboxState[sectionIndex]}
                      onChange={() => handleCheckboxChange(sectionIndex)}
                    />
                  </div>
                </div>
                {expandedState[sectionIndex] && (
                  <div className="playbook-edit-inner select-clause add-more-rule">
                    <div className="playbook-frm">
                      <label>Verbatim</label>
                      <textarea
                        placeholder="Enter verbatim text"
                        className="play-input"
                        value={section.verbatim || ""}
                        onChange={(e) => {
                          if (section.isai === false) {
                            const newSections = [...sections];
                            newSections[sectionIndex].verbatim = e.target.value;
                            setSections(newSections);
                          }
                        }}
                        // readOnly
                        readOnly={section?.isai}
                        style={{ whiteSpace: "pre-wrap" }} // Preserve line breaks
                      />
                    </div>

                    {section?.ques?.map((question: string, questionIndex: number) => (
                      <div className="playbook-frm" key={questionIndex}>
                        <label>Rule {questionIndex + 1}</label>
                        <input
                          placeholder="Enter Rule"
                          type="text"
                          className="play-input"
                          value={question}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[sectionIndex].ques[questionIndex] = e.target.value;
                            setSections(newSections);
                          }}
                        />
                        {section?.ques?.length > 1 && (
                          <div className="rm-ques">
                            <button
                              className="trash-btn"
                              type="button"
                              onClick={() => handleDeleteQuestion(sectionIndex, questionIndex)}
                            ></button>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="edit-playbook">
                      <ul>
                        <li onClick={() => handleDeleteSection(sectionIndex)}>
                          <i className="delete-ic playbook-ic-new"></i>
                        </li>
                      </ul>
                    </div>
                    <button
                      className="add-more-rule"
                      onClick={() => handleAddQuestion(sectionIndex)}
                    >
                      {" "}
                      <i className="plus-ic any-ic"></i>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div className="right-section">
        <NotificationStack />
      </div> */}
    </>
  );
};

export default OpenPlaybook;
export const reducer = {
  dashboard: dashboardReducer,
  contract: contractReducer,
  playbook: playbookReducer,
  team: teamReducer,
};
