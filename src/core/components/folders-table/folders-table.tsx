import DeleteFolderModal from "core/components/modals/delete-folder-modal/delete-folder-modal";
import ShareUserModal from "core/components/modals/share-file-modal/share-file-modal";
import { useAppDispatch, useAppSelector } from "core/hook";
import { AnimatePresence, motion } from "framer-motion";
import { FolderType } from "pages/user-dashboard/dashboard.model";
import {
  getFilePerPage,
  getFilesFolders,
  getFoldersPerPage,
} from "pages/user-dashboard/dashboard.redux";
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

import MoveFolderModal from "core/components/modals/move-folder-modal/move-folder-modal";
import { createPath, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LS_FILES_FOLDERS_ROUTE } from "src/core/utils/constant";
import useLocalStorage from "src/core/utils/use-local-storage";
import { AuthResponse } from "src/pages/auth/auth.model";
import {
  TeamsFoldersAndFilesRename,
  clearSearchFoldersFetched,
  getFoldersOnSearch,
  isFolderExistOnSearch,
} from "src/pages/manage-team/team-files/team-files.redux";
import FileRenameModal from "../modals/folder-file-rename-modal/rename-modal";
import "./folder-table.scss";
interface FolderTableProps {
  addFolderToTraversePath: (folder: FolderType, clearPath: boolean) => Promise<void>;
  title?: string;
  route?: string;
}

const FoldersTable: React.FC<FolderTableProps> = ({
  title = "Folders",
  addFolderToTraversePath,
  route = LS_FILES_FOLDERS_ROUTE,
}) => {
  const dispatch = useAppDispatch();
  const foldersData = useAppSelector((state) => state.dashboard.foldersResponse);
  const foldersList = useAppSelector((state) => state.dashboard.folderList);
  const totalPages = Math.ceil(foldersData.totct / foldersData.perpg);
  const [auth] = useLocalStorage<AuthResponse>("auth");
  const [activeFolderOption, setActiveFolderOption] = useState(-1);
  const searchListRef = useRef<HTMLDivElement>(null);
  const [deleteFolder, setDeleteFolder] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [moveFolderModal, setMoveFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderType>();
  const [searchText, setSearchText] = useState("");
  const SearchFolderResponse = useAppSelector((state) => state.teamDashboard.SearchFolderResponse);
  const [isProcessing, setIsProcessing] = useState(false);
  const [folderRename, setFolderRename] = useState(false);
  const [existingFolderName, setExistingFolderName] = useState<any>({});

  const handleFolderOption = (folder: FolderType) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActiveFolderOption(folder.id);
  };

  // const handleShareFolderDialogOpen =
  //   (folder: FolderType) => async (e: React.MouseEvent<HTMLLIElement>) => {
  //     e.stopPropagation();
  //     await dispatch(getSharedFile(folder.id)); getSharedFolder API is required
  //     await dispatch(getSharedFileSender(1));  same as above
  //     setShareModal(true);
  //     setActiveFolderOption(-1);
  //     setSelectedFolder(folder);
  //   };

  const handleCloseShareModal = async () => {
    // await dispatch(getFilesFolders());
    setShareModal(false);
    setSelectedFolder(undefined);
  };
  const handleCloseDeleteModal = async () => {
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;

    await dispatch(getFoldersPerPage(folder?.pgn ?? 1, folder));
    // await dispatch(getFilePerPage(folder.filePgn ?? 1, folder));
    setDeleteFolder(false);
    setSelectedFolder(undefined);
  };
  const handleCloseMoveModal = async () => {
    setMoveFolderModal(false);
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;

    await dispatch(getFilesFolders(1, folder));
    await dispatch(getFilePerPage(1, folder));
    setSelectedFolder(undefined);
  };

  const handleDeleteFolder = (file: any) => async (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    setActiveFolderOption(-1);
    setDeleteFolder(true);
    setSelectedFolder(file);
  };

  // const handleMoveFolder = (item: FolderType) => async (e: React.MouseEvent<HTMLLIElement>) => {
  //   e.stopPropagation();
  //   setActiveFolderOption(-1);
  //   setMoveFolderModal(true);
  //   setSelectedFolder(item);
  // };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFolderOption(-1);
    });
  }, []);

  const handleItemClicked = async (folder: FolderType, clearPath: boolean = false) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await addFolderToTraversePath(folder, clearPath);
    } catch (error) {
      console.error("Error handling folder click:", error);
    }
    setIsProcessing(false);
  };

  const location = useLocation();
  const routeDataMap = useMemo(
    () => location.state?.routeDataMap ?? {},
    [location.state?.routeDataMap],
  );
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const navValue = searchParams.get("folders") || "";

  const handleLoadMore = (newPage: number) => {
    if (newPage >= 1 && newPage <= foldersData.totct) {
      const folder = routeDataMap[navValue]
        ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
        : undefined;
      dispatch(getFoldersPerPage(newPage, folder));

      const updatedRouteData = routeDataMap[navValue].map((item: any) => {
        if (item.id === folder.id) {
          return {
            ...item,
            pgn: newPage,
          };
        }
        return item;
      });
      routeDataMap[navValue] = updatedRouteData;
      const fullPath = createPath({
        pathname: location.pathname,
        search: `?folders=${navValue}`,
      });
      navigate(fullPath, {
        state: {
          ...location.state,
          routeDataMap: { ...location.state?.routeDataMap, [navValue]: updatedRouteData },
        },
      });
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setSearchText(newInput);
    if (newInput.length > 2) {
      dispatch(getFoldersOnSearch(newInput));
    } else {
      dispatch(clearSearchFoldersFetched());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchListRef.current && !searchListRef.current.contains(event.target as Node)) {
        setSearchText("");
        dispatch(clearSearchFoldersFetched());
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      setSearchText("");
    };
  }, [navValue]);

  const handleRenameClick = (data: any) => async (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    setExistingFolderName({ id: data.id, folderName: data.folderName, teamId: data?.teamId });
    setFolderRename(true);
  };

  const handleRenameFolder = async (newRenameString: string) => {
    const payload = {
      folderId: existingFolderName.id,
      folderName: newRenameString,
      teamId: existingFolderName.teamId,
    };
    await dispatch(TeamsFoldersAndFilesRename(payload));
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;
    dispatch(getFoldersPerPage(folder?.pgn || 1, folder));
  };

  return (
    <AnimatePresence mode="sync">
      {foldersList.length > 0 && (
        <section className="mb-5">
          <div className="flex view-all-header mb-3 justify-between">
            <div>
              <h2 className="fs10 text-defaul-color font-normal tracking-wider uppercase ml-3">
                {title}
              </h2>
            </div>
            <div>
              <div className="src-sec" ref={searchListRef}>
                <input
                  type="search"
                  placeholder="Search Folder"
                  className="magnifier-input"
                  value={searchText}
                  onChange={handleInputChange}
                />
                <button className="magnifier-btn">
                  <i className="magnifier-ic"></i>
                </button>
                {SearchFolderResponse.length > 0 && (
                  <div className="folder-suggestion-list">
                    <ul>
                      {SearchFolderResponse.map((folder, idx) => {
                        const parts = [
                          folder.teamName,
                          "...",
                          folder.parentFolderName,
                          folder.folderName,
                        ].filter(Boolean);

                        const displayName = parts.map((part, i, arr) => (
                          <span
                            key={i}
                            style={{
                              fontWeight: i === arr.length - 1 ? "bold" : "normal",
                            }}
                          >
                            {part}
                            {i < arr.length - 1 && (
                              <span style={{ fontWeight: "bold" }}> &gt; </span>
                            )}
                          </span>
                        ));
                        let modifiedFolder;
                        let modifiedParentFolder: FolderType;
                        if (folder.parentFolderId) {
                          modifiedParentFolder = {
                            createdBy: folder.createdBy,
                            createdOn: folder.createdOn,
                            firstName: "",
                            folderName: folder.parentFolderName,
                            id: folder.parentFolderId,
                            parentFolderId: null,
                            status: folder.status,
                            teamId: folder.teamId,
                            updatedOn: 0,
                          };

                          modifiedFolder = {
                            createdBy: folder.createdBy,
                            createdOn: folder.createdOn,
                            firstName: "",
                            folderName: folder.folderName,
                            id: folder.folderId,
                            parentFolderId: folder.parentFolderId,
                            status: folder.status,
                            teamId: folder.teamId,
                            updatedOn: 0,
                          };
                        } else {
                          modifiedFolder = {
                            createdBy: folder.createdBy,
                            createdOn: folder.createdOn,
                            firstName: "",
                            folderName: folder.folderName,
                            id: folder.folderId,
                            parentFolderId: null,
                            status: folder.status,
                            teamId: folder.teamId,
                            updatedOn: 0,
                          };
                        }
                        return (
                          <li
                            key={folder.folderId}
                            className="cursor-pointer"
                            onClick={() => {
                              if (folder.parentFolderId) {
                                dispatch(isFolderExistOnSearch(true));
                                localStorage.setItem("parentSearchExist", JSON.stringify(true));
                                handleItemClicked(modifiedParentFolder, true);
                                setTimeout(() => {
                                  localStorage.removeItem("parentSearchExist");
                                  handleItemClicked(modifiedFolder);
                                }, 500);
                                setSearchText("");
                                dispatch(clearSearchFoldersFetched());
                              } else {
                                dispatch(isFolderExistOnSearch(false));
                                handleItemClicked(modifiedFolder, true);
                                setSearchText("");
                                dispatch(clearSearchFoldersFetched());
                              }
                            }}
                          >
                            {displayName}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="folder-sec">
            {foldersList.map((folder) => (
              <motion.div
                exit={{ opacity: 0, y: -100 }}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="folder-card"
                key={folder.id}
              >
                <div
                  className="folder-col cursor-default"
                  onClick={() => handleItemClicked(folder)}
                >
                  <div className="folder-img">
                    <i className="folder-img-color"></i>
                  </div>
                  <div className="file-title tool-tip-text" data-fulltext={folder.folderName}>
                    {folder.folderName}
                  </div>
                  <div className="folder-action">
                    <button
                      className="icon-option-dot"
                      onClick={handleFolderOption(folder)}
                    ></button>
                    {activeFolderOption === folder.id && (
                      <div className="dropdown-container">
                        <div className="dropdown-box">
                          <ul>
                            {/* {folder.createdBy === auth.profileId ? (
                              <li onClick={handleShareFolderDialogOpen(folder)}>Share</li>
                            ) : (
                              <li className="disabled">Share</li>
                            )} */}
                            {/* <li>Share</li> */}
                            {/* <li onClick={handleMoveFolder(folder)}>Move</li> */}
                            <li onClick={handleDeleteFolder(folder)}>Delete</li>
                            {auth.profileId === folder.createdBy && (
                              <li className="border-bottom" onClick={handleRenameClick(folder)}>
                                Rename
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="notch"></div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {foldersData.isLoading ? (
            <div className="flex justify-end">
              <div className="simpleO-loader"></div>
            </div>
          ) : (
            <div className={`flex ${foldersData.pgn > 1 ? "justify-between" : "justify-end"}`}>
              {foldersData.pgn > 1 && (
                <div className="dataTables_info" id="myTable_info" role="status" aria-live="polite">
                  <div className="mt-3 mb-2 flex justify-center">
                    <button
                      className={`load-more-btn paginate_button next ${
                        foldersData.pgn === 1 ? "disabled" : ""
                      }`}
                      onClick={() => handleLoadMore(foldersData.pgn - 1)}
                    >
                      Load Previous
                    </button>
                  </div>
                </div>
              )}
              {foldersData.pgn === totalPages && totalPages > 1 ? (
                <div
                  className="dataTables_info flex"
                  id="myTable_info"
                  role="status"
                  aria-live="polite"
                >
                  <div className="mt-3 mb-2 flex items-center justify-end">
                    <div className="text-light-color fs12 font-bold mr-3">
                      Page {foldersData.pgn} of {totalPages}
                    </div>
                  </div>
                </div>
              ) : totalPages > 1 ? (
                <div
                  className="dataTables_info flex"
                  id="myTable_info"
                  role="status"
                  aria-live="polite"
                >
                  <div className="mt-3 mb-2 flex items-center justify-end">
                    <div className="text-light-color fs12 font-bold mr-3">
                      Page {foldersData.pgn} of {totalPages}
                    </div>
                  </div>
                  <div className="mt-3 mb-2 flex justify-center">
                    <button
                      className={`load-more-btn paginate_button next ${
                        foldersData.pgn === totalPages ? "disabled" : ""
                      }`}
                      onClick={() => handleLoadMore(foldersData.pgn + 1)}
                    >
                      Load Next
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      )}
      {shareModal && selectedFolder && (
        <ShareUserModal
          isOpen={shareModal}
          onClose={handleCloseShareModal}
          fileName={selectedFolder?.folderName}
          store="dashboard"
        />
      )}
      {deleteFolder && selectedFolder && (
        <DeleteFolderModal
          isOpen={deleteFolder}
          onClose={() => setDeleteFolder(false)}
          shouldCloseOnOverlayClick={true}
          folder={selectedFolder}
          onSuccess={handleCloseDeleteModal}
        />
      )}
      {moveFolderModal && selectedFolder && (
        <MoveFolderModal
          isOpen={moveFolderModal}
          onClose={handleCloseMoveModal}
          shouldCloseOnOverlayClick={true}
          folderToMove={selectedFolder}
        />
      )}
      {folderRename && (
        <FileRenameModal
          isOpen={folderRename}
          onClose={() => setFolderRename(false)}
          shouldCloseOnOverlayClick={true}
          existingFileName={existingFolderName.folderName}
          handleRenameFiles={handleRenameFolder}
        />
      )}
    </AnimatePresence>
  );
};

export default FoldersTable;
