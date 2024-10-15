import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import React, { useEffect, useState } from "react";
import "./file-folder-rename-modal.scss";

interface RenameModal extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  handleRenameFiles: (fileRename: string) => void;
  existingFileName: string;
}

const FileRenameModal: React.FC<RenameModal> = ({
  isOpen,
  onClose,
  handleRenameFiles,
  shouldCloseOnOverlayClick,
  existingFileName,
}) => {
  // Function to determine if a name has an extension
  const hasExtension = (name: string) => name.includes(".") && name.lastIndexOf(".") > 0;

  const fileExtension = hasExtension(existingFileName)
    ? existingFileName.slice(existingFileName.lastIndexOf("."))
    : "";
  const initialFileName = hasExtension(existingFileName)
    ? existingFileName.slice(0, existingFileName.lastIndexOf("."))
    : existingFileName;

  const [fileRename, setFileRename] = useState(initialFileName);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFileRename(initialFileName);
      setNameError(false);
    }
  }, [isOpen, initialFileName]);

  const handleSave = () => {
    if (fileRename) {
      handleRenameFiles(fileRename + fileExtension);
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
            <div className="fs14 font-bold mb-5 text-body">Rename your file or folder name.</div>
            <form>
              <div className="w-full mb-4 relative">
                <input
                  value={fileRename}
                  onChange={(e) => setFileRename(e.target.value)}
                  placeholder="Rename"
                  className="input-box"
                />
              </div>
            </form>
            {nameError && fileRename === "" && (
              <div className="contract-input-error mt-3 mb-5">{"Please enter a name"}</div>
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

export default FileRenameModal;
