import { Loader } from "core/components/loader/loader.comp";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { decodePlaybookId } from "src/core/utils";
import { contractReducer } from "src/pages/contract/contract.redux";
import { teamReducer } from "src/pages/manage-team/team.redux";
import { dashboardReducer } from "src/pages/user-dashboard/dashboard.redux";

import { clearPlaybookIdData, fetchClickGlobalPlaybook, playbookReducer } from "../playbook.redux";
import "./playbook.scss";

const OpenGlobalPlaybook: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const { id: decodedPlaybookId } = decodePlaybookId(key || "");
  const { playbookResponse, isLoading } = useAppSelector((state) => state.playbook);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    if (playbookResponse?.jsonContent) {
      const content =
        typeof playbookResponse.jsonContent === "string" &&
        JSON.parse(playbookResponse?.jsonContent);
      setSections(content?.playbook_rules || []);
    }
  }, [playbookResponse]);

  useEffect(() => {
    const fetchData = async () => {
      if (decodedPlaybookId > 0) {
        await dispatch(fetchClickGlobalPlaybook(decodedPlaybookId));
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

  return (
    <>
      {isLoading && <Loader />}
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <div className="flex view-all-header mb-3 items-center">
            <button className="pageBack-btn ml-3" onClick={handleGoBack}>
              <i className="icon-img"></i>
            </button>

            <h2 className="fs10 text-defaul-color font-normal tracking-wider uppercase ml-3">
              {playbookResponse?.playbookName}
            </h2>
          </div>

          {sections?.map((section: any, sectionIndex: number) => (
            <section className="mb-5" key={sectionIndex}>
              <div className="bg-light1 p-3 rounded-6 mb-2 text-defaul-color inline-flex">
                <div className="playbook-info">
                  <div className="playbook-frm">
                    <label>Clause Name</label>
                    <input type="text" className="play-input" value={section.key} />
                  </div>
                  {section?.verbatim && (
                    <div className="playbook-frm">
                      <label>Verbatim</label>
                      <textarea
                        className="play-input"
                        value={section.verbatim}
                        style={{ whiteSpace: "pre-wrap" }} // Preserve line breaks
                        readOnly
                      />
                    </div>
                  )}
                  {section?.ques?.map((question: string, questionIndex: number) => (
                    <div className="playbook-frm" key={questionIndex}>
                      <label>Rule {questionIndex + 1}</label>
                      <input type="text" className="play-input" value={question} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
      {/* <div className="right-section">
        <NotificationStack />
      </div> */}
    </>
  );
};

export default OpenGlobalPlaybook;
export const reducer = {
  dashboard: dashboardReducer,
  contract: contractReducer,
  playbook: playbookReducer,
  team: teamReducer,
};
