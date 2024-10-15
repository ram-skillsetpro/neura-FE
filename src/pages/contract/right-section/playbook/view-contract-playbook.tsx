import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { teamReducer } from "src/pages/manage-team/team.redux";
import "src/pages/playbook/components/playbook.scss";
import {
  clearPlaybookIdData,
  fetchClickGlobalPlaybook,
  fetchClickPlaybook,
  playbookReducer,
} from "src/pages/playbook/playbook.redux";
import { dashboardReducer } from "src/pages/user-dashboard/dashboard.redux";
import { contractReducer } from "../../contract.redux";
import "./playbook.scss";

interface ViewContractPlaybookModal extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  shouldCloseOnOverlayClick: boolean;
  playbookId: number;
  reviewId: any;
  isUniversal: number;
}

const ViewContractPlaybook: React.FC<ViewContractPlaybookModal> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  playbookId,
  reviewId,
  isUniversal,
}) => {
  const { playbookResponse } = useAppSelector((state) => state.playbook);
  const dispatch = useAppDispatch();
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
      if (playbookId > 0) {
        isUniversal === 0
          ? await dispatch(fetchClickPlaybook(playbookId, reviewId))
          : await dispatch(fetchClickGlobalPlaybook(playbookId, reviewId));
      }
    };
    fetchData();
    return () => {
      dispatch(clearPlaybookIdData());
    };
  }, [playbookId]);
  return (
    <AppModal isOpen={isOpen} onClose={onClose} shouldCloseOnOverlayClick={true}>
      <div className="playbook-outer-wrap">
        <div className="playbook-info relative pr-0">
          <div>
            <div className="fs14 font-bold text-body">{playbookResponse?.playbookName}</div>
          </div>
          <div className="playbook-content-body">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-light1 p-3 rounded-6 mb-2 text-defaul-color inline-flex"
              >
                <div className="relative">
                  <div className="playbook-frm">
                    <label>Clause Name</label>
                    <input type="text" className="play-input" value={section.key} readOnly />
                  </div>
                  {section.ques.map((rule: string, ruleIndex: number) => (
                    <div key={ruleIndex} className="playbook-frm">
                      <label>Rule {ruleIndex + 1}</label>
                      <input type="text" className="play-input" value={rule} readOnly />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ViewContractPlaybook;
export const reducer = {
  dashboard: dashboardReducer,
  contract: contractReducer,
  playbook: playbookReducer,
  team: teamReducer,
};
