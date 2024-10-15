import React from "react";
import { useAppDispatch } from "src/core/hook";
import { ExtractedSummary } from "src/pages/contract/contract.model";
import { readSideBarContent, updateSummary } from "src/pages/contract/contract.redux";
import AppModal from "../../app-modal";
import { AppModalType } from "../../app-modal.model";
import "../../edit-team-modal/delete-team-modal/delete-team-modal.scss";

interface Section {
  key: string;
  value: any[] | string;
}

interface DeleteSummaryItemModalType extends AppModalType {
  mainClauseData: any[];
  section: Section;
  summary: string;
  fileId: number,
  teamId: number,
  folderId: number,
  onClose: () => void,
  setEditPopUpClose: () => void,
}

const DeleteSummaryItemModal: React.FC<DeleteSummaryItemModalType> = ({
  isOpen,
  onClose,
  setEditPopUpClose,
  shouldCloseOnOverlayClick,
  section,
  summary,
  mainClauseData,
  fileId,
  teamId,
  folderId,
}) => {

  const dispatch = useAppDispatch();

  const removeKeyFromMainClause = async () => {
    const newData = mainClauseData.filter((item) => item.key !== section.key);

    const payload: ExtractedSummary = {
      extractedJson: JSON.stringify({
        summary: summary,
        data: newData,
      }),
      fileId: fileId,
      teamId: teamId,
      folderId: folderId,
    };
    const result = await dispatch(updateSummary(payload));
    if (result?.isSuccess) {
      onClose();
      setEditPopUpClose();
      dispatch(readSideBarContent({ fileId: fileId, teamId: teamId, folderId: folderId }));
    }
  };

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
            <div className="fs14 font-bold mb-5 text-body">Delete {section?.key?.toUpperCase()}</div>
          </div>
          <div className="flex items-center border-t pt-3">
            <div className="w-content-left">
              Are you sure you want to delete "{section?.key?.toUpperCase()}" from extraction ?
              <div>
                <span style={{ fontWeight: "bold", color: "#ff6868" }}></span>
              </div>
            </div>
            <div className="grow">
              <div className="flex justify-end">
                <button className="remove-button uppercase tracking-wider mr-3" onClick={onClose}>
                  Cancel
                </button>
                <button
                  onClick={removeKeyFromMainClause}
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

export default DeleteSummaryItemModal;
