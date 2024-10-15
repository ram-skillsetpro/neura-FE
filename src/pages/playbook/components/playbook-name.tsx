import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import React, { useState } from "react";
import "./playbook.scss";

interface PlaybookNameModal extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  handleAddPlaybookList: (playBookName: string) => void;
}

const PlayBookName: React.FC<PlaybookNameModal> = ({
  isOpen,
  onClose,
  handleAddPlaybookList,
  shouldCloseOnOverlayClick,
}) => {
  const [playBookName, setPlayBookName] = useState("");
  const [nameError, setNameError] = useState(false);
  const handleSave = () => {
    if (playBookName) {
      handleAddPlaybookList(playBookName);
      onClose();
    } else {
      setNameError(true);
    }
  };
  return (
    <AppModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      onClose={onClose}
    >
      <div className="playbook-outer-wrap">
        <div className="playbook-inner">
          <div className="w-full mb-5">
            <div className="fs14 font-bold mb-5 text-body">You are adding Playbook Name</div>
            <form>
              <div className="w-full mb-4 relative">
                <input
                  value={playBookName}
                  onChange={(e) => setPlayBookName(e.target.value)}
                  placeholder="Playbook name"
                  className="input-box"
                />
              </div>
            </form>
            {nameError && playBookName === "" && (
              <div className="contract-input-error mt-3 mb-5">{"Please enter playbook name"}</div>
            )}
          </div>
          <div className="flex items-center border-t pt-3">
            <div className="grow">
              <div className="flex justify-end">
                <button className="remove-button uppercase tracking-wider mr-3" onClick={onClose}>
                  Cancel
                </button>
                <button className="green-button uppercase tracking-wider" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default PlayBookName;
