import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import "core/components/modals/delete-file-modal/delete-file-modal.scss";
import { useAppDispatch } from "core/hook";
import { CommonService } from "core/services/common.service";
import { deleteFolder } from "pages/user-dashboard/dashboard.redux";
import React from "react";
import { useLocation } from "react-router-dom";
import { ROUTE_TEAM_FILES } from "src/const";
import { LS_TEAM } from "src/core/utils/constant";
import useLocalStorage from "src/core/utils/use-local-storage";
import { TeamListType } from "src/pages/manage-team/team.model";
import { FolderType } from "src/pages/user-dashboard/dashboard.model";

interface DeleteFolderModalType extends AppModalType {
  folder: FolderType;
  onClose: () => void;
  onSuccess?: () => void;
}

const DeleteFolderModal: React.FC<DeleteFolderModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  folder,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [teamData] = useLocalStorage<TeamListType>(LS_TEAM);

  const handleDeleteFolder = async () => {
    const reqBody = {
      folderId: folder.id,
      teamId: location.pathname.includes(ROUTE_TEAM_FILES) ? teamData?.id : undefined,
    };
    const resp = await dispatch(deleteFolder(reqBody));
    if (!!resp?.isSuccess && onSuccess) {
      CommonService.popupToast({
        type: "success",
        message: resp.message[0] ?? "Deleted Successfully",
      });
      onSuccess();
    }
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      <div className="delete-team-modal">
        <div className="delete-team-modal-header">
          <div>Delete Folder</div>
          <div onClick={onClose} className="close-popups"></div>
        </div>
        <div className="delete-team-modal-body">
          <div>
            Do you want to delete this folder?
            <div>
              Folder Name: <span>{folder.folderName}</span>
            </div>
          </div>
        </div>
        <div className="delete-team-modal-footer">
          <button className="button button-red" onClick={handleDeleteFolder}>
            Delete
          </button>
        </div>
      </div>
    </AppModal>
  );
};

export default DeleteFolderModal;
