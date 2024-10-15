import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import { useAppDispatch, useAppSelector } from "core/hook";
import { deleteFile, getFilePerPage } from "pages/user-dashboard/dashboard.redux";
import React from "react";
import { getFolderFromLocalStorage, truncateString } from "src/core/utils";
import { ReportFileType } from "src/pages/trash/trash.model";
import { FileSharedWithMe, FileType } from "src/pages/user-dashboard/dashboard.model";
import "./delete-file-modal.scss";

interface DeleteFileModalType extends AppModalType {
  file: FileType | FileSharedWithMe | ReportFileType;
  onClose: () => void;
  onlyFileDelete?: boolean;
  onSuccess?: () => void;
}

const DeleteFileModal: React.FC<DeleteFileModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  file,
  onlyFileDelete = false,
  onSuccess,
}) => {
  const fileListPageCount = useAppSelector((state) => state.dashboard.fileListPageCount);
  const dispatch = useAppDispatch();
  const handleDeleteFile = async () => {
    const folder = getFolderFromLocalStorage();
    const resp = await dispatch(deleteFile(file.id));
    if (resp?.isSuccess && onSuccess) {
      // CommonService.popupToast({
      //   type: "success",
      //   message: resp.message[0] ?? "Deleted Successfully",
      // });
      onSuccess();
    }
    !onlyFileDelete && (await dispatch(getFilePerPage(fileListPageCount, folder, true)));
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
          <div>Delete File</div>
          <div onClick={onClose} className="close-popups"></div>
        </div>
        <div className="delete-team-modal-body">
          <div>
            Do you want to delete this file?
            <div>
              File Name:{" "}
              <span className="tool-tip-text" data-fulltext={file.fileName}>
                {truncateString(file.fileName, 10, 10)}
              </span>
            </div>
          </div>
        </div>
        <div className="delete-team-modal-footer">
          <button className="button button-red" onClick={handleDeleteFile}>
            Delete
          </button>
        </div>
      </div>
    </AppModal>
  );
};

export default DeleteFileModal;
