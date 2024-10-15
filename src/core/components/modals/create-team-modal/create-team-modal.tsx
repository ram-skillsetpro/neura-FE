import React, { useEffect, useRef, useState } from "react";
import { POPUP_TOAST } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { Toaster } from "src/core/models/toaster.model";
import { CreateTeamType } from "src/pages/manage-team/team.model";
import {
  clearCreateTeamResponse,
  clearEditTeamResponse,
  createTeam,
} from "src/pages/manage-team/team.redux";
import AppModal from "../app-modal";
import { AppModalType } from "../app-modal.model";
import "./create-team-modal.scss";

interface CreateTeamModalType extends AppModalType {
  focusMove?: () => void;
}

const CreateTeamModal: React.FC<CreateTeamModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  focusMove,
}) => {
  const dispatch = useAppDispatch();

  const { editTeamResponseStatus, createTeamResponseStatus } = useAppSelector(
    (state) => state.team,
  );

  const teamNameRef = useRef<HTMLInputElement | null>(null);

  const [teamForm, setTeamForm] = useState<CreateTeamType>({
    teamName: "",
    teamDescription: "",
  });
  const [teamNameError, setTeamNameError] = useState<string>("");

  const handleCreateTeam = () => {
    if (teamForm.teamName.trim()) {
      const { teamName, teamDescription } = teamForm;
      dispatch(createTeam({ teamName, teamDescription }));
      setTimeout(() => {
        focusMove?.();
      }, 800);
      return;
    }

    setTeamNameError("Please fill team name");
    teamNameRef.current && teamNameRef.current.focus();
  };

  useEffect(() => {
    if (createTeamResponseStatus === 200) {
      setTeamForm({ teamName: "", teamDescription: "" });
      onClose && onClose();
      window.dispatchEvent(
        new CustomEvent<Toaster>(POPUP_TOAST, {
          detail: {
            type: "success",
            message: "Team created successfully",
          },
        }),
      );
      dispatch(clearCreateTeamResponse());
    }

    return () => {
      dispatch(clearCreateTeamResponse());
    };
  }, [createTeamResponseStatus]);

  useEffect(() => {
    if (editTeamResponseStatus === 200) {
      onClose && onClose();
      window.dispatchEvent(
        new CustomEvent<Toaster>(POPUP_TOAST, {
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
            <div className="fs14 font-bold mb-5 text-body">Create Team</div>
            <form>
              <div className="w-full mb-4 relative">
                <input
                  ref={teamNameRef}
                  value={teamForm.teamName}
                  onChange={(e) =>
                    setTeamForm((prevState) => ({ ...prevState, teamName: e.target.value }))
                  }
                  placeholder="Team Name"
                  className={`input-box ${teamNameError === "" ? "" : "error-state"}`}
                />

                {teamNameError === "" ? (
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
                <button
                  className="green-button uppercase tracking-wider"
                  onClick={handleCreateTeam}
                >
                  Create
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

export default CreateTeamModal;
