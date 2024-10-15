import DeleteFileModal from "core/components/modals/delete-file-modal/delete-file-modal";
import MoveFolderModal from "core/components/modals/move-folder-modal/move-folder-modal";
import ShareUserModal from "core/components/modals/share-file-modal/share-file-modal";
import { useAppDispatch, useAppSelector } from "core/hook";
import {
  encodeFileKey,
  getFileIcon,
  getFolderFromLocalStorage,
  getShortUsername,
  getUsernameColor,
} from "core/utils";
import { LS_TEAM, formatDateWithOrdinal, sharedUsersCount } from "core/utils/constant";
import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import { AuthResponse } from "pages/auth/auth.model";
import {
  FoldersAndFilesRename,
  getFilterDataTeamDrive,
  getSharedFile,
  getSharedFileSender,
  getTeamFilesPerPage,
} from "pages/manage-team/team-files/team-files.redux";
import { TeamListType } from "pages/manage-team/team.model";
import { FileType } from "pages/user-dashboard/dashboard.model";
import { deleteAllFile, downloadCSVData } from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useMemo, useState } from "react";
import { createPath, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import FileRenameModal from "src/core/components/modals/folder-file-rename-modal/rename-modal";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import {
  computeObligation,
  handleFileToOpen,
  setSelectedItems,
} from "src/pages/contract/contract.redux";
import LinkContractPopup from "src/pages/user-dashboard/components/link-contract/link-contract-popup";
import { ILocalStorageRouteData } from "src/pages/user-dashboard/dashboard-container";

interface OtherTeamFilesViewProps {
  isFilterActive?: boolean;
  localStorageRouteData?: any;
}

const OtherTeamFilesView: React.FC<OtherTeamFilesViewProps> = ({
  isFilterActive,
  localStorageRouteData,
}) => {
  const [teamData] = useLocalStorage<TeamListType>(LS_TEAM);
  const totalItems = useAppSelector((state) => state.teamDashboard.files.totct) as number;
  const isLoading = useAppSelector((state) => state.teamDashboard.files.isLoading);
  const itemsPerPage = useAppSelector((state) => state.teamDashboard.files.perpg);
  const currentPage = useAppSelector((state) => state.teamDashboard.files.pgn);
  const fileList = useAppSelector((state) => state.teamDashboard.fileList);
  const dispatch = useAppDispatch();
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const [auth] = useLocalStorage<AuthResponse>("auth");
  const navigate = useNavigate();
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [deleteFile, setDeleteFile] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType>();
  const [rows, setRows] = useState<Array<any>>([]);
  const [moveFileModal, setMoveFileModal] = useState(false);
  const [newFile, setNewFile] = useState<Array<number>>([]);
  const [linkContractPopup, setLinkContractPopup] = useState<boolean>(false);
  const [fileRename, setFileRename] = useState(false);
  const [existingFileName, setExistingFileName] = useState<any>({});

  const [selectAll, setSelectAll] = useState(false);
  const grcAuthority = useAuthorityCheck([USER_AUTHORITY.GRC]);

  const { selectedItems } = useAppSelector((state) => state.contract);

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
    setSelectAll(false);
  }, [fileList]);

  useEffect(() => {
    setSelectAll(false);
    dispatch(setSelectedItems([]));
  }, [localStorageRouteData]);

  useEffect(() => {
    const visibleItemIds = rows.map((item) => item.id);
    const allSelected = visibleItemIds.every((id) => selectedItems.includes(id));
    setSelectAll(allSelected);
  }, [rows, selectedItems]);

  const includeInGRC = () => {
    if (selectedItems.length > 0) {
      dispatch(computeObligation({ fileId: selectedItems.join(","), notificationType: "toast" }));
    }
  };

  const downloadBulkData = () => {
    if (selectedItems.length > 0) {
      dispatch(downloadCSVData({ fileIdCsv: selectedItems, teamId: teamData.id }));
    }
  };

  const deleteAllTeamFiles = async () => {
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;
    if (selectedItems.length > 0) {
      const res = await dispatch(deleteAllFile({ fileIds: selectedItems.join(","), folder }));
      if (res?.isSuccess && res.data) {
        await dispatch(getTeamFilesPerPage(teamData?.id, folder?.filePgn ?? 1, folder));
      }
    }
  };

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
        <div className="file-list-action capitalize">
          <div className="icon-option-wrap">
            <button className="icon-option-dot" onClick={(e) => handleFileOption(e, 0)}></button>
          </div>
          <div className="action-tool-tip">Bulk action</div>

          {activeFileOption === 0 && (
            <div className="dropdown-container">
              <div className="dropdown-box" style={{ width: "auto" }}>
                {selectedItems.length > 0 ? (
                  <ul>
                    {grcAuthority && (
                      <li onClick={includeInGRC} className={`border-bottom`}>
                        Include in GRC
                      </li>
                    )}
                    <li onClick={downloadBulkData} className={`border-bottom`}>
                      Download Data
                    </li>
                    <li onClick={deleteAllTeamFiles} className={`border-bottom`}>
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
    dispatch(
      setSelectedItems(
        selectedItems.includes(itemId)
          ? selectedItems.filter((id) => id !== itemId)
          : [...selectedItems, itemId],
      ),
    );
  };

  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });

    return () => {
      dispatch(setSelectedItems([]));
    };
  }, []);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage],
  );

  const location = useLocation();
  const routeDataMap = useMemo(
    () => location.state?.routeDataMap ?? {},
    [location.state?.routeDataMap],
  );
  const [searchParams] = useSearchParams();

  const navValue = searchParams.get("folders") || "";

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && currentPage !== newPage) {
      const folder = routeDataMap[navValue]
        ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
        : undefined;
      dispatch(getTeamFilesPerPage(teamData?.id, newPage, folder));
      const payload = {
        currentPage: newPage,
        folder,
        team: teamData,
      };
      if (isFilterActive) {
        dispatch(getFilterDataTeamDrive(payload));
      } else {
        if (!folder?.filePgn) {
          const updatedRouteData = routeDataMap[navValue].map((item: any) => {
            if (item.id === folder.id) {
              return {
                ...item,
                filePgn: newPage,
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
              routeDataMap: { ...location.state?.routeDataMap },
            },
          });
        } else {
          const updatedRouteData = routeDataMap[navValue].map((item: any) => {
            if (item.id === folder.id) {
              return {
                ...item,
                filePgn: newPage,
              };
            }
            return item;
          });
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
      }
    }
  };

  useEffect(() => {
    setRows(
      fileList?.map((data) =>
        dataGenerator({
          ...data,
          isNew: getIsNew(data),
        }),
      ),
    );
  }, [fileList, activeFileOption, selectedItems, newFile]);

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
              user?.logoUrl === "" ? getUsernameColor(user.userName) || "initial" : "initial",
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
    const folder = getFolderFromLocalStorage() as ILocalStorageRouteData;
    dispatch(getTeamFilesPerPage(teamData?.id, folder?.filePgn ?? 1, folder));
    setDeleteFile(false);
    setSelectedFile(undefined);
  };

  const handleCloseMoveModal = async () => {
    setDeleteFile(false);
    setSelectedFile(undefined);
  };
  const handleMoveFile = (item: FileType) => async (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    setActiveFileOption(-1);
    setMoveFileModal(true);
    setSelectedFile(item);
  };

  const getIsNew = (data: FileType) => {
    if (data.processStatus === 2) {
      const processStatusNew = localStorage.getItem("processStatusNew");

      if (processStatusNew) {
        try {
          // Try to parse the existing data as JSON
          const prevFileIds = JSON.parse(processStatusNew);
          // Check if the parsed data is an array
          if (Array.isArray(prevFileIds) && !prevFileIds.includes(data.id)) {
            // Update localStorage with the new array
            localStorage.setItem("processStatusNew", JSON.stringify([...prevFileIds, data.id]));
            // Update state with the new array
            setNewFile([...prevFileIds, data.id]);
          }
        } catch (error) {
          console.error("Error parsing existing data from localStorage:", error);
        }
      } else {
        // If there's no existing data, create a new array with the current data.id
        localStorage.setItem("processStatusNew", JSON.stringify([data.id]));
        setNewFile([data.id]);
      }

      return true;
    }
    return false;
  };

  const handleLinkContract = (e: any, data: any) => {
    e.stopPropagation();
    setSelectedFile(data);
    setActiveFileOption(-1);
    setLinkContractPopup(true);
  };

  useEffect(() => {
    if (newFile) {
      localStorage.removeItem("processStatusNew");
    }
  }, []);

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
    const folder = getFolderFromLocalStorage() as ILocalStorageRouteData;
    dispatch(getTeamFilesPerPage(teamData?.id, folder?.filePgn ?? 1, folder));
  };

  useEffect(() => {
    if (location.pathname === "/admin/team-files") {
      localStorage.setItem("previousPath", location.pathname);
    }

    const previousPath = localStorage.getItem("previousPath");
    if (
      previousPath === "/admin/team-files" &&
      !["/admin/team-files", "/admin/file"].includes(location.pathname)
    ) {
      localStorage.removeItem("previousPath");
    }
  }, [location.pathname, fileList]);

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
                    mimeType: (data as FileType).mimeType,
                    routeDataMap: location.state?.routeDataMap,
                  }),
                );
              }
            }}
            data-fulltext={data.fileName}
          >
            {newFile.includes(data.id) && <span className="new-file-upload">New -</span>}
            {data.processStatus === 4 && <span className="new-file-upload">Error -</span>}
            {data.fileName}
          </div>
          {(data as FileType).processStatus === 4 && (
            <div className="file-processing file-processing-wrap">
              <i className="icon-pro"></i>
              <div className="tool-file-error rounded-6">File not uploaded</div>
            </div>
          )}
          {(data as FileType).processStatus === 2 && (
            <div className="file-processing file-processing-wrap">
              <i className="icon-pro processing"></i>
              <div className="tool-file-error rounded-6">File is being processed</div>
            </div>
          )}
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
                                          ? getUsernameColor(user.userName) || "initial"
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
        <div className="file-list-action capitalize">
          <div className="icon-option-wrap">
            <button
              className="icon-option-dot"
              onClick={(e) => handleFileOption(e, data.id)}
            ></button>
          </div>
          <div className="action-tool-tip">More action</div>
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
                  {/* <li className="border-bottom">Move</li> */}
                  {data.processStatus === 3 && data.createdBy === auth.profileId ? (
                    <li className="border-bottom" onClick={handleMoveFile(data)}>
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

  return (
    <AnimatePresence mode="wait">
      {rows.length > 0 && (
        <section className="mb-5">
          <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
            files
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
              paginationData={{ totalItems, currentPage, itemsPerPage }}
              onPageChange={getCurrentPageNumber}
              enablePagination={totalPages > 1}
              enableGoToPagination={totalPages > 1}
              isLoading={isLoading}
            />
          </motion.div>
          {shareModal && selectedFile && (
            <ShareUserModal
              isOpen={shareModal}
              onClose={handleCloseShareModal}
              fileName={selectedFile?.fileName}
              store="teamDashboard"
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
              onlyFileDelete={true}
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

export default OtherTeamFilesView;
