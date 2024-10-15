import { useAppDispatch, useAppSelector } from "core/hook";
import useLocalStorage from "core/utils/use-local-storage";
import { AuthResponse } from "pages/auth/auth.model";
import {
  getSharedFile as getTeamSharedFile,
  getSharedFileSender as getTeamSharedFileSender,
} from "pages/manage-team/team-files/team-files.redux";
import { FileSharedWithMe, FileType } from "pages/user-dashboard/dashboard.model";
import { getSharedFile, getSharedFileSender } from "pages/user-dashboard/dashboard.redux";
import React, { useState } from "react";
import { useLocation } from "react-router";
import {
  ROUTE_SHAREDWITHME_VIEW,
  ROUTE_TEAM_FILES,
  ROUTE_USER_DASHBOARD,
  SEARCH_RESULTS,
  SMART_VIEW,
} from "src/const";
import DeleteFileModal from "src/core/components/modals/delete-file-modal/delete-file-modal";
import ShareUserModal from "src/core/components/modals/share-file-modal/share-file-modal";
import { searchContract } from "src/layouts/admin/components/admin-header/header-auth.redux";
import { ReportFileType } from "src/pages/trash/trash.model";
import "./file-option.styles.scss";
interface FileOptionType {
  file: FileType | FileSharedWithMe;
}

const FileOption: React.FC<FileOptionType> = ({ file }) => {
  const [auth] = useLocalStorage<AuthResponse>("auth");
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [shareModal, setShareModal] = useState(false);
  const [deleteFile, setDeleteFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ReportFileType>();

  const { searchString, searchCurrentPage } = useAppSelector((state) => state.headerSearchContract);

  const handleShareFileDialogOpen = async (e: any) => {
    setShareModal(true);
    e.stopPropagation();
    setSelectedFile(file);
    if (location.pathname.includes(ROUTE_TEAM_FILES)) {
      await dispatch(getTeamSharedFile(file.id));
      await dispatch(getTeamSharedFileSender(1));
    } else if (location.pathname.includes(ROUTE_USER_DASHBOARD)) {
      await dispatch(getSharedFile(file.id));
      await dispatch(getSharedFileSender(1));
    } else if (location.pathname.includes(ROUTE_SHAREDWITHME_VIEW)) {
      await dispatch(getSharedFile(file.id));
      await dispatch(getSharedFileSender(1));
    } else if (location.pathname.includes(SMART_VIEW)) {
      await dispatch(getSharedFile(file.id));
      await dispatch(getSharedFileSender(1));
    } else if (location.pathname.includes(SEARCH_RESULTS)) {
      await dispatch(getSharedFile(file.id));
      await dispatch(getSharedFileSender(1));
    }
    // may require fallback
  };

  const handleCloseShareModal = async () => {
    // await dispatch(getRecentFilesList({ dataReset: true }));
    setShareModal(false);
    setSelectedFile(undefined);
  };

  const handleDeleteFile = (file: any) => {
    setDeleteFile(true);
    setSelectedFile(file);
  };

  const handleCloseDeleteModal = async () => {
    const payload = {
      keyword: searchString,
      pgn: searchCurrentPage - 1,
      mergeResponse: true,
    };
    dispatch(searchContract(payload));
    setDeleteFile(false);
    setSelectedFile(undefined);
  };

  const isReadyforShare = file.createdBy === auth.profileId;

  return (
    <>
      <div className="dropdown-container">
        <div className="dropdown-box">
          <ul>
            {isReadyforShare ? (
              <li onClick={(e) => handleShareFileDialogOpen(e)} className="border-bottom">
                Share
              </li>
            ) : (
              <li className={"file-not-ready-to-share border-bottom"}>Share</li>
            )}
            {/* <li className="border-bottom">Move</li> */}
            <li
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile({ id: file.id, fileName: file.fileName });
              }}
            >
              Delete
            </li>
          </ul>
        </div>
        <div className="notch"></div>
      </div>

      {shareModal && (
        // <ShareUserModal
        //   isOpen={shareModal}
        //   onClose={() => setShareModal(false)}
        //   fileName={file.fileName}
        //   store="dashboard"
        // />

        <ShareUserModal
          isOpen={shareModal}
          onClose={handleCloseShareModal}
          fileName={file?.fileName}
          store="dashboard"
          file={selectedFile}
        />
      )}

      {deleteFile && selectedFile && (
        <DeleteFileModal
          isOpen={deleteFile}
          onClose={handleCloseDeleteModal}
          shouldCloseOnOverlayClick={true}
          file={selectedFile}
          onlyFileDelete={true}
        />
      )}
    </>
  );
};

export default FileOption;
