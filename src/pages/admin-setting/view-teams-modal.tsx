import React from "react";
import AppModal from "src/core/components/modals/app-modal";
import { AppModalType } from "src/core/components/modals/app-modal.model";
import "src/core/components/modals/team-user-list-model/team-user-list-modal.scss";
import { CompanyTeamDetail } from "./setting.modal";

interface ViewTeamsModalType extends AppModalType {
  team: CompanyTeamDetail[] | undefined;
}

const ViewTeamsModal: React.FC<ViewTeamsModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  team,
}) => {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      <div className="team-user-list-modal">
        <div className="team-user-header">
          <div>Teams</div>
          <div onClick={onClose} className="close-popups"></div>
        </div>
        <div className="team-user-body">
          <div className="team-list-item item-header">
            {/* <div className="team-list-cell">ID</div> */}
            <div className="team-list-cell-name">Team Name</div>
            <div className="team-list-cell-info">Team Description</div>
          </div>

          {Array.isArray(team) && team.length > 0 ? (
            team.map((data, index) => (
              <div key={index} className="team-list-item">
                {/* <div className="team-list-cell">{data.id}</div> */}
                <div className="team-list-cell-name">{data.teamName}</div>
                <div className="team-list-cell-info">{data.teamDescription}</div>
              </div>
            ))
          ) : (
            <div className="loader-box">Loading users list...</div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default ViewTeamsModal;
