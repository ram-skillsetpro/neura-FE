import React, { useEffect, useRef, useState } from "react";
import { TOAST } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { Toaster } from "src/core/models/toaster.model";
import { CreateTeamType } from "src/pages/manage-team/team.model";
import { clearEditTeamResponse, editTeam } from "src/pages/manage-team/team.redux";
import AppModal from "../app-modal";
import { AppModalType } from "../app-modal.model";
import "./edit-team-modal.scss";

interface EditTeamModalType extends AppModalType {
  team: { teamName: string; teamDescription: string; id: number; teamId: number };
}

const EditTeamModal: React.FC<EditTeamModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  team,
}) => {
  const dispatch = useAppDispatch();

  const { id: teamId, teamName, teamDescription } = team;

  const { editTeamResponseStatus } = useAppSelector((state) => state.team);

  const teamNameRef = useRef<HTMLInputElement | null>(null);

  const [teamForm, setTeamForm] = useState<CreateTeamType>({
    teamName,
    teamDescription,
  });

  const handleEditTeam = () => {
    if (teamForm.teamName.trim()) {
      const { teamName, teamDescription } = teamForm;
      dispatch(editTeam({ teamName, teamDescription, teamId }));
      return;
    }

    teamNameRef.current && teamNameRef.current.focus();
  };

  useEffect(() => {
    if (editTeamResponseStatus === 200) {
      onClose && onClose();
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "success",
            message: "Team updated successfully",
          },
        }),
      );
      dispatch(clearEditTeamResponse());
    }

    return () => {
      dispatch(clearEditTeamResponse());
    };
  }, [editTeamResponseStatus]);

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
            <div className="fs14 font-bold mb-5 text-body">Edit Team</div>
            <form>
              <div className="w-full mb-4 relative">
                <input
                  ref={teamNameRef}
                  value={teamForm.teamName}
                  onChange={(e) =>
                    setTeamForm((prevState) => ({ ...prevState, teamName: e.target.value }))
                  }
                  placeholder="Team Name"
                  className={`input-box ${teamForm.teamName ? "" : "error-state"}`}
                />

                {teamForm.teamName ? (
                  ""
                ) : (
                  <div className="error-message">Please fill team name</div>
                )}
              </div>
              <div className="w-full mb-4 relative">
                <textarea
                  rows={5}
                  value={teamForm.teamDescription}
                  onChange={(e) =>
                    setTeamForm((prevState) => ({ ...prevState, teamDescription: e.target.value }))
                  }
                  placeholder="Description"
                  className="input-box"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center border-t pt-3">
            <div className="grow">
              <div className="flex justify-end">
                <button className="remove-button uppercase tracking-wider mr-3" onClick={onClose}>
                  Cancel
                </button>
                <button className="green-button uppercase tracking-wider" onClick={handleEditTeam}>
                  Edit
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

export default EditTeamModal;
