import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import React from "react";
import "./playbook.scss";

interface PlayBookConsentModal extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  handleOK: () => void;
}

const PlayBookConsent: React.FC<PlayBookConsentModal> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  handleOK,
}) => {
  return (
    <AppModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      onClose={onClose}
    >
      <div className="playbook-outer-wrap">
        <div className="playbook-inner">
          <div className="w-full mb-5">
            <div className="fs14 font-bold mb-5 text-body">
              Changing the contract type will remove already added contracts. Do you confirm?
            </div>
          </div>
          <div className="flex items-center border-t pt-3">
            <div className="grow">
              <div className="flex justify-end">
                <button className="remove-button uppercase tracking-wider mr-3" onClick={onClose}>
                  Cancel
                </button>
                <button className="green-button uppercase tracking-wider" onClick={handleOK}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default PlayBookConsent;
