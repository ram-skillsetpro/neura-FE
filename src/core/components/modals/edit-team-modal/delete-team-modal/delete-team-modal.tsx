import React, { useEffect } from "react";
import { TOAST } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { Toaster } from "src/core/models/toaster.model";
import { CommonService } from "src/core/services/common.service";
import { clearDeleteTeamResponse, deleteTeam, setError } from "src/pages/manage-team/team.redux";
import AppModal from "../../app-modal";
import { AppModalType } from "../../app-modal.model";
import "./delete-team-modal.scss";

interface DeleteTeamModalType extends AppModalType {
  team: { teamName: string; teamDescription: string; id: number; teamId: number };
}

const DeleteTeamModal: React.FC<DeleteTeamModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  team,
}) => {
  const dispatch = useAppDispatch();

  const { deleteTeamResponse, errorMessage } = useAppSelector((state) => state.team);
  const handleDeleteTeam = () => {
    dispatch(deleteTeam({ teamId: team.id }));
  };

  useEffect(() => {
    if (deleteTeamResponse === 200) {
      onClose && onClose();
      dispatch(clearDeleteTeamResponse());
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "success",
            message: "Team deleted successfully",
          },
        }),
      );
    }
  }, [deleteTeamResponse]);

  useEffect(() => {
    if (errorMessage) {
      onClose && onClose();
      CommonService.toast({
        type: "error",
        message: errorMessage,
      });
    }

    return () => {
      dispatch(setError(""));
    };
  }, [errorMessage]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      <div className="share-outer-wrap">
        {/* share-inner div start below */}
        <div className="share-inner">
          <div className="w-full mb-5">
            <div className="fs14 font-bold mb-5 text-body">Delete Team</div>
          </div>
          <div className="flex items-center border-t pt-3">
            <div className="w-content-left">
              Do you want to delete this team?
              <div>
                Team Name:{" "}
                <span style={{ fontWeight: "bold", color: "#ff6868" }}>{team.teamName}</span>
              </div>
            </div>
            <div className="grow">
              <div className="flex justify-end">
                <button className="remove-button uppercase tracking-wider mr-3" onClick={onClose}>
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTeam}
                  className="green-button uppercase tracking-wider"
                  style={{ background: "#ff6868" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* share-inner div end above */}
      </div>
    </AppModal>
  );
};

export default DeleteTeamModal;
