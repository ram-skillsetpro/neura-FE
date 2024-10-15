import DeleteFileModal from "core/components/modals/delete-file-modal/delete-file-modal";
import ShareUserModal from "core/components/modals/share-file-modal/share-file-modal";
import { useAppDispatch, useAppSelector } from "core/hook";
import {
  encodeFileKey,
  getFileIcon,
  getFolderFromLocalStorage,
  getShortUsername,
  getUsernameColor,
} from "core/utils";
import { formatDateWithOrdinal, sharedUsersCount } from "core/utils/constant";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import { AuthResponse } from "pages/auth/auth.model";
import { FileType } from "pages/user-dashboard/dashboard.model";
import {
  deleteAllFile,
  getRecentFilesList,
  getSharedFile,
  getSharedFileSender,
  setSelectedItems,
} from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import FileRenameModal from "src/core/components/modals/folder-file-rename-modal/rename-modal";
import MoveFolderModal from "src/core/components/modals/move-folder-modal/move-folder-modal";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { handleFileToOpen } from "src/pages/contract/contract.redux";
import { FoldersAndFilesRename } from "src/pages/manage-team/team-files/team-files.redux";
import { ILocalStorageRouteData } from "../../dashboard-container";
import LinkContractPopup from "../link-contract/link-contract-popup";
import "./recent-files-view.scss";

const RecentFilesView: React.FC = () => {
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const [auth] = useLocalStorage<AuthResponse>("auth");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const recentFileList = useAppSelector((state) => state.dashboard.recentFilesList);
  const isLoading = useAppSelector((state) => state.dashboard.isRecentFilesLoading);
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [rows, setRows] = useState<Array<any>>([]);
  const [deleteFile, setDeleteFile] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType>();
  const [selectAll, setSelectAll] = useState(false);
  const { selectedItems } = useAppSelector((state) => state.dashboard);
  const [moveFileModal, setMoveFileModal] = useState(false);
  const allRecentFiles = useAppSelector((state) => state.dashboard.recentFilesResponse);

  const [paginationData, setPaginationData] = useState({
    totalItems: (allRecentFiles?.totct ?? 0) as number,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const [linkContractPopup, setLinkContractPopup] = useState<boolean>(false);
  const [fileRename, setFileRename] = useState(false);
  const [existingFileName, setExistingFileName] = useState<any>({});

  const { itemsPerPage } = paginationData;
  const totalCount = (allRecentFiles?.totct ?? 0) as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      dispatch(getRecentFilesList({ pgn: newPage, size: 10 }));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: (allRecentFiles?.totct ?? 0) as number,
    });
  }, [allRecentFiles]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setSelectAll(checked);
    if (checked) {
      const newVisibleItemIds = rows.map((item) => item.id);
      const uniqueItems = Array.from(new Set([...selectedItems, ...newVisibleItemIds]));
      dispatch(setSelectedItems(uniqueItems));
    } else {
      const visibleItemIds = rows.map((item) => item.id);
      const remainingSelectedItems = selectedItems.filter((id) => !visibleItemIds.includes(id));
      dispatch(setSelectedItems(remainingSelectedItems));
    }
  };

  useEffect(() => {
    const visibleItemIds = rows.map((item) => item.id);
    const allSelected = visibleItemIds.every((id) => selectedItems?.includes(id));
    setSelectAll(allSelected);
  }, [rows, selectedItems]);

  useEffect(() => {
    setSelectAll(false);
  }, [recentFileList]);

  const deleteAllRecentFiles = () => {
    const folder = getFolderFromLocalStorage() as ILocalStorageRouteData;
    if (selectedItems.length > 0) {
      dispatch(deleteAllFile({ fileIds: selectedItems.join(","), folder, myDriveFile: true }));
    }
  };

  useEffect(() => {
    if (location.pathname === "/admin/my-drive") {
      localStorage.setItem("previousPath", location.pathname);
    }

    return () => {
      if (location.pathname !== "/admin/file") {
        localStorage.removeItem("previousPath");
      }
    };
  }, [location.pathname]);

  const columns = [
    {
      key: "fileSelector",
      label: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            onClick={(event) => event.stopPropagation()}
          />
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
        <div className="file-list-action  capitalize">
          <div className="icon-option-wrap">
            <button className="icon-option-dot" onClick={(e) => handleFileOption(e, 0)}></button>
          </div>
          <div className="action-tool-tip">Bulk action</div>
          {activeFileOption === 0 && (
            <div className="dropdown-container">
              <div className="dropdown-box" style={{ width: "auto" }}>
                {selectedItems.length > 0 ? (
                  <ul>
                    <li onClick={deleteAllRecentFiles} className={`border-bottom`}>
                      Delete All
                    </li>
                  </ul>
                ) : (
                  <ul>
                    <li className={`border-bottom`}>
                      <div className="text-help">
                        Select items for <br />
                        bulk action
                      </div>
                    </li>
                  </ul>
                )}
              </div>
              <div className="notch"></div>
            </div>
          )}
        </div>
      ),
      isSorting: false,
    },
  ];

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prevSelectedItems: any) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id: number) => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
  }, []);

  useEffect(() => {
    setRows(recentFileList?.map((data) => dataGenerator(data)));
  }, [recentFileList, activeFileOption, selectedItems]);

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
            backgroundColor:
              user?.logoUrl === "" ? getUsernameColor(user.userName) || "" : "initial",
          }}
        >
          {user?.logoUrl !== "" ? <img src={user.logoUrl} /> : `${getShortUsername(user.userName)}`}
          <div className="tool-tip-card rounded-6">
            <div className="block font-bold">{user.userName}</div>
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
    await dispatch(getRecentFilesList({ dataReset: true }));
    setShareModal(false);
    setSelectedFile(undefined);
  };
  const handleDeleteFile = (file: any) => {
    setActiveFileOption(-1);
    setDeleteFile(true);
    setSelectedFile(file);
  };

  const handleCloseDeleteModal = async () => {
    await dispatch(getRecentFilesList({ dataReset: true }));
    setDeleteFile(false);
    setSelectedFile(undefined);
  };

  const handleCloseMoveModal = async () => {
    setMoveFileModal(false);
    setSelectedFile(undefined);
  };
  const handleMoveFolder = (item: FileType) => async (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    setActiveFileOption(-1);
    setMoveFileModal(true);
    setSelectedFile(item);
  };

  const handleLinkContract = (e: any, data: any) => {
    e.stopPropagation();
    setSelectedFile(data);
    setActiveFileOption(-1);
    setLinkContractPopup(true);
  };

  const handleRenameClick = (data: FileType) => {
    setExistingFileName({ id: data.id, fileName: data.fileName });
    setFileRename(true);
  };

  const handleRenameFiles = async (newRenameString: string) => {
    const payload = {
      fileId: existingFileName.id,
      fileName: newRenameString,
    };

    await dispatch(FoldersAndFilesRename(payload));
    await dispatch(getRecentFilesList({ dataReset: true }));
  };

  const dataGenerator = (data: FileType) => {
    return {
      id: data.id,
      fileSelector: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            onChange={() => toggleItemSelection(data.id)}
            onClick={(event) => event.stopPropagation()}
            checked={selectedItems?.includes(data.id)}
          />
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
                    folderId: (data as FileType).folderId,
                    status: (data as FileType).processStatus,
                    fileName: (data as FileType).fileName,
                    createdBy: (data as FileType).createdBy,
                    mimeType: data.mimeType,
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
                  {data.processStatus === 3 && data.createdBy === auth.profileId ? (
                    <li className="border-bottom" onClick={handleMoveFolder(data)}>
                      Move
                    </li>
                  ) : (
                    <li className={"file-not-ready-to-share border-bottom"}>Move</li>
                  )}
                  <li className={"border-bottom"} onClick={(e) => handleLinkContract(e, data)}>
                    Link Contracts
                  </li>
                  {auth.profileId === data.createdBy && (
                    <li className="border-bottom" onClick={() => handleRenameClick(data)}>
                      Rename
                    </li>
                  )}
                  <li
                    className={`border-bottom ${auth.profileId !== data.createdBy && "disabled"}`}
                    onClick={() => handleDeleteFile(data)}
                  >
                    Delete
                  </li>
                </ul>
              </div>
              <div className="notch"></div>
            </div>
          )}
        </div>
      ),
    };
  };

  const viewAllRecentFiles = () => {
    dispatch(getRecentFilesList({ pgn: 1, size: 10, dataReset: true }));
  };
  const getDefaultRecentFiles = () => {
    navigate(0);
  };

  const isViewAll = recentFileList?.length > 6;

  return (
    <AnimatePresence mode="wait">
      {rows.length > 0 && (
        <section className="mb-5">
          <div className="flex view-all-header mb-3 items-center">
            {isViewAll && (
              <button className="pageBack-btn ml-3" onClick={getDefaultRecentFiles}>
                <i className="icon-img"></i>
              </button>
            )}
            <h2 className="fs10 text-defaul-color font-normal tracking-wider uppercase ml-3">
              {!isViewAll ? "Recent" : ""} files
            </h2>
            {!isViewAll && (
              <button
                className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                onClick={viewAllRecentFiles}
              >
                view all
              </button>
            )}
          </div>
          <motion.div
            exit={{ opacity: 0, y: -100 }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DataTable
              className="file-list-card rounded-6 other-files-view"
              data={rows}
              columns={columns}
              enablePagination={recentFileList.length > 6}
              isLoading={isLoading}
              paginationData={paginationData}
              enableGoToPagination={true}
              onPageChange={getCurrentPageNumber}
            />
          </motion.div>
          {shareModal && selectedFile && (
            <ShareUserModal
              isOpen={shareModal}
              onClose={handleCloseShareModal}
              fileName={selectedFile?.fileName}
              store="dashboard"
              file={selectedFile}
            />
          )}
          {deleteFile && selectedFile && (
            <DeleteFileModal
              isOpen={deleteFile}
              onClose={() => {
                setDeleteFile(false);
                setSelectedFile(undefined);
              }}
              shouldCloseOnOverlayClick={true}
              file={selectedFile}
              onSuccess={handleCloseDeleteModal}
            />
          )}
          {moveFileModal && selectedFile && (
            <MoveFolderModal
              isOpen={moveFileModal}
              onClose={handleCloseMoveModal}
              shouldCloseOnOverlayClick={true}
              fileToMove={selectedFile}
            />
          )}

          {linkContractPopup && selectedFile && (
            <LinkContractPopup
              isOpen={linkContractPopup}
              onClose={() => {
                setLinkContractPopup(false);
              }}
              shouldCloseOnOverlayClick={true}
              selectedFile={selectedFile}
            />
          )}
          {fileRename && (
            <FileRenameModal
              isOpen={fileRename}
              onClose={() => setFileRename(false)}
              shouldCloseOnOverlayClick={true}
              existingFileName={existingFileName.fileName}
              handleRenameFiles={handleRenameFiles}
            />
          )}
        </section>
      )}
    </AnimatePresence>
  );
};

export default RecentFilesView;
