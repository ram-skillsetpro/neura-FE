import ShareUserModal from "core/components/modals/share-file-modal/share-file-modal";
import { useAppDispatch, useAppSelector } from "core/hook";
import { encodeFileKey, getFileIcon, getShortUsername, getUsernameColor } from "core/utils";
import { formatDateWithOrdinal, sharedUsersCount } from "core/utils/constant";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import {
  getFilterSharedWithMeFile,
  getSharedFile,
  getSharedFileSender,
  getSharedWithMeFile,
  updateFilesArrSharedWithMe,
} from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import DeleteFileModal from "src/core/components/modals/delete-file-modal/delete-file-modal";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { AuthResponse } from "src/pages/auth/auth.model";
import { handleFileToOpen } from "src/pages/contract/contract.redux";
import { FileSharedWithMe } from "../../dashboard.model";
import "./other-files-view.scss";
import "./recent-files-view.scss";
interface FilesSharedWithMeViewProps {
  monthId: string;
  fileName: string;
  isFilterActive?: boolean;
}

const columns = [
  {
    key: "fileSelector",
    label: (
      <div className="file-item-selector">
        <input type="checkbox" />
      </div>
    ),
    isSorting: false,
  },
  {
    key: "fileName",
    label: "Name",
    isSorting: false,
  },
  { key: "updatedOn", label: "Last Modified", isSorting: false },
  { key: "sharedWith", label: "Shared With", isSorting: false },
  {
    key: "action",
    label: (
      <div className="file-list-action">
        <span className="file-action">Action</span>
      </div>
    ),
    isSorting: false,
  },
];
const FilesSharedWithMeView: React.FC<FilesSharedWithMeViewProps> = ({
  monthId,
  fileName,
  isFilterActive,
}) => {
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const [auth] = useLocalStorage<AuthResponse>("auth");
  const navigate = useNavigate();
  const fileList = useAppSelector(
    (state) => (state.dashboard as any)[`SharedWithMeFileList_${monthId}`],
  );
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [deleteFile, setDeleteFile] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileSharedWithMe>();
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Array<any>>([]);

  const filesAllData = useAppSelector(
    (state) => (state.dashboard as any)[`SharedWithMeResponse_${monthId}`],
  );
  const [paginationData, setPaginationData] = useState({
    totalItems: filesAllData.totct as number,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
  }, []);

  const { itemsPerPage } = paginationData;
  const totalCount = filesAllData.totct as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      if (isFilterActive) {
        dispatch(getFilterSharedWithMeFile(newPage));
      } else {
        dispatch(getSharedWithMeFile(newPage, monthId));
      }
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: filesAllData.totct as number,
    });
  }, [filesAllData]);

  useEffect(() => {
    setRows(fileList?.map((data: FileSharedWithMe) => dataGenerator(data)));
  }, [fileList, activeFileOption]);

  const handleUserProfile = (data: number) => {
    const authData = localStorage.getItem("auth");
    let UserCheck, buttonAction;
    if (authData) {
      const parsedAuthData = JSON.parse(authData);
      if (parsedAuthData.profileId === data) {
        UserCheck = true;
        buttonAction = true;
        navigate("/admin/settings", {
          state: { showData: UserCheck, buttonAction },
        });
      } else {
        UserCheck = !!roleSuperAdmin;
        buttonAction = false;
        navigate("/admin/settings", {
          state: { showData: UserCheck, buttonAction, profileId: data },
        });
      }
    }
  };

  function getSharedWithUser(user: { id: number; userName: string; logoUrl: string }) {
    return (
      <li key={user.id} onClick={() => handleUserProfile(user.id)}>
        <div
          className="ic-member tool-tip-wrap"
          style={{
            backgroundColor: user?.logoUrl === "" ? getUsernameColor(user.userName) : "initial",
          }}
        >
          {user?.logoUrl !== "" ? <img src={user.logoUrl} /> : `${getShortUsername(user.userName)}`}
          <div className="tool-tip-card rounded-6">
            <div className="block font-bold">{user.userName}</div>
            {"Team Name"}
          </div>
        </div>
      </li>
    );
  }

  const handleShareFileDialogOpen = async (file: any) => {
    await dispatch(getSharedFile(file.id));
    await dispatch(getSharedFileSender(1));
    setShareModal(true);
    setActiveFileOption(-1);
    setSelectedFile(file);
  };

  const handleCloseShareModal = async () => {
    setShareModal(false);
    setSelectedFile(undefined);
    // TODO: update fileList when file is shared to recieve fresh data from BE
  };
  const handleDeleteFile = (file: any) => {
    setActiveFileOption(-1);
    setDeleteFile(true);
    setSelectedFile(file);
  };

  const handleCloseDeleteModal = async () => {
    if (selectedFile) {
      dispatch(updateFilesArrSharedWithMe(selectedFile.id, monthId));
    }
    setDeleteFile(false);
    setSelectedFile(undefined);
  };

  const dataGenerator = (data: FileSharedWithMe) => {
    return {
      fileSelector: (
        <div className="file-item-selector">
          <input type="checkbox" />
        </div>
      ),
      fileName: (
        <div className="file-list-name fs12 flex items-center">
          <i className={`w-20 h-20 mr-2`}>
            <img
              src={require(`assets/images/icon-${getFileIcon(data.fileName, data.mimeType)}.svg`)}
            />
          </i>
          <div
            className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
            onClick={(event) => {
              if (event.ctrlKey || event.metaKey) {
                const encodedString = encodeFileKey({
                  id: data.id,
                  teamId: data.teamId,
                  folderId: data.folderId,
                  fileName: data.fileName,
                });
                window.open(`/admin/file?key=${encodedString}`, "_blank");
              } else {
                dispatch(
                  handleFileToOpen({
                    id: data.id,
                    teamId: data.teamId,
                    folderId: (data as FileSharedWithMe).folderId,
                    status: (data as FileSharedWithMe).processStatus,
                    fileName: (data as FileSharedWithMe).fileName,
                    createdBy: (data as FileSharedWithMe).createdBy,
                    mimeType: (data as FileSharedWithMe).mimeType || "",
                  }),
                );
              }
            }}
            data-fulltext={data.fileName}
          >
            {data.fileName}
          </div>
        </div>
      ),
      updatedOn: (
        <div className="file-list-modified fs12">
          {data.updatedOn
            ? formatDateWithOrdinal(new Date(data.updatedOn * 1000))
            : formatDateWithOrdinal(new Date(data.createdOn * 1000))}
        </div>
      ),
      sharedWith: (
        <div className="file-list-shared fs12">
          <div className="flex">
            <div className="sharing-members li-overlap">
              <ul>
                {data.sharedWith === null && "-"}
                {data.sharedWith?.length <= sharedUsersCount
                  ? data?.sharedWith?.map((user) => getSharedWithUser(user))
                  : data?.sharedWith
                      ?.slice(0, sharedUsersCount)
                      .map((user) => getSharedWithUser(user))}
                {data.sharedWith?.length > sharedUsersCount && (
                  <li>
                    <div className="share-list-wrap">
                      <div className="shared-all">
                        +{data.sharedWith?.length - sharedUsersCount}
                      </div>
                      <div className="shared-all-list">
                        {data.sharedWith
                          ?.slice(-(data.sharedWith?.length - sharedUsersCount))
                          .map((user) => (
                            <div
                              className="shared-all-row fs11 font-bold items-center"
                              key={user.id}
                            >
                              <i className="u-img-size mr-4 rounded-full">
                                {user?.logoUrl !== "" ? (
                                  <img src={user.logoUrl} />
                                ) : (
                                  <div
                                    className="ic-member"
                                    style={{
                                      backgroundColor:
                                        user?.logoUrl === ""
                                          ? getUsernameColor(user.userName)
                                          : "initial",
                                    }}
                                  >
                                    {user?.userName !== "" && getShortUsername(user.userName)}
                                  </div>
                                )}
                              </i>
                              <span className="truncate-line1">{user.userName}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ),
      action: (
        <div className="file-list-action">
          <button
            className="icon-option-dot"
            onClick={(e) => handleFileOption(e, data.id)}
          ></button>
          {activeFileOption === data.id && (
            <div className="dropdown-container">
              <div className="dropdown-box">
                <ul>
                  {data.processStatus === 3 && data.createdBy === auth.profileId ? (
                    <li onClick={() => handleShareFileDialogOpen(data)} className="border-bottom">
                      Share
                    </li>
                  ) : (
                    <li className={"file-not-ready-to-share border-bottom"}>Share</li>
                  )}
                  {data.createdBy === auth.profileId ? (
                    <li onClick={() => handleDeleteFile(data)} className="border-bottom">
                      Delete
                    </li>
                  ) : (
                    <li className={"file-not-ready-to-share border-bottom"}>Delete</li>
                  )}
                </ul>
              </div>
              <div className="notch"></div>
            </div>
          )}
        </div>
      ),
    };
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {rows && rows.length > 0 && (
          <section className="mb-5">
            <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase">
              {fileName}
            </h2>
            <motion.div
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <DataTable
                className="file-list-card rounded-6 other-files-view"
                data={rows}
                columns={columns}
                paginationData={paginationData}
                onPageChange={getCurrentPageNumber}
                enablePagination={true}
              />
            </motion.div>
            {shareModal && selectedFile && (
              <ShareUserModal
                isOpen={shareModal}
                onClose={handleCloseShareModal}
                fileName={selectedFile?.fileName}
                store="dashboard"
              />
            )}
            {deleteFile && selectedFile && (
              <DeleteFileModal
                isOpen={deleteFile}
                onClose={handleCloseDeleteModal}
                shouldCloseOnOverlayClick={true}
                file={selectedFile}
              />
            )}
          </section>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilesSharedWithMeView;
